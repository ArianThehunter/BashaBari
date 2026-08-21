<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\InitiateSslcommerzRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Models\Invoice;
use App\Models\LedgerEntry;
use App\Models\Payment;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\PaymentReconciler;
use App\Support\BusinessTime;
use App\Support\OrganizationContext;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayInterface $gateway,
        private readonly PaymentReconciler $reconciler,
        private readonly OrganizationContext $context,
    ) {}

    /**
     * Paginated listing of the organization's payments.
     */
    public function index(Request $request): JsonResponse
    {
        $payments = Payment::query()
            ->when($request->query('payment_method'), fn ($q, $v) => $q->where('payment_method', $v))
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('search'), function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('transaction_number', 'like', "%{$term}%")
                        ->orWhere('val_id', 'like', "%{$term}%")
                        ->orWhere('reference_number', 'like', "%{$term}%")
                        ->orWhereHas('tenant', fn ($t) => $t->where('name', 'like', "%{$term}%"));
                });
            })
            ->with(['tenant', 'unit', 'invoice'])
            ->latest('payment_date')
            ->paginate($request->integer('per_page', 25))
            ->withQueryString();

        $totals = Payment::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as collected")
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount END), 0) as refunded")
            ->first();

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
                'total_collected_poisha' => (int) $totals->collected,
                'total_refunded_poisha' => (int) $totals->refunded,
            ],
        ]);
    }

    /**
     * Open a gateway checkout session for an invoice.
     */
    public function initiateSslcommerz(InitiateSslcommerzRequest $request): JsonResponse
    {
        // Org-scoped by the global scope; a foreign invoice id 404s.
        $invoice = Invoice::with('tenant')->findOrFail($request->validated('invoice_id'));

        if ($invoice->due_amount <= 0) {
            return response()->json(['message' => 'Invoice is already fully paid.'], 422);
        }

        $transactionId = PaymentReconciler::newTransactionId();

        $session = $this->gateway->initiatePayment($invoice, $transactionId);

        Payment::create([
            'organization_id' => $this->context->idOrFail(),
            'invoice_id' => $invoice->id,
            'tenant_id' => $invoice->tenant_id,
            'unit_id' => $invoice->unit_id,
            'transaction_number' => $transactionId,
            'payment_method' => $this->gateway->name(),
            'amount' => $invoice->due_amount,
            'store_amount' => $invoice->due_amount,
            'currency' => 'BDT',
            'payment_date' => BusinessTime::todayString(),
            'status' => 'pending',
            'notes' => "Checkout session opened for invoice #{$invoice->invoice_number}",
        ]);

        return response()->json([
            'status' => 'SUCCESS',
            'tran_id' => $transactionId,
            'gateway_url' => $session['gateway_url'],
            'amount_bdt' => round($invoice->due_amount / 100, 2),
            'invoice_id' => $invoice->id,
        ]);
    }

    /**
     * SSLCommerz IPN / return callback.
     *
     * Unauthenticated by necessity — the gateway posts server-to-server and has
     * no session. Authorization comes from the driver validating the callback
     * out-of-band; nothing here trusts the request body. The previous
     * implementation marked a payment captured on the strength of a posted
     * tran_id alone.
     */
    public function sslcommerzIpn(Request $request): JsonResponse
    {
        $validation = $this->gateway->validateCallback($request->all());

        if (! $validation->valid) {
            Log::warning('Rejected SSLCommerz callback', [
                'tran_id' => $validation->transactionId,
                'reason' => $validation->failureReason,
                'ip' => $request->ip(),
            ]);

            // Deliberately vague: do not confirm whether the transaction exists.
            return response()->json(['message' => 'Callback rejected.'], 422);
        }

        $tranId = $validation->transactionId;
        $lock = Cache::lock("payment_capture_{$tranId}", 15);

        return $lock->block(5, function () use ($validation, $tranId) {
            // No auth context here, so look the payment up across tenants, then
            // pin the organization for everything that follows.
            $payment = $this->context->withoutScope(
                fn () => Payment::query()->where('transaction_number', $tranId)->first()
            );

            if (! $payment) {
                Log::warning('SSLCommerz callback for unknown transaction', ['tran_id' => $tranId]);

                return response()->json(['message' => 'Callback rejected.'], 422);
            }

            if ($payment->status === 'completed') {
                return response()->json(['message' => 'Payment already recorded.']);
            }

            // The gateway is the authority on what was actually captured.
            if ($validation->amountPoisha !== (int) $payment->amount) {
                Log::critical('SSLCommerz amount mismatch', [
                    'tran_id' => $tranId,
                    'expected_poisha' => (int) $payment->amount,
                    'reported_poisha' => $validation->amountPoisha,
                ]);

                $payment->update(['status' => 'failed', 'notes' => 'Amount mismatch on gateway validation.']);

                return response()->json(['message' => 'Callback rejected.'], 422);
            }

            return $this->context->forOrganization($payment->organization_id, function () use ($payment, $validation) {
                $captured = $this->reconciler->capture($payment, [
                    'val_id' => $validation->valId,
                    'bank_tran_id' => $validation->bankTransactionId,
                    'card_type' => $validation->cardType,
                    'card_no' => $validation->cardNo,
                    'raw_response' => $validation->rawPayload,
                ], "Rent payment via SSLCommerz ({$validation->cardType}) — Tran #: {$payment->transaction_number}");

                return response()->json([
                    'message' => 'Payment validated and reconciled.',
                    'data' => ['transaction_number' => $captured->transaction_number, 'status' => $captured->status],
                ]);
            });
        });
    }

    /**
     * Record a manual offline payment (cash, cheque, bank or MFS transfer).
     */
    public function store(StorePaymentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $amountPoisha = (int) round($data['amount_bdt'] * 100);

        $payment = DB::transaction(function () use ($data, $amountPoisha) {
            $payment = Payment::create([
                'organization_id' => $this->context->idOrFail(),
                'invoice_id' => $data['invoice_id'] ?? null,
                'tenant_id' => $data['tenant_id'],
                'unit_id' => $data['unit_id'] ?? null,
                'transaction_number' => PaymentReconciler::newTransactionId(
                    Carbon::parse($data['payment_date'])
                ),
                'payment_method' => $data['payment_method'],
                'amount' => $amountPoisha,
                'store_amount' => $amountPoisha,
                'currency' => 'BDT',
                'payment_date' => $data['payment_date'],
                'status' => 'completed',
                'reference_number' => $data['reference_number'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->reconciler->applyToInvoice($payment);

            LedgerEntry::create([
                'organization_id' => $payment->organization_id,
                'payment_id' => $payment->id,
                'invoice_id' => $payment->invoice_id,
                'type' => 'income',
                'category' => 'rent',
                'amount' => $amountPoisha,
                'entry_date' => $data['payment_date'],
                'description' => "Manual payment ({$data['payment_method']}) — Tran #: {$payment->transaction_number}",
            ]);

            return $payment;
        });

        return response()->json([
            'message' => 'Payment recorded successfully.',
            'data' => $payment->load(['invoice', 'tenant', 'unit']),
        ], 201);
    }

    /**
     * Display a single payment.
     */
    public function show(string $id): JsonResponse
    {
        $payment = Payment::with(['tenant', 'unit', 'invoice', 'ledgerEntries'])->findOrFail($id);

        return response()->json(['data' => $payment]);
    }

    /**
     * Refund a payment under the BD-008 advance rent refund policy.
     */
    public function refund(Request $request, string $id): JsonResponse
    {
        $member = $this->context->member();

        // Refunds move money out; restrict to organization owners.
        if (! $request->user()?->isPlatformAdmin() && ! $member?->is_owner) {
            return response()->json([
                'message' => 'Only organization owners can issue refunds.',
            ], 403);
        }

        $payment = Payment::findOrFail($id);

        if ($payment->status === 'refunded') {
            return response()->json(['message' => 'Payment is already refunded.'], 422);
        }

        if ($payment->status !== 'completed') {
            return response()->json(['message' => 'Only completed payments can be refunded.'], 422);
        }

        $refunded = DB::transaction(function () use ($payment) {
            $locked = Payment::query()->whereKey($payment->getKey())->lockForUpdate()->first();

            if ($locked->status === 'refunded') {
                return $locked;
            }

            $locked->update(['status' => 'refunded']);

            // Reverse the invoice balance now this payment no longer counts.
            $this->reconciler->applyToInvoice($locked);

            LedgerEntry::create([
                'organization_id' => $locked->organization_id,
                'payment_id' => $locked->id,
                'invoice_id' => $locked->invoice_id,
                'type' => 'refund',
                'category' => 'advance_rent',
                'amount' => $locked->amount,
                'entry_date' => BusinessTime::todayString(),
                'description' => "BD-008 advance rent refund — Tran #: {$locked->transaction_number}",
            ]);

            return $locked->fresh();
        });

        return response()->json([
            'message' => 'Payment refunded under the BD-008 advance rent refund policy.',
            'data' => $refunded,
        ]);
    }
}
