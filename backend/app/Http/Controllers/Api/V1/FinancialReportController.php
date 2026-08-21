<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\LedgerEntry;
use App\Models\Payment;
use App\Services\Expense\ExpenseRecorder;
use App\Support\OrganizationContext;
use Illuminate\Http\JsonResponse;

class FinancialReportController extends Controller
{
    public function __construct(private readonly OrganizationContext $context) {}

    /**
     * Cash flow and revenue report.
     *
     * Every cash figure is read from `ledger_entries`, which is now the single
     * record of money in and out. Previously the totals came from the ledger
     * while the payroll and repair breakdowns came from the `expenses` table —
     * and because two of the three expense write paths never created a ledger
     * entry, the report displayed a payroll figure beside a net cash flow that
     * excluded it.
     */
    public function cashFlow(): JsonResponse
    {
        $orgId = $this->context->idOrFail();

        // One pass over the ledger instead of five aggregate queries.
        $ledger = LedgerEntry::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) AS income")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) AS expense")
            ->selectRaw("COALESCE(SUM(CASE WHEN type = 'refund' THEN amount END), 0) AS refund")
            ->selectRaw($this->sumWhereCategoryIn(ExpenseRecorder::PAYROLL_CATEGORIES, 'payroll'))
            ->selectRaw($this->sumWhereCategoryIn(ExpenseRecorder::REPAIR_CATEGORIES, 'repairs'))
            ->first();

        $income = (int) $ledger->income;
        $expense = (int) $ledger->expense;
        $refund = (int) $ledger->refund;

        // Refunds are money leaving the account, so they reduce cash flow, but
        // they are not an operating expense and are reported separately.
        $netCashFlow = $income - $expense - $refund;

        $billed = (int) Invoice::query()->where('status', '!=', 'cancelled')->sum('total_amount');
        $collected = (int) Invoice::query()->where('status', '!=', 'cancelled')->sum('paid_amount');

        $byMethod = Payment::query()
            ->where('status', 'completed')
            ->selectRaw('payment_method, card_type, SUM(amount) as total_amount')
            ->groupBy('payment_method', 'card_type')
            ->get();

        $recentLedger = LedgerEntry::query()
            ->latest('entry_date')
            ->latest('id')
            ->take(10)
            ->get();

        return response()->json([
            'summary' => [
                'total_income_poisha' => $income,
                'total_expense_poisha' => $expense,
                'total_refund_poisha' => $refund,
                'staff_payroll_expense_poisha' => (int) $ledger->payroll,
                'property_repair_expense_poisha' => (int) $ledger->repairs,
                'net_cash_flow_poisha' => $netCashFlow,
                'total_billed_poisha' => $billed,
                'total_collected_poisha' => $collected,
                'collection_rate_percentage' => $billed > 0
                    ? round(($collected / $billed) * 100, 2)
                    : 100.0,
            ],
            'channels' => $byMethod,
            'recent_ledger' => $recentLedger,
        ]);
    }

    /**
     * `SUM(amount) WHERE type = 'expense' AND category IN (...)` as a labelled
     * column. Categories come from a constant, never from request input.
     *
     * @param  array<int, string>  $categories
     */
    private function sumWhereCategoryIn(array $categories, string $alias): string
    {
        $list = implode(', ', array_map(fn (string $c) => "'".addslashes($c)."'", $categories));

        return "COALESCE(SUM(CASE WHEN type = 'expense' AND category IN ({$list}) THEN amount END), 0) AS {$alias}";
    }
}
