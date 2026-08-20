<?php

namespace App\Services\Payment;

use App\Models\Invoice;
use App\Models\LedgerEntry;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Applies a payment to its invoice and writes the ledger.
 *
 * Shared by manual entry and gateway capture so the two cannot drift apart.
 */
class PaymentReconciler
{
    /**
     * Generate an unguessable transaction reference.
     *
     * The previous scheme was "TRX-YYYYMM-" plus rand(100,999): 900 values per
     * month, so an attacker could enumerate live transactions, and collisions
     * were near-certain at any real volume.
     */
    public static function newTransactionId(?Carbon $date = null): string
    {
        $date ??= Carbon::now('Asia/Dhaka');

        return 'TRX-'.$date->format('Ym').'-'.strtoupper(Str::random(4)).'-'.Str::uuid()->toString();
    }

    /**
     * Mark a payment captured and apply it to the invoice, inside one
     * transaction with the rows locked.
     *
     * Idempotent: a payment already in a terminal state is returned untouched.
     */
    public function capture(Payment $payment, array $gatewayFields = [], ?string $description = null): Payment
    {
        return DB::transaction(function () use ($payment, $gatewayFields, $description) {
            $locked = Payment::query()
                ->whereKey($payment->getKey())
                ->lockForUpdate()
                ->first();

            if (! $locked || $locked->status === 'completed') {
                return $locked ?? $payment;
            }

            $locked->update(array_merge($gatewayFields, ['status' => 'completed']));

            $this->applyToInvoice($locked);

            LedgerEntry::create([
                'organization_id' => $locked->organization_id,
                'payment_id' => $locked->id,
                'invoice_id' => $locked->invoice_id,
                'type' => 'income',
                'category' => 'rent',
                'amount' => $locked->amount,
                'entry_date' => $locked->payment_date ?? Carbon::today('Asia/Dhaka')->toDateString(),
                'description' => $description
                    ?? "Rent payment ({$locked->payment_method}) — Tran #: {$locked->transaction_number}",
            ]);

            return $locked->fresh();
        });
    }

    /**
     * Recompute an invoice's paid/due/status from its completed payments.
     *
     * Derived rather than incremented, so a retried callback or a corrected
     * payment row cannot drift the balance.
     */
    public function applyToInvoice(Payment $payment): void
    {
        if (! $payment->invoice_id) {
            return;
        }

        $invoice = Invoice::query()
            ->whereKey($payment->invoice_id)
            ->lockForUpdate()
            ->first();

        if (! $invoice) {
            return;
        }

        $paid = (int) Payment::query()
            ->where('invoice_id', $invoice->id)
            ->where('status', 'completed')
            ->sum('amount');

        $due = max(0, (int) $invoice->total_amount - $paid);

        $invoice->update([
            'paid_amount' => $paid,
            'due_amount' => $due,
            'status' => $this->deriveStatus($invoice->status, $paid, $due),
        ]);
    }

    /**
     * Invoice status implied by the money on it.
     *
     * `draft`, `overdue` and `cancelled` are set by other parts of the system
     * and are preserved when nothing has been paid — otherwise refunding the
     * last payment on an overdue invoice would quietly mark it merely unpaid.
     */
    private function deriveStatus(string $current, int $paid, int $due): string
    {
        if ($due === 0 && $paid > 0) {
            return 'paid';
        }

        if ($paid > 0) {
            return 'partially_paid';
        }

        return in_array($current, ['draft', 'overdue', 'cancelled'], true)
            ? $current
            : 'unpaid';
    }
}
