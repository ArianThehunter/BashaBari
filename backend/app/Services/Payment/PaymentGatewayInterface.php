<?php

namespace App\Services\Payment;

use App\Models\Invoice;

interface PaymentGatewayInterface
{
    /**
     * Initiate payment session with gateway aggregator.
     */
    public function initiatePayment(Invoice $invoice, array $options = []): array;

    /**
     * Verify payment status using Gateway Validation ID / transaction payload.
     */
    public function verifyPayment(string $valId, array $postData = []): array;
}
