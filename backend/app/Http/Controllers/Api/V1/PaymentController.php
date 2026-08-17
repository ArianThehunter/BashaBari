<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\LedgerEntry;
use App\Models\OrganizationMember;
use App\Models\Payment;
use App\Services\Payment\Drivers\MockSSLCommerzDriver;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Display listing of organization payments.
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->query('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $method = $request->query('payment_method');
        $status = $request->query('status');
        $search = $request->query('search');

        $query = Payment::query()
            ->where('organization_id', $member->organization_id)
            ->when($method, fn ($q) => $q->where('payment_method', $method))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('transaction_number', 'like', "%{$term}%")
                        ->orWhere('val_id', 'like', "%{$term}%")
                        ->orWhere('reference_number', 'like', "%{$term}%")
                        ->orWhereHas('tenant', fn ($t) => $t->where('name', 'like', "%{$term}%"));
                });
            })
            ->with(['tenant', 'unit', 'invoice'])
            ->latest('payment_date');

        $payments = $query->get();

        $totalCollectedPoisha = Payment::where('organization_id', $member->organization_id)
            ->where('status', 'completed')
            ->sum('amount');

        $totalRefundedPoisha = Payment::where('organization_id', $member->organization_id)
            ->where('status', 'refunded')
            ->sum('amount');

        return response()->json([
            'data' => $payments,
            'meta' => [
                'total_collected_poisha' => (int) $totalCollectedPoisha,
                'total_refunded_poisha' => (int) $totalRefundedPoisha,
            ],
        ]);
    }

    /**
     * Initiate SSLCommerz checkout session for an invoice.
     */
    public function initiateSslcommerz(Request $request): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->input('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $request->validate([
            'invoice_id' => ['required', 'exists:invoices,id'],
        ]);

        $invoice = Invoice::where('organization_id', $member->organization_id)
            ->findOrFail($request->invoice_id);

        if ($invoice->due_amount <= 0) {
            return response()->json(['message' => 'Invoice is already fully paid.'], 422);
        }

        $driver = new MockSSLCommerzDriver();
        $session = $driver->initiatePayment($invoice);

        // Store pending payment record
        Payment::create([
            'organization_id' => $member->organization_id,
            'invoice_id' => $invoice->id,
            'tenant_id' => $invoice->tenant_id,
            'unit_id' => $invoice->unit_id,
            'transaction_number' => $session['tran_id'],
            'payment_method' => 'sslcommerz',
            'amount' => $invoice->due_amount,
            'store_amount' => $invoice->due_amount,
            'currency' => 'BDT',
            'payment_date' => Carbon::today()->toDateString(),
            'status' => 'pending',
            'notes' => "SSLCommerz Checkout Session Initiated for Invoice #{$invoice->invoice_number}",
        ]);

        return response()->json([
            'status' => 'SUCCESS',
            'tran_id' => $session['tran_id'],
            'gateway_url' => $session['gateway_url'],
            'amount_bdt' => $session['amount_bdt'],
            'invoice_id' => $invoice->id,
        ]);
    }

    /**
     * Process SSLCommerz Payment IPN / Success callback.
     */
    public function sslcommerzSuccess(Request $request): JsonResponse
    {
        $request->validate([
            'tran_id' => ['required', 'string'],
        ]);

        $tranId = $request->tran_id;
        $lock = Cache::lock("payment_process_{$tranId}", 15);

        // Acquire lock with 5-second wait to prevent duplicate concurrent callback executions
        return $lock->block(5, function () use ($request, $tranId) {
            $payment = Payment::where('transaction_number', $tranId)->first();

            if (! $payment) {
                return response()->json(['message' => 'Payment transaction not found.'], 404);
            }

            if ($payment->status === 'completed') {
                return response()->json([
                    'message' => 'Payment already completed.',
                    'data' => $payment->load(['invoice', 'tenant']),
                ]);
            }

            $driver = new MockSSLCommerzDriver();
            $valId = $request->input('val_id') ?: 'VAL-SSL-'.Str::random(10);
            $verification = $driver->verifyPayment($valId, $request->all());

            return DB::transaction(function () use ($payment, $verification) {
                // Re-query with row lock inside transaction
                $lockedPayment = Payment::where('id', $payment->id)->lockForUpdate()->first();

                if ($lockedPayment->status === 'completed') {
                    return response()->json([
                        'message' => 'Payment already completed.',
                        'data' => $lockedPayment->load(['invoice', 'tenant']),
                    ]);
                }

                $lockedPayment->update([
                    'status' => 'completed',
                    'val_id' => $verification['val_id'],
                    'bank_tran_id' => $verification['bank_tran_id'],
                    'card_type' => $verification['card_type'],
                    'card_no' => $verification['card_no'],
                    'raw_response' => $verification['raw_payload'],
                ]);

                // Auto-reconcile invoice
                if ($lockedPayment->invoice_id) {
                    $invoice = Invoice::where('id', $lockedPayment->invoice_id)->lockForUpdate()->first();
                    if ($invoice) {
                        $newPaidAmount = $invoice->paid_amount + $lockedPayment->amount;
                        $newDueAmount = max(0, $invoice->total_amount - $newPaidAmount);
                        $newStatus = ($newDueAmount === 0) ? 'paid' : 'partially_paid';

                        $invoice->update([
                            'paid_amount' => $newPaidAmount,
                            'due_amount' => $newDueAmount,
                            'status' => $newStatus,
                        ]);
                    }
                }

                // Create double-entry ledger record
                LedgerEntry::create([
                    'organization_id' => $lockedPayment->organization_id,
                    'payment_id' => $lockedPayment->id,
                    'invoice_id' => $lockedPayment->invoice_id,
                    'type' => 'income',
                    'category' => 'rent',
                    'amount' => $lockedPayment->amount,
                    'entry_date' => Carbon::today()->toDateString(),
                    'description' => "Rent Payment via SSLCommerz ({$verification['card_type']}) - Tran #: {$lockedPayment->transaction_number}",
                ]);

                return response()->json([
                    'message' => 'SSLCommerz payment authorized & reconciled successfully.',
                    'data' => $lockedPayment->load(['invoice', 'tenant', 'unit']),
                ]);
            });
        });
    }

    /**
     * Record a manual offline payment (Cash, Bank Cheque, MFS Transfer).
     */
    public function store(Request $request): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->input('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $request->validate([
            'tenant_id' => ['required', 'exists:tenants,id'],
            'invoice_id' => ['nullable', 'exists:invoices,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'payment_method' => ['required', 'string', 'in:sslcommerz,bkash,nagad,rocket,bank_transfer,cash,cheque'],
            'amount_bdt' => ['required', 'numeric', 'min:1'],
            'payment_date' => ['required', 'date'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $amountPoisha = (int) round($request->amount_bdt * 100);
        $monthStr = Carbon::parse($request->payment_date)->format('Ym');
        $tranId = 'TRX-'.$monthStr.'-'.Str::padLeft((string) rand(100, 999), 3, '0');

        return DB::transaction(function () use ($request, $member, $amountPoisha, $tranId) {
            $payment = Payment::create([
                'organization_id' => $member->organization_id,
                'invoice_id' => $request->invoice_id,
                'tenant_id' => $request->tenant_id,
                'unit_id' => $request->unit_id,
                'transaction_number' => $tranId,
                'payment_method' => $request->payment_method,
                'amount' => $amountPoisha,
                'store_amount' => $amountPoisha,
                'currency' => 'BDT',
                'payment_date' => $request->payment_date,
                'status' => 'completed',
                'reference_number' => $request->reference_number,
                'notes' => $request->notes,
            ]);

            // Auto-reconcile invoice balance
            if ($request->invoice_id) {
                $invoice = Invoice::find($request->invoice_id);
                if ($invoice) {
                    $newPaidAmount = $invoice->paid_amount + $amountPoisha;
                    $newDueAmount = max(0, $invoice->total_amount - $newPaidAmount);
                    $newStatus = ($newDueAmount === 0) ? 'paid' : 'partially_paid';

                    $invoice->update([
                        'paid_amount' => $newPaidAmount,
                        'due_amount' => $newDueAmount,
                        'status' => $newStatus,
                    ]);
                }
            }

            // Create double-entry ledger entry
            LedgerEntry::create([
                'organization_id' => $member->organization_id,
                'payment_id' => $payment->id,
                'invoice_id' => $request->invoice_id,
                'type' => 'income',
                'category' => 'rent',
                'amount' => $amountPoisha,
                'entry_date' => $request->payment_date,
                'description' => "Manual Payment Received ({$request->payment_method}) - Tran #: {$tranId}",
            ]);

            return response()->json([
                'message' => 'Payment recorded successfully.',
                'data' => $payment->load(['invoice', 'tenant', 'unit']),
            ], 201);
        });
    }

    /**
     * Display specified payment.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $payment = Payment::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with(['organization', 'tenant', 'unit', 'invoice', 'ledgerEntries'])
            ->findOrFail($id);

        return response()->json(['data' => $payment]);
    }

    /**
     * Process BD-008 compliant payment refund.
     */
    public function refund(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $payment = Payment::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_owner', true);
            })
            ->findOrFail($id);

        if ($payment->status === 'refunded') {
            return response()->json(['message' => 'Payment is already refunded.'], 422);
        }

        return DB::transaction(function () use ($payment) {
            $payment->update(['status' => 'refunded']);

            // Record refund in double-entry ledger
            LedgerEntry::create([
                'organization_id' => $payment->organization_id,
                'payment_id' => $payment->id,
                'invoice_id' => $payment->invoice_id,
                'type' => 'refund',
                'category' => 'advance_rent',
                'amount' => $payment->amount,
                'entry_date' => Carbon::today()->toDateString(),
                'description' => "BD-008 Compliant Advance Rent Refund for Tran #: {$payment->transaction_number}",
            ]);

            return response()->json([
                'message' => 'Payment refunded successfully following BD-008 advance rent refund policy.',
                'data' => $payment,
            ]);
        });
    }
}
