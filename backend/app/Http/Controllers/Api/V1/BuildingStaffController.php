<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BuildingStaff;
use App\Models\StaffDutyLog;
use App\Services\Expense\ExpenseRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BuildingStaffController extends Controller
{
    /**
     * Display a listing of building staff.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BuildingStaff::with(['property', 'building', 'user']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->has('building_id')) {
            $query->where('building_id', $request->building_id);
        }

        if ($request->has('staff_role')) {
            $query->where('staff_role', $request->staff_role);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $staff = $query->orderBy('name')->get();

        return response()->json([
            'data' => $staff,
        ]);
    }

    /**
     * Store a newly created building staff member.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', $this->orgExists('properties')],
            'building_id' => ['nullable', $this->orgExists('buildings')],
            'user_id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'nid_number' => 'nullable|string|max:30',
            'is_caretaker' => 'required|boolean',
            'is_security_guard' => 'required|boolean',
            'is_agency_contracted' => 'boolean',
            'is_owner_manager' => 'boolean',
            'employment_type' => 'required|string|in:direct_employed,agency_contracted',
            'agency_name' => 'nullable|string|max:255',
            'shift_type' => 'required|string|in:day_shift,night_shift,24h_duty,rotation',
            'shift_hours' => 'nullable|string|max:100',
            'monthly_salary' => 'required|integer|min:0',
            'joining_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        // Compute staff_role dynamically from checkboxes
        $isCaretaker = (bool) $validated['is_caretaker'];
        $isGuard = (bool) $validated['is_security_guard'];
        $isOwner = (bool) ($validated['is_owner_manager'] ?? false);

        if ($isOwner) {
            $role = 'bariwala_manager';
        } elseif ($isCaretaker && $isGuard) {
            $role = 'guard_caretaker_dual';
        } elseif ($isGuard) {
            $role = 'security_guard';
        } else {
            $role = 'caretaker';
        }

        // Get organization_id from property
        $property = DB::table('properties')->where('id', $validated['property_id'])->first();

        $staff = BuildingStaff::create(array_merge($validated, [
            'organization_id' => $property->organization_id,
            'staff_role' => $role,
            'status' => 'active',
        ]));

        StaffDutyLog::create([
            'building_staff_id' => $staff->id,
            'action_type' => 'created',
            'new_role' => $role,
            'notes' => 'Staff profile created.',
        ]);

        return response()->json([
            'message' => 'Building staff registered successfully.',
            'data' => $staff->load(['property', 'building']),
        ], 201);
    }

    /**
     * Display the specified building staff member.
     */
    public function show(string $id): JsonResponse
    {
        $staff = BuildingStaff::with(['property', 'building', 'user', 'dutyLogs'])->findOrFail($id);

        return response()->json([
            'data' => $staff,
        ]);
    }

    /**
     * Update the specified building staff member.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $staff = BuildingStaff::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'nid_number' => 'nullable|string|max:30',
            'is_caretaker' => 'sometimes|boolean',
            'is_security_guard' => 'sometimes|boolean',
            'is_agency_contracted' => 'sometimes|boolean',
            'is_owner_manager' => 'sometimes|boolean',
            'employment_type' => 'sometimes|string|in:direct_employed,agency_contracted',
            'agency_name' => 'nullable|string|max:255',
            'shift_type' => 'sometimes|string|in:day_shift,night_shift,24h_duty,rotation',
            'shift_hours' => 'nullable|string|max:100',
            'monthly_salary' => 'sometimes|integer|min:0',
            'status' => 'sometimes|string|in:active,on_leave,rotated_out,resigned,terminated',
            'notes' => 'nullable|string',
        ]);

        $previousRole = $staff->staff_role;

        $isCaretaker = isset($validated['is_caretaker']) ? (bool) $validated['is_caretaker'] : $staff->is_caretaker;
        $isGuard = isset($validated['is_security_guard']) ? (bool) $validated['is_security_guard'] : $staff->is_security_guard;
        $isOwner = isset($validated['is_owner_manager']) ? (bool) $validated['is_owner_manager'] : $staff->is_owner_manager;

        if ($isOwner) {
            $newRole = 'bariwala_manager';
        } elseif ($isCaretaker && $isGuard) {
            $newRole = 'guard_caretaker_dual';
        } elseif ($isGuard) {
            $newRole = 'security_guard';
        } else {
            $newRole = 'caretaker';
        }

        $staff->update(array_merge($validated, [
            'staff_role' => $newRole,
        ]));

        if ($previousRole !== $newRole) {
            StaffDutyLog::create([
                'building_staff_id' => $staff->id,
                'action_type' => 'role_change',
                'previous_role' => $previousRole,
                'new_role' => $newRole,
                'notes' => "Role transitioned from {$previousRole} to {$newRole}.",
            ]);
        }

        return response()->json([
            'message' => 'Staff details updated successfully.',
            'data' => $staff->fresh(['property', 'building', 'dutyLogs']),
        ]);
    }

    /**
     * Remove the specified building staff member.
     */
    public function destroy(string $id): JsonResponse
    {
        $staff = BuildingStaff::findOrFail($id);
        $staff->delete();

        return response()->json([
            'message' => 'Building staff member removed.',
        ]);
    }

    /**
     * Process salary payment and record cash/MFS expense voucher.
     */
    public function paySalary(Request $request, string $id, ExpenseRecorder $recorder): JsonResponse
    {
        $staff = BuildingStaff::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'required|integer|min:1', // Poisha
            'payment_method' => 'required|string|in:cash,bkash,nagad,bank_transfer,cheque',
            'notes' => 'nullable|string',
        ]);

        // One transaction: a recorded salary must never exist without its duty
        // log, and vice versa.
        $expense = DB::transaction(function () use ($staff, $validated, $recorder) {
            $expense = $recorder->record([
                'organization_id' => $staff->organization_id,
                'property_id' => $staff->property_id,
                'building_id' => $staff->building_id,
                'category' => $staff->employment_type === 'agency_contracted'
                    ? 'security_agency_fee'
                    : 'staff_salary',
                'amount' => $validated['amount'],
                'vendor_name' => $staff->agency_name ?: $staff->name,
                'payment_method' => $validated['payment_method'],
                // `nullable` fields are absent from validated() when omitted,
                // not null — indexing them directly throws.
                'notes' => ($validated['notes'] ?? null)
                    ?: "Monthly salary payment for {$staff->name} ({$staff->staff_role})",
            ]);

            StaffDutyLog::create([
                'building_staff_id' => $staff->id,
                'action_type' => 'salary_paid',
                'amount_paid' => $validated['amount'],
                'payment_method' => $validated['payment_method'],
                'voucher_number' => $expense->expense_number,
                'notes' => "Salary payment processed via {$validated['payment_method']}. Voucher: {$expense->expense_number}",
            ]);

            return $expense;
        });

        return response()->json([
            'message' => 'Salary payment recorded and expense voucher generated.',
            'voucher_number' => $expense->expense_number,
            'expense' => $expense,
        ]);
    }
}
