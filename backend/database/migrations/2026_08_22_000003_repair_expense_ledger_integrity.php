<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Repairs the expense/ledger relationship.
 *
 * Three defects are addressed together because they share the same tables:
 *
 *  1. `ledger_entries` had no `expense_id`, yet Expense::ledgerEntries() is a
 *     hasMany that infers exactly that column — so loading the relation threw
 *     a SQL error and GET /api/v1/expenses/{id} returned a 500.
 *
 *  2. Expense vouchers were minted three different ways, two of them
 *     `rand(100, 999)`, with no constraint. Duplicate voucher numbers on
 *     accounting records were likely, not merely possible.
 *
 *  3. Only one of the three expense write paths created a ledger entry, so the
 *     cash-flow report — which sums expenses from `ledger_entries` — omitted
 *     staff salaries and vendor payments entirely.
 *
 * Existing rows are renumbered where they collide and backfilled where their
 * ledger entry is missing, so the constraint can be applied and the report
 * becomes correct for data already in the database.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Two call sites already pass building_id. It was not fillable and
            // the column did not exist, so the attribution was silently dropped.
            $table->foreignId('building_id')
                ->nullable()
                ->after('property_id')
                ->constrained('buildings')
                ->nullOnDelete();
        });

        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->foreignId('expense_id')
                ->nullable()
                ->after('invoice_id')
                ->constrained('expenses')
                ->nullOnDelete();

            $table->index(['organization_id', 'type', 'entry_date'], 'ledger_org_type_date_index');
        });

        $this->renumberDuplicateVouchers();

        Schema::table('expenses', function (Blueprint $table) {
            $table->unique(['organization_id', 'expense_number'], 'expenses_org_number_unique');
            $table->index(['organization_id', 'category'], 'expenses_org_category_index');
        });

        $this->backfillMissingLedgerEntries();
    }

    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            $table->dropUnique('expenses_org_number_unique');
            $table->dropIndex('expenses_org_category_index');
            $table->dropConstrainedForeignId('building_id');
        });

        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->dropIndex('ledger_org_type_date_index');
            $table->dropConstrainedForeignId('expense_id');
        });
    }

    /**
     * Give colliding vouchers fresh numbers so the unique index can be created.
     *
     * The oldest row in each collision keeps the number; later ones move to the
     * end of that month's sequence for their organization.
     */
    private function renumberDuplicateVouchers(): void
    {
        $duplicates = DB::table('expenses')
            ->select('organization_id', 'expense_number')
            ->groupBy('organization_id', 'expense_number')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        foreach ($duplicates as $duplicate) {
            $rows = DB::table('expenses')
                ->where('organization_id', $duplicate->organization_id)
                ->where('expense_number', $duplicate->expense_number)
                ->orderBy('id')
                ->pluck('id')
                ->skip(1); // the first keeps its number

            $prefix = $this->prefixOf($duplicate->expense_number);

            foreach ($rows as $id) {
                DB::table('expenses')
                    ->where('id', $id)
                    ->update(['expense_number' => $this->nextFreeNumber($duplicate->organization_id, $prefix)]);
            }
        }
    }

    /**
     * Write the ledger entry that should have been created alongside each
     * expense. Without this, historical payroll and vendor spend stays absent
     * from the cash-flow report even after the code is fixed.
     */
    private function backfillMissingLedgerEntries(): void
    {
        $missing = DB::table('expenses')
            ->leftJoin('ledger_entries', 'ledger_entries.expense_id', '=', 'expenses.id')
            ->whereNull('ledger_entries.id')
            ->whereNull('expenses.deleted_at')
            ->select(
                'expenses.id',
                'expenses.organization_id',
                'expenses.category',
                'expenses.amount',
                'expenses.expense_date',
                'expenses.expense_number',
                'expenses.vendor_name',
            )
            ->get();

        $now = now();

        foreach ($missing->chunk(500) as $chunk) {
            DB::table('ledger_entries')->insert(
                $chunk->map(fn ($expense) => [
                    'organization_id' => $expense->organization_id,
                    'expense_id' => $expense->id,
                    'payment_id' => null,
                    'invoice_id' => null,
                    'type' => 'expense',
                    'category' => $expense->category,
                    'amount' => $expense->amount,
                    'entry_date' => $expense->expense_date,
                    'description' => sprintf(
                        'Expense (%s) — %s [%s] (backfilled)',
                        $expense->category,
                        $expense->vendor_name ?: 'unspecified',
                        $expense->expense_number,
                    ),
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all()
            );
        }
    }

    private function prefixOf(string $expenseNumber): string
    {
        $position = strrpos($expenseNumber, '-');

        return $position === false ? 'EXP-' : substr($expenseNumber, 0, $position + 1);
    }

    private function nextFreeNumber(int $organizationId, string $prefix): string
    {
        $offset = strlen($prefix) + 1;

        // Read through an explicit alias: value(DB::raw(...)) resolves the
        // result property with Str::afterLast($column, '.'), so any raw
        // expression containing a dot silently returns null.
        $row = DB::table('expenses')
            ->where('organization_id', $organizationId)
            ->where('expense_number', 'like', $prefix.'%')
            ->selectRaw("MAX(CAST(SUBSTR(expense_number, {$offset}) AS INTEGER)) AS highest_sequence")
            ->first();

        $highest = (int) ($row->highest_sequence ?? 0);

        return $prefix.str_pad((string) ($highest + 1), 3, '0', STR_PAD_LEFT);
    }
};
