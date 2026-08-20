<?php

namespace App\Services\Invoice;

use App\Models\Invoice;
use Illuminate\Support\Facades\DB;

/**
 * Allocates sequential per-organization invoice numbers (INV-YYYYMM-NNN).
 *
 * Replaces three copies of `count(...) + 1`, which:
 *   - raced under concurrent generation (the scheduled command and the API
 *     endpoint can both run), producing duplicates;
 *   - reused numbers after a soft delete, because the deleted rows dropped out
 *     of the count while remaining in the table.
 *
 * The sequence is derived from the highest suffix ever issued (soft-deleted
 * rows included), read under a row lock. A unique index on
 * (organization_id, invoice_number) is the backstop.
 */
class InvoiceNumberGenerator
{
    public function prefix(int $year, int $month): string
    {
        return sprintf('INV-%04d%02d-', $year, $month);
    }

    /**
     * Next available number for the organization and billing period.
     *
     * Call inside a transaction — the lock is only meaningful there.
     */
    public function next(int $organizationId, int $year, int $month): string
    {
        $prefix = $this->prefix($year, $month);

        $highest = $this->highestSequence($organizationId, $prefix);

        return $prefix.str_pad((string) ($highest + 1), 3, '0', STR_PAD_LEFT);
    }

    /**
     * Allocate a batch of consecutive numbers in one read.
     *
     * @return array<int, string>
     */
    public function nextBatch(int $organizationId, int $year, int $month, int $count): array
    {
        $prefix = $this->prefix($year, $month);
        $highest = $this->highestSequence($organizationId, $prefix);

        $numbers = [];
        for ($i = 1; $i <= $count; $i++) {
            $numbers[] = $prefix.str_pad((string) ($highest + $i), 3, '0', STR_PAD_LEFT);
        }

        return $numbers;
    }

    /**
     * Highest numeric suffix issued under this prefix, including trashed rows.
     */
    private function highestSequence(int $organizationId, string $prefix): int
    {
        $offset = strlen($prefix) + 1;

        $value = Invoice::query()
            ->withoutGlobalScope('organization')
            ->withTrashed()
            ->where('organization_id', $organizationId)
            ->where('invoice_number', 'like', $prefix.'%')
            ->lockForUpdate()
            ->value(DB::raw("MAX(CAST(SUBSTR(invoice_number, {$offset}) AS INTEGER))"));

        return (int) ($value ?? 0);
    }
}
