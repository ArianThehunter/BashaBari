<?php

namespace App\Services\Payment;

/**
 * The outcome of validating a gateway callback.
 *
 * Only the gateway (or, in the sandbox driver, a locally-signed payload) can
 * produce a valid result — never the raw request body.
 */
final class GatewayValidation
{
    public function __construct(
        public readonly bool $valid,
        public readonly string $transactionId,
        /** Amount the gateway says was actually captured, in poisha. */
        public readonly int $amountPoisha,
        public readonly string $currency = 'BDT',
        public readonly ?string $valId = null,
        public readonly ?string $bankTransactionId = null,
        public readonly ?string $cardType = null,
        public readonly ?string $cardNo = null,
        public readonly ?string $failureReason = null,
        public readonly array $rawPayload = [],
    ) {}

    public static function rejected(string $transactionId, string $reason, array $payload = []): self
    {
        return new self(
            valid: false,
            transactionId: $transactionId,
            amountPoisha: 0,
            failureReason: $reason,
            rawPayload: $payload,
        );
    }
}
