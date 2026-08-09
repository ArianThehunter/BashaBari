<?php

namespace App\Services\Sms\Drivers;

use App\Services\Sms\SmsGatewayInterface;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MockBDSmsDriver implements SmsGatewayInterface
{
    /**
     * Send simulated SMS to Bangladesh telcos (Banglalink, Robi, Teletalk, Grameenphone, Airtel).
     */
    public function sendSms(string $recipientPhone, string $message): bool
    {
        $cleanPhone = preg_replace('/[^0-9]/', '', $recipientPhone);
        $referenceId = 'SMS-BD-' . Str::upper(Str::random(10));

        Log::info("MockBDSmsDriver: Dispatched SMS alert to [{$cleanPhone}]", [
            'reference_id' => $referenceId,
            'recipient' => $cleanPhone,
            'message' => $message,
            'operator' => $this->detectOperator($cleanPhone),
            'timestamp' => now()->toIso8601String(),
        ]);

        return true;
    }

    /**
     * Detect Bangladesh mobile operator prefix.
     */
    private function detectOperator(string $phone): string
    {
        if (str_contains($phone, '017') || str_contains($phone, '013')) return 'Grameenphone';
        if (str_contains($phone, '018') || str_contains($phone, '016')) return 'Robi / Airtel';
        if (str_contains($phone, '019') || str_contains($phone, '014')) return 'Banglalink';
        if (str_contains($phone, '015')) return 'Teletalk';

        return 'BD Telco';
    }
}
