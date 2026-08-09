<?php

namespace App\Services\Payment\Drivers;

use App\Models\Invoice;
use App\Services\Payment\PaymentGatewayInterface;
use Carbon\Carbon;
use Illuminate\Support\Str;

class MockSSLCommerzDriver implements PaymentGatewayInterface
{
    /**
     * Initiate simulated SSLCommerz payment session.
     */
    public function initiatePayment(Invoice $invoice, array $options = []): array
    {
        $monthStr = Carbon::now()->format('Ym');
        $tranId = 'TRX-'.$monthStr.'-'.Str::padLeft((string) rand(100, 999), 3, '0');

        $baseUrl = config('app.frontend_url', 'http://localhost:3000');
        $gatewayUrl = "{$baseUrl}/payments/sslcommerz-checkout?tran_id={$tranId}&invoice_id={$invoice->id}";

        return [
            'status' => 'SUCCESS',
            'tran_id' => $tranId,
            'gateway_url' => $gatewayUrl,
            'amount_bdt' => $invoice->due_amount / 100,
            'currency' => 'BDT',
            'store_id' => config('services.sslcommerz.store_id', 'bariwalahub_mock_store'),
        ];
    }

    /**
     * Verify simulated SSLCommerz payment validation payload.
     */
    public function verifyPayment(string $valId, array $postData = []): array
    {
        $cardType = $postData['card_type'] ?? 'BKASH-BKASH';
        $bankTranId = $postData['bank_tran_id'] ?? 'BANK-'.Carbon::now()->format('YmdHis').rand(10, 99);
        $cardNo = $postData['card_no'] ?? '0171****890';

        return [
            'status' => 'VALIDATED',
            'val_id' => $valId ?: 'VAL-SSL-'.Str::random(10),
            'bank_tran_id' => $bankTranId,
            'card_type' => $cardType,
            'card_no' => $cardNo,
            'currency' => 'BDT',
            'raw_payload' => $postData,
        ];
    }
}
