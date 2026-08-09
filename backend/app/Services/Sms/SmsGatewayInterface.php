<?php

namespace App\Services\Sms;

interface SmsGatewayInterface
{
    /**
     * Send an SMS notification to a Bangladesh mobile number.
     *
     * @param string $recipientPhone BD mobile number (e.g. 01711223344 or +8801711223344)
     * @param string $message Text message payload
     * @return bool True if dispatch succeeded
     */
    public function sendSms(string $recipientPhone, string $message): bool;
}
