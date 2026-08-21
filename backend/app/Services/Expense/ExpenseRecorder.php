<?php

namespace App\Services\Expense;

use App\Models\Expense;
use App\Models\LedgerEntry;
use App\Services\Numbering\SequentialDocumentNumber;
use App\Support\BusinessTime;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * The single way an expense is recorded.
 *
 * Previously there were three. Only ExpenseController wrote a matching ledger
 * entry; staff salaries and vendor payments created an `expenses` row and
 * nothing else. Because the cash-flow report sums expenses from
 * `ledger_entries`, payroll and vendor spend were missing from it entirely —
 * the report showed a payroll figure taken from the `expenses` table directly
 * beside a net cash flow that excluded it.
 *
 * Every caller now goes through record(), which allocates the voucher number,
 * writes the expense and writes the ledger entry in one transaction.
 */
class ExpenseRecorder
{
    /**
     * Categories that may be stored on an expense.
     *
     * The financial report buckets on these, so a category written by one code
     * path and unknown to the report silently disappears from the breakdown.
     */
    public const CATEGORIES = [
        'plumbing',
        'electrical',
        'painting',
        'elevator',
        'cleaning',
        'repairs',
        'maintenance',
        'utility_bill',
        'staff_salary',
        'security_agency_fee',
        'tax',
        'other',
    ];

    /** Categories the report counts as staff cost. */
    public const PAYROLL_CATEGORIES = ['staff_salary', 'security_agency_fee'];

    /** Categories the report counts as repairs and upkeep. */
    public const REPAIR_CATEGORIES = [
        'repairs', 'maintenance', 'plumbing', 'electrical', 'painting', 'elevator',
    ];

    public function __construct(private readonly SequentialDocumentNumber $numbers) {}

    /**
     * Record an expense and its ledger entry.
     *
     * @param  array{
     *     organization_id: int,
     *     amount: int,
     *     category: string,
     *     property_id?: int|null,
     *     building_id?: int|null,
     *     unit_id?: int|null,
     *     maintenance_request_id?: int|null,
     *     expense_date?: string|null,
     *     vendor_name?: string|null,
     *     payment_method?: string|null,
     *     receipt_reference?: string|null,
     *     notes?: string|null,
     * }  $attributes
     */
    public function record(array $attributes): Expense
    {
        $organizationId = (int) $attributes['organization_id'];
        $amount = (int) $attributes['amount'];
        $category = $attributes['category'];

        // Business date, not the UTC date: an expense entered at 01:00 Dhaka
        // belongs to today, and `now()->toDateString()` would file it yesterday.
        $expenseDate = $attributes['expense_date'] ?? BusinessTime::todayString();

        return DB::transaction(function () use ($organizationId, $amount, $category, $expenseDate, $attributes) {
            $expenseNumber = $this->nextNumber($organizationId, $expenseDate);

            $expense = Expense::create([
                'organization_id' => $organizationId,
                'property_id' => $attributes['property_id'] ?? null,
                'building_id' => $attributes['building_id'] ?? null,
                'unit_id' => $attributes['unit_id'] ?? null,
                'maintenance_request_id' => $attributes['maintenance_request_id'] ?? null,
                'expense_number' => $expenseNumber,
                'category' => $category,
                'amount' => $amount,
                'expense_date' => $expenseDate,
                'vendor_name' => $attributes['vendor_name'] ?? null,
                'payment_method' => $attributes['payment_method'] ?? 'cash',
                'receipt_reference' => $attributes['receipt_reference'] ?? $expenseNumber,
                'notes' => $attributes['notes'] ?? null,
            ]);

            LedgerEntry::create([
                'organization_id' => $organizationId,
                'expense_id' => $expense->id,
                'type' => 'expense',
                'category' => $category,
                'amount' => $amount,
                'entry_date' => $expenseDate,
                'description' => $this->describe($expense),
            ]);

            return $expense;
        });
    }

    /**
     * Voucher number for the month the expense falls in — EXP-YYYYMM-NNN.
     */
    public function nextNumber(int $organizationId, string $expenseDate): string
    {
        $date = CarbonImmutable::parse($expenseDate);

        return $this->numbers->next(
            Expense::query()
                ->withoutGlobalScope('organization')
                ->withTrashed()
                ->where('organization_id', $organizationId),
            'expense_number',
            sprintf('EXP-%04d%02d-', $date->year, $date->month),
        );
    }

    private function describe(Expense $expense): string
    {
        $vendor = $expense->vendor_name ?: 'unspecified';

        return "Expense ({$expense->category}) — {$vendor} [{$expense->expense_number}]";
    }
}
