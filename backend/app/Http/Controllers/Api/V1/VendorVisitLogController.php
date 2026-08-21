<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\VendorVisitLog;
use App\Services\Expense\ExpenseRecorder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorVisitLogController extends Controller
{
    /**
     * Display a listing of vendor/technician visit logs.
     */
    public function index(Request $request): JsonResponse
    {
        $query = VendorVisitLog::with(['property', 'building', 'recordedByStaff', 'recordedByUser']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->has('building_id')) {
            $query->where('building_id', $request->building_id);
        }

        if ($request->has('service_category')) {
            $query->where('service_category', $request->service_category);
        }

        $logs = $query->orderBy('entry_time', 'desc')->get();

        return response()->json([
            'data' => $logs,
        ]);
    }

    /**
     * Store a new technician visit log entry.
     */
    public function store(Request $request, ExpenseRecorder $recorder): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', $this->orgExists('properties')],
            'building_id' => ['nullable', $this->orgExists('buildings')],
            'recorded_by_staff_id' => ['nullable', $this->orgExists('building_staff')],
            'technician_name' => 'required|string|max:255',
            'technician_phone' => 'required|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'service_category' => 'required|string|in:plumbing,electrical,elevator,tank_cleaning,generator,painting,pest_control,other',
            'entry_time' => 'required|date',
            'exit_time' => 'nullable|date|after_or_equal:entry_time',
            'purpose_of_visit' => 'required|string',
            'amount_paid' => 'nullable|integer|min:0',
            'payment_method' => 'nullable|string|in:cash,bkash,nagad,bank_transfer,cheque',
            'receipt_reference' => 'nullable|string|max:100',
        ]);

        $property = Property::findOrFail($validated['property_id']);

        // The log and any spot-cash expense are one unit of work.
        $log = DB::transaction(function () use ($validated, $property, $request, $recorder) {
            $log = VendorVisitLog::create(array_merge($validated, [
                'organization_id' => $property->organization_id,
                'recorded_by_user_id' => $request->user()?->id,
                'status' => isset($validated['exit_time']) ? 'completed' : 'in_progress',
            ]));

            if (! empty($validated['amount_paid']) && $validated['amount_paid'] > 0) {
                $recorder->record([
                    'organization_id' => $property->organization_id,
                    'property_id' => $validated['property_id'],
                    'building_id' => $validated['building_id'] ?? null,
                    'category' => $this->expenseCategoryFor($validated['service_category']),
                    'amount' => (int) $validated['amount_paid'],
                    'vendor_name' => ($validated['company_name'] ?? null) ?: $validated['technician_name'],
                    'payment_method' => $validated['payment_method'] ?? 'cash',
                    'receipt_reference' => $validated['receipt_reference'] ?? null,
                    'notes' => "Service visit: {$validated['purpose_of_visit']} by {$validated['technician_name']}",
                ]);
            }

            return $log;
        });

        return response()->json([
            'message' => 'Technician visit log recorded successfully.',
            'data' => $log->load(['property', 'building', 'recordedByStaff']),
        ], 201);
    }

    /**
     * Display the specified visit log.
     */
    public function show(string $id): JsonResponse
    {
        $log = VendorVisitLog::with(['property', 'building', 'recordedByStaff', 'recordedByUser'])->findOrFail($id);

        return response()->json([
            'data' => $log,
        ]);
    }

    /**
     * Update the specified visit log.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $log = VendorVisitLog::findOrFail($id);

        $validated = $request->validate([
            'exit_time' => 'nullable|date',
            'amount_paid' => 'nullable|integer|min:0',
            'payment_method' => 'nullable|string|in:cash,bkash,nagad,bank_transfer,cheque',
            'receipt_reference' => 'nullable|string|max:100',
            'status' => 'sometimes|string|in:in_progress,completed,cancelled',
        ]);

        $log->update($validated);

        return response()->json([
            'message' => 'Technician visit log updated.',
            'data' => $log->fresh(['property', 'building', 'recordedByStaff']),
        ]);
    }

    /**
     * Remove the specified visit log.
     */
    public function destroy(string $id): JsonResponse
    {
        $log = VendorVisitLog::findOrFail($id);
        $log->delete();

        return response()->json([
            'message' => 'Visit log entry removed.',
        ]);
    }

    /**
     * Map a visit's service category onto an expense category.
     *
     * Anything without a direct equivalent books as repairs.
     */
    private function expenseCategoryFor(string $serviceCategory): string
    {
        return in_array($serviceCategory, ExpenseRecorder::CATEGORIES, true)
            ? $serviceCategory
            : 'repairs';
    }
}
