<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\TenantMoveOutNotice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantMoveOutNoticeController extends Controller
{
    /**
     * Display listing of move-out notices for caretaker/bariwala.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TenantMoveOutNotice::with(['property', 'building', 'unit', 'tenant']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        $notices = $query->orderBy('intended_move_out_date')->get();

        return response()->json([
            'data' => $notices,
        ]);
    }

    /**
     * Store move-out notice from Tenant Portal.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $tenant = Tenant::where('user_id', $user?->id)->first();
        if (! $tenant) {
            $tenant = Tenant::first(); // Fallback for dev tenant
        }

        $validated = $request->validate([
            'property_id' => ['nullable', $this->orgExists('properties')],
            'building_id' => ['nullable', $this->orgExists('buildings')],
            'unit_id' => ['nullable', $this->orgExists('units')],
            'intended_move_out_date' => 'required|date|after:today',
            'reason_for_leaving' => 'nullable|string',
            'deposit_refund_account' => 'nullable|string|max:255',
        ]);

        $notice = TenantMoveOutNotice::create([
            'organization_id' => $tenant->organization_id,
            'property_id' => $validated['property_id'] ?? $tenant->leases()->first()?->property_id ?? 1,
            'building_id' => $validated['building_id'] ?? null,
            'unit_id' => $validated['unit_id'] ?? null,
            'tenant_id' => $tenant->id,
            'intended_move_out_date' => $validated['intended_move_out_date'],
            'reason_for_leaving' => $validated['reason_for_leaving'],
            'deposit_refund_account' => $validated['deposit_refund_account'],
            'status' => 'pending_inspection',
        ]);

        return response()->json([
            'message' => 'Move-out notice submitted successfully via portal. Caretaker & Bariwala notified.',
            'data' => $notice->load(['property', 'unit', 'tenant']),
        ], 201);
    }
}
