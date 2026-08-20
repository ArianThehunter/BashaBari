<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Invoice;
use App\Models\LedgerEntry;
use App\Models\OrganizationMember;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialReportController extends Controller
{
    /**
     * Generate financial cash flow & revenue accounting report.
     */
    public function cashFlow(Request $request): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->query('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $orgId = $member->organization_id;

        // Aggregate income & expenses from double-entry ledger
        $totalIncomePoisha = LedgerEntry::where('organization_id', $orgId)
            ->where('type', 'income')
            ->sum('amount');

        $totalExpensePoisha = LedgerEntry::where('organization_id', $orgId)
            ->whereIn('type', ['expense', 'refund'])
            ->sum('amount');

        $netCashFlowPoisha = $totalIncomePoisha - $totalExpensePoisha;

        // Revenue breakdown by payment method channel
        $byMethod = Payment::where('organization_id', $orgId)
            ->where('status', 'completed')
            ->selectRaw('payment_method, card_type, SUM(amount) as total_amount')
            ->groupBy('payment_method', 'card_type')
            ->get();

        // Calculate Collection Efficiency Percentage
        $totalBilledPoisha = Invoice::where('organization_id', $orgId)->where('status', '!=', 'cancelled')->sum('total_amount');
        $totalCollectedPoisha = Invoice::where('organization_id', $orgId)->where('status', '!=', 'cancelled')->sum('paid_amount');

        $collectionRate = $totalBilledPoisha > 0
            ? round(($totalCollectedPoisha / $totalBilledPoisha) * 100, 2)
            : 100.0;

        // Recent Ledger Transactions
        $recentLedger = LedgerEntry::where('organization_id', $orgId)
            ->latest('entry_date')
            ->take(10)
            ->get();

        $staffPayrollPoisha = Expense::where('organization_id', $orgId)
            ->where('category', 'staff_salary')
            ->sum('amount');

        $propertyRepairsPoisha = Expense::where('organization_id', $orgId)
            ->whereIn('category', ['repairs', 'maintenance', 'plumbing', 'electrical'])
            ->sum('amount');

        $netBankDepositSurplusPoisha = max(0, $totalCollectedPoisha - ($totalExpensePoisha));

        return response()->json([
            'summary' => [
                'total_income_poisha' => (int) $totalIncomePoisha,
                'total_expense_poisha' => (int) $totalExpensePoisha,
                'staff_payroll_expense_poisha' => (int) $staffPayrollPoisha,
                'property_repair_expense_poisha' => (int) $propertyRepairsPoisha,
                'net_bank_deposit_surplus_poisha' => (int) $netBankDepositSurplusPoisha,
                'net_cash_flow_poisha' => (int) $netCashFlowPoisha,
                'total_billed_poisha' => (int) $totalBilledPoisha,
                'total_collected_poisha' => (int) $totalCollectedPoisha,
                'collection_rate_percentage' => $collectionRate,
            ],
            'channels' => $byMethod,
            'recent_ledger' => $recentLedger,
        ]);
    }
}
