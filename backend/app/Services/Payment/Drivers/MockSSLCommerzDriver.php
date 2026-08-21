<?php

namespace App\Services\Payment\Drivers;

use App\Models\Invoice;
use App\Services\Payment\GatewayValidation;
use App\Services\Payment\PaymentGatewayInterface;
use Illuminate\Support\Str;

/**
 * Sandbox SSLCommerz driver for local development and tests.
 *
 * It does not call SSLCommerz, but it does *not* rubber-stamp callbacks either:
 * the checkout URL carries an HMAC over (tran_id, amount) keyed on the store
 * password, and validateCallback() recomputes it. A caller who cannot sign a
 * payload cannot mark a payment as captured — the same property the live driver
 * gets from the validation API.
 *
 * This keeps the sandbox on the same code path as production, so the fake
 * gateway cannot hide an authorization hole.
 */
class MockSSLCommerzDriver implements PaymentGatewayInterface
{
    public function name(): string
    {
        return 'sslcommerz';
    }

    public function initiatePayment(Invoice $invoice, string $transactionId, array $options = []): array
    {
        $amountPoisha = (int) $invoice->due_amount;
        $signature = $this->sign($transactionId, $amountPoisha);

        $baseUrl = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');

        $query = http_build_query([
            'tran_id' => $transactionId,
            'invoice_id' => $invoice->id,
            'amount' => number_format($amountPoisha / 100, 2, '.', ''),
            'signature' => $signature,
        ]);

        return [
            'gateway_url' => "{$baseUrl}/payments/sslcommerz-checkout?{$query}",
            'session_key' => 'SANDBOX-'.Str::random(20),
            'raw' => [
                'sandbox' => true,
                'store_id' => config('services.sslcommerz.store_id'),
            ],
        ];
    }

    public function validateCallback(array $payload): GatewayValidation
    {
        $tranId = (string) ($payload['tran_id'] ?? '');
        $signature = (string) ($payload['signature'] ?? '');

        if ($tranId === '' || $signature === '') {
            return GatewayValidation::rejected($tranId, 'Missing tran_id or signature.', $payload);
        }

        // Amount arrives in BDT from the gateway; convert to poisha.
        $amountPoisha = (int) round(((float) ($payload['amount'] ?? 0)) * 100);

        if (! hash_equals($this->sign($tranId, $amountPoisha), $signature)) {
            return GatewayValidation::rejected($tranId, 'Signature mismatch.', $payload);
        }

        return new GatewayValidation(
            valid: true,
            transactionId: $tranId,
            amountPoisha: $amountPoisha,
            currency: (string) ($payload['currency'] ?? 'BDT'),
            valId: (string) ($payload['val_id'] ?? 'VAL-SANDBOX-'.substr(hash('sha256', $tranId), 0, 12)),
            bankTransactionId: (string) ($payload['bank_tran_id'] ?? 'BANK-SANDBOX-'.substr(hash('sha256', $tranId), 12, 12)),
            cardType: (string) ($payload['card_type'] ?? 'BKASH-BKASH'),
            cardNo: (string) ($payload['card_no'] ?? '01XX****XXX'),
            rawPayload: $payload,
        );
    }

    /**
     * Deterministic HMAC binding a transaction to its amount.
     */
    private function sign(string $transactionId, int $amountPoisha): string
    {
        // `config(key, default)` would not help here: the key exists and is
        // null when the env var is unset, so fall back explicitly.
        $secret = config('services.sslcommerz.store_passwd') ?: config('app.key');

        return hash_hmac('sha256', $transactionId.'|'.$amountPoisha, (string) $secret);
    }
}
