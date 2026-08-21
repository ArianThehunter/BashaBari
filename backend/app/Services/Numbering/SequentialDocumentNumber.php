<?php

namespace App\Services\Numbering;

use Illuminate\Database\Eloquent\Builder;

/**
 * Allocates per-organization sequential document numbers (PREFIX-NNN).
 *
 * Replaces two broken schemes:
 *
 *   - `count(...) + 1`, which raced under concurrency and reused a number
 *     after a soft delete dropped the row out of the count, and
 *   - `rand(100, 999)`, which had 900 possible values per month and no
 *     constraint behind it.
 *
 * The sequence is derived from the highest suffix ever issued — trashed rows
 * included — read under a row lock. Callers must hold a transaction; the lock
 * means nothing outside one. A unique index on (organization_id, <column>) is
 * the backstop.
 */
class SequentialDocumentNumber
{
    /**
     * Next available number for a prefix.
     *
     * @param  Builder  $query  Base query over the owning model, already
     *                          unscoped and including trashed rows.
     */
    public function next(Builder $query, string $column, string $prefix): string
    {
        return $prefix.$this->pad($this->highest($query, $column, $prefix) + 1);
    }

    /**
     * A run of consecutive numbers from one read.
     *
     * @return array<int, string>
     */
    public function nextBatch(Builder $query, string $column, string $prefix, int $count): array
    {
        if ($count < 1) {
            return [];
        }

        $highest = $this->highest($query, $column, $prefix);

        return array_map(
            fn (int $i) => $prefix.$this->pad($highest + $i),
            range(1, $count),
        );
    }

    private function pad(int $sequence): string
    {
        return str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Highest numeric suffix issued under this prefix.
     *
     * SUBSTR and CAST are spelled the same way in PostgreSQL and SQLite, so
     * this works on both production and the test database.
     *
     * The result is read through an explicit alias rather than
     * `value(DB::raw(...))`: `value()` resolves the property with
     * `Str::afterLast($column, '.')`, so any raw expression containing a dot —
     * a table-qualified column, for instance — silently returns null.
     */
    private function highest(Builder $query, string $column, string $prefix): int
    {
        $offset = strlen($prefix) + 1;
        $table = $query->getModel()->getTable();

        $row = $query
            ->where($column, 'like', $prefix.'%')
            ->lockForUpdate()
            ->selectRaw("MAX(CAST(SUBSTR({$table}.{$column}, {$offset}) AS INTEGER)) AS highest_sequence")
            ->first();

        return (int) ($row->highest_sequence ?? 0);
    }
}
