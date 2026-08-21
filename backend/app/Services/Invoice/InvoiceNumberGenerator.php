<?php

namespace App\Services\Invoice;

use App\Models\Invoice;
use App\Services\Numbering\SequentialDocumentNumber;

/**
 * Allocates per-organization invoice numbers (INV-YYYYMM-NNN).
 *
 * The allocation itself lives in SequentialDocumentNumber, shared with expense
 * vouchers. Call inside a transaction — the row lock means nothing outside one.
 */
class InvoiceNumberGenerator
{
    public function __construct(private readonly SequentialDocumentNumber $numbers) {}

    public function prefix(int $year, int $month): string
    {
        return sprintf('INV-%04d%02d-', $year, $month);
    }

    public function next(int $organizationId, int $year, int $month): string
    {
        return $this->numbers->next(
            $organizationId,
            $this->scope($organizationId),
            'invoice_number',
            $this->prefix($year, $month),
        );
    }

    /**
     * @return array<int, string>
     */
    public function nextBatch(int $organizationId, int $year, int $month, int $count): array
    {
        return $this->numbers->nextBatch(
            $organizationId,
            $this->scope($organizationId),
            'invoice_number',
            $this->prefix($year, $month),
            $count,
        );
    }

    /**
     * Every invoice the organization has ever issued, including trashed rows —
     * a soft-deleted invoice must not free its number for reuse.
     */
    private function scope(int $organizationId)
    {
        return Invoice::query()
            ->withoutGlobalScope('organization')
            ->withTrashed()
            ->where('organization_id', $organizationId);
    }
}
