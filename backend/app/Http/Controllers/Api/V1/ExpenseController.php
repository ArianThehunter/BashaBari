<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\LedgerEntry;
use App\Models\OrganizationMember;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ExpenseController extends Controller
{
    /**
     * Display a listing of property operating expenses for active organization.
     */
    public function index(Request $request): JsonResponse
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

        $category = $request->query('category');
        $propertyId = $request->query('property_id');
        $search = $request->query('search');

        $query = Expense::query()
            ->where('organization_id', $member->organization_id)
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($propertyId, fn ($q) => $q->where('property_id', $propertyId))
            ->when($search, function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('expense_number', 'like', "%{$term}%")
                        ->orWhere('vendor_name', 'like', "%{$term}%")
                        ->orWhere('notes', 'like', "%{$term}%");
                });
            })
            ->with(['property', 'unit', 'maintenanceRequest'])
            ->latest('expense_date');

        $expenses = $query->get();

        $totalExpensesPoisha = Expense::where('organization_id', $member->organization_id)->sum('amount');

        return response()->json([
            'data' => $expenses,
            'meta' => [
                'total_expenses_poisha' => (int) $totalExpensesPoisha,
                'total_records' => $expenses->count(),
            ],
        ]);
    }

    /**
     * Store a newly logged property operating expense.
     */
    public function store(Request $request): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->input('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $request->validate([
            'property_id' => ['nullable', 'exists:properties,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'maintenance_request_id' => ['nullable', 'exists:maintenance_requests,id'],
            'category' => ['required', 'string', 'in:plumbing,electrical,painting,elevator,cleaning,repairs,utility_bill,tax,other'],
            'amount_bdt' => ['required', 'numeric', 'min:1'],
            'expense_date' => ['required', 'date'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'string', 'in:cash,bkash,nagad,bank_transfer,cheque'],
            'receipt_reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $amountPoisha = (int) round($request->amount_bdt * 100);
        $monthStr = Carbon::parse($request->expense_date)->format('Ym');
        $prefix = "EXP-{$monthStr}-";
        $count = Expense::where('organization_id', $member->organization_id)
            ->where('expense_number', 'like', "{$prefix}%")
            ->count();

        $seq = Str::padLeft((string) ($count + 1), 3, '0');
        $expenseNumber = "{$prefix}{$seq}";

        return DB::transaction(function () use ($request, $member, $amountPoisha, $expenseNumber) {
            $expense = Expense::create([
                'organization_id' => $member->organization_id,
                'property_id' => $request->property_id,
                'unit_id' => $request->unit_id,
                'maintenance_request_id' => $request->maintenance_request_id,
                'expense_number' => $expenseNumber,
                'category' => $request->category,
                'amount' => $amountPoisha,
                'expense_date' => $request->expense_date,
                'vendor_name' => $request->vendor_name,
                'payment_method' => $request->payment_method,
                'receipt_reference' => $request->receipt_reference,
                'notes' => $request->notes,
            ]);

            // Double-entry general ledger entry
            LedgerEntry::create([
                'organization_id' => $member->organization_id,
                'type' => 'expense',
                'category' => $request->category,
                'amount' => $amountPoisha,
                'entry_date' => $request->expense_date,
                'description' => "Property Expense ({$request->category}) - Vendor: ".($request->vendor_name ?: 'N/A')." [{$expenseNumber}]",
            ]);

            return response()->json([
                'message' => 'Property expense logged successfully.',
                'data' => $expense->load(['property', 'unit', 'maintenanceRequest']),
            ], 201);
        });
    }

    /**
     * Display specified property expense.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $expense = Expense::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with(['property', 'unit', 'maintenanceRequest', 'ledgerEntries'])
            ->findOrFail($id);

        return response()->json(['data' => $expense]);
    }

    /**
     * Soft-delete expense.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $expense = Expense::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_owner', true);
            })
            ->findOrFail($id);

        $expense->delete();

        return response()->json(['message' => 'Expense deleted successfully.']);
    }
}
