<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\OrganizationMember;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeaseController extends Controller
{
    /**
     * Display a listing of leases for the active organization.
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

        $status = $request->query('status');
        $unitId = $request->query('unit_id');
        $tenantId = $request->query('tenant_id');

        $query = Lease::query()
            ->where('organization_id', $member->organization_id)
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($unitId, fn ($q) => $q->where('unit_id', $unitId))
            ->when($tenantId, fn ($q) => $q->where('tenant_id', $tenantId))
            ->with(['unit.property', 'unit.building', 'tenant'])
            ->latest();

        $leases = $query->get();

        // Calculate total monthly active rent roll (in poisha)
        $totalRentRollPoisha = Lease::where('organization_id', $member->organization_id)
            ->where('status', 'active')
            ->sum('rent_amount');

        return response()->json([
            'data' => $leases,
            'meta' => [
                'total_rent_roll_poisha' => (int) $totalRentRollPoisha,
                'active_leases_count' => Lease::where('organization_id', $member->organization_id)->where('status', 'active')->count(),
            ],
        ]);
    }

    /**
     * Store a newly created digital lease agreement.
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
            'unit_id' => ['required', 'exists:units,id'],
            'tenant_id' => ['required', 'exists:tenants,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'rent_amount' => ['required', 'numeric', 'min:0'], // Integer poisha
            'security_deposit' => ['nullable', 'numeric', 'min:0'], // Integer poisha
            'advance_rent' => ['nullable', 'numeric', 'min:0'], // Integer poisha
            'billing_day' => ['nullable', 'integer', 'min:1', 'max:31'],
            'terms_and_conditions' => ['nullable', 'string'],
        ]);

        $unit = Unit::where('id', $request->unit_id)
            ->where('organization_id', $member->organization_id)
            ->firstOrFail();

        $tenant = Tenant::where('id', $request->tenant_id)
            ->where('organization_id', $member->organization_id)
            ->firstOrFail();

        return DB::transaction(function () use ($request, $member, $unit, $tenant) {
            $lease = Lease::create([
                'organization_id' => $member->organization_id,
                'unit_id' => $unit->id,
                'tenant_id' => $tenant->id,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'rent_amount' => (int) round($request->rent_amount),
                'security_deposit' => (int) round($request->security_deposit ?: 0),
                'advance_rent' => (int) round($request->advance_rent ?: 0),
                'billing_day' => $request->billing_day ?: 1,
                'status' => 'active',
                'terms_and_conditions' => $request->terms_and_conditions,
            ]);

            // Auto-sync flat unit occupancy status -> 'occupied'
            $unit->update(['occupancy_status' => 'occupied']);

            return response()->json([
                'message' => 'Lease agreement created successfully.',
                'data' => $lease->load(['unit.property', 'tenant']),
            ], 201);
        });
    }

    /**
     * Display specified lease details.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $lease = Lease::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with(['unit.property', 'unit.building', 'unit.floor', 'tenant'])
            ->findOrFail($id);

        return response()->json([
            'data' => $lease,
        ]);
    }

    /**
     * Update lease terms.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $lease = Lease::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        $request->validate([
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'rent_amount' => ['required', 'numeric', 'min:0'],
            'security_deposit' => ['nullable', 'numeric', 'min:0'],
            'advance_rent' => ['nullable', 'numeric', 'min:0'],
            'billing_day' => ['required', 'integer', 'min:1', 'max:31'],
            'terms_and_conditions' => ['nullable', 'string'],
        ]);

        $lease->update([
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'rent_amount' => (int) round($request->rent_amount),
            'security_deposit' => (int) round($request->security_deposit ?: 0),
            'advance_rent' => (int) round($request->advance_rent ?: 0),
            'billing_day' => $request->billing_day,
            'terms_and_conditions' => $request->terms_and_conditions,
        ]);

        return response()->json([
            'message' => 'Lease contract updated successfully.',
            'data' => $lease->load(['unit.property', 'tenant']),
        ]);
    }

    /**
     * Terminate an active lease contract (auto-syncs unit status back to 'vacant').
     */
    public function terminate(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $lease = Lease::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with('unit')
            ->findOrFail($id);

        $request->validate([
            'termination_reason' => ['required', 'string', 'max:500'],
        ]);

        return DB::transaction(function () use ($lease, $request) {
            $lease->update([
                'status' => 'terminated',
                'terminated_at' => now(),
                'termination_reason' => $request->termination_reason,
            ]);

            // Auto-sync flat unit occupancy status back to 'vacant'
            if ($lease->unit) {
                $lease->unit->update(['occupancy_status' => 'vacant']);
            }

            \App\Services\AuditLogService::log('lease.terminated', $lease, [], $lease->toArray());

            return response()->json([
                'message' => 'Lease contract terminated successfully.',
                'data' => $lease->load(['unit.property', 'tenant']),
            ]);
        });
    }

    /**
     * Soft-delete lease contract.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $lease = Lease::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_owner', true);
            })
            ->findOrFail($id);

        $lease->delete();

        return response()->json([
            'message' => 'Lease contract deleted successfully.',
        ]);
    }
}
