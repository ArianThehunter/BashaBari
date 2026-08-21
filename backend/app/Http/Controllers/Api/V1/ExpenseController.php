<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\OrganizationMember;
use App\Services\Expense\ExpenseRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

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
    public function store(Request $request, ExpenseRecorder $recorder): JsonResponse
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
            'property_id' => ['nullable', $this->orgExists('properties')],
            'unit_id' => ['nullable', $this->orgExists('units')],
            'maintenance_request_id' => ['nullable', $this->orgExists('maintenance_requests')],
            'category' => ['required', 'string', Rule::in(ExpenseRecorder::CATEGORIES)],
            'amount_bdt' => ['required', 'numeric', 'min:1'],
            'expense_date' => ['required', 'date'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'payment_method' => ['required', 'string', 'in:cash,bkash,nagad,bank_transfer,cheque'],
            'receipt_reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $amountPoisha = (int) round($request->amount_bdt * 100);

        // ExpenseRecorder allocates the voucher number under a lock and writes
        // the matching ledger entry in the same transaction.
        $expense = $recorder->record([
            'organization_id' => $member->organization_id,
            'property_id' => $request->property_id,
            'unit_id' => $request->unit_id,
            'maintenance_request_id' => $request->maintenance_request_id,
            'category' => $request->category,
            'amount' => $amountPoisha,
            'expense_date' => $request->expense_date,
            'vendor_name' => $request->vendor_name,
            'payment_method' => $request->payment_method,
            'receipt_reference' => $request->receipt_reference,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Property expense logged successfully.',
            'data' => $expense->load(['property', 'unit', 'maintenanceRequest']),
        ], 201);
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
