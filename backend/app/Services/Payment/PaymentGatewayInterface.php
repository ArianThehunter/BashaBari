<?php

namespace App\Services\Payment;

use App\Models\Invoice;

interface PaymentGatewayInterface
{
    /**
     * Open a checkout session for an invoice.
     *
     * @param  string  $transactionId  Server-generated, unguessable reference.
     * @return array{gateway_url: string, session_key: string|null, raw: array}
     */
    public function initiatePayment(Invoice $invoice, string $transactionId, array $options = []): array;

    /**
     * Validate a callback/IPN payload against the gateway.
     *
     * Implementations MUST verify out-of-band (a server-to-server validation
     * call, or a signature the caller cannot forge). Returning a result built
     * from the posted fields alone is not an implementation of this contract.
     */
    public function validateCallback(array $payload): GatewayValidation;

    /**
     * Identifier stored on the payment row ("sslcommerz").
     */
    public function name(): string;
}
