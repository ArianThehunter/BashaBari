<?php

namespace App\Services\Payment\Drivers;

use App\Models\Invoice;
use App\Services\Payment\GatewayValidation;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Live SSLCommerz driver.
 *
 * Callback payloads are never trusted. The IPN only supplies a val_id; the
 * capture is confirmed by a server-to-server call to the validation API, and
 * the amount used for reconciliation is the one SSLCommerz reports, not the one
 * the caller posted.
 */
class SSLCommerzDriver implements PaymentGatewayInterface
{
    public function name(): string
    {
        return 'sslcommerz';
    }

    public function initiatePayment(Invoice $invoice, string $transactionId, array $options = []): array
    {
        $response = Http::asForm()
            ->timeout(20)
            ->retry(2, 250)
            ->post($this->baseUrl().'/gwprocess/v4/api.php', [
                'store_id' => $this->storeId(),
                'store_passwd' => $this->storePassword(),
                'total_amount' => number_format($invoice->due_amount / 100, 2, '.', ''),
                'currency' => 'BDT',
                'tran_id' => $transactionId,
                'success_url' => route('sslcommerz.ipn'),
                'fail_url' => route('sslcommerz.ipn'),
                'cancel_url' => route('sslcommerz.ipn'),
                'ipn_url' => route('sslcommerz.ipn'),
                'cus_name' => $invoice->tenant?->name ?? 'Tenant',
                'cus_email' => $invoice->tenant?->email ?? 'noreply@bashabari.com',
                'cus_phone' => $invoice->tenant?->phone ?? '',
                'shipping_method' => 'NO',
                'product_name' => 'Rent Invoice '.$invoice->invoice_number,
                'product_category' => 'Rent',
                'product_profile' => 'non-physical-goods',
            ]);

        $body = $response->json() ?? [];

        if (! $response->successful() || ($body['status'] ?? '') !== 'SUCCESS') {
            Log::error('SSLCommerz session creation failed', [
                'tran_id' => $transactionId,
                'invoice_id' => $invoice->id,
                'status' => $body['status'] ?? null,
                'reason' => $body['failedreason'] ?? null,
            ]);

            throw new \RuntimeException('Unable to open a payment session with SSLCommerz.');
        }

        return [
            'gateway_url' => $body['GatewayPageURL'],
            'session_key' => $body['sessionkey'] ?? null,
            'raw' => $body,
        ];
    }

    public function validateCallback(array $payload): GatewayValidation
    {
        $tranId = (string) ($payload['tran_id'] ?? '');
        $valId = (string) ($payload['val_id'] ?? '');

        if ($tranId === '' || $valId === '') {
            return GatewayValidation::rejected($tranId, 'Missing tran_id or val_id.', $payload);
        }

        $response = Http::timeout(20)
            ->retry(2, 250)
            ->get($this->baseUrl().'/validator/api/validationserverAPI.php', [
                'val_id' => $valId,
                'store_id' => $this->storeId(),
                'store_passwd' => $this->storePassword(),
                'format' => 'json',
            ]);

        if (! $response->successful()) {
            return GatewayValidation::rejected($tranId, 'Validation API unreachable.', $payload);
        }

        $body = $response->json() ?? [];
        $status = $body['status'] ?? '';

        if (! in_array($status, ['VALID', 'VALIDATED'], true)) {
            return GatewayValidation::rejected($tranId, "Gateway reported status [{$status}].", $body);
        }

        // The gateway echoes the transaction id it validated; a mismatch means
        // the caller is replaying someone else's val_id.
        if (! hash_equals((string) ($body['tran_id'] ?? ''), $tranId)) {
            return GatewayValidation::rejected($tranId, 'Validated transaction id does not match.', $body);
        }

        return new GatewayValidation(
            valid: true,
            transactionId: $tranId,
            amountPoisha: (int) round(((float) ($body['currency_amount'] ?? $body['amount'] ?? 0)) * 100),
            currency: (string) ($body['currency_type'] ?? $body['currency'] ?? 'BDT'),
            valId: $valId,
            bankTransactionId: $body['bank_tran_id'] ?? null,
            cardType: $body['card_type'] ?? null,
            cardNo: $body['card_no'] ?? null,
            rawPayload: $body,
        );
    }

    private function baseUrl(): string
    {
        return rtrim((string) config('services.sslcommerz.base_url'), '/');
    }

    private function storeId(): string
    {
        return (string) config('services.sslcommerz.store_id');
    }

    private function storePassword(): string
    {
        return (string) config('services.sslcommerz.store_passwd');
    }
}
