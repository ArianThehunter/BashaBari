<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use App\Models\Tenant;
use App\Services\AuditLogService;
use App\Support\BusinessTime;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    /**
     * Display a listing of tenants for the active organization.
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

        $search = $request->query('search');
        $status = $request->query('status');

        $tenants = Tenant::query()
            ->where('organization_id', $member->organization_id)
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q, $term) {
                $q->where(function ($query) use ($term) {
                    $query->where('name', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%")
                        ->orWhere('nid_number', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%");
                });
            })
            ->latest()
            ->get();

        return response()->json([
            'data' => $tenants,
        ]);
    }

    /**
     * Store a newly created tenant profile.
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'nid_number' => ['nullable', 'string', 'max:50'],
            'passport_number' => ['nullable', 'string', 'max:50'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'permanent_address' => ['nullable', 'string'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'emergency_contact_relation' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'in:active,inactive,archived'],
        ]);

        $tenant = Tenant::create([
            'organization_id' => $member->organization_id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'nid_number' => $request->nid_number,
            'passport_number' => $request->passport_number,
            'father_name' => $request->father_name,
            'permanent_address' => $request->permanent_address,
            'occupation' => $request->occupation,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'emergency_contact_relation' => $request->emergency_contact_relation,
            'status' => $request->status ?: 'active',
        ]);

        return response()->json([
            'message' => 'Tenant created successfully.',
            'data' => $tenant,
        ], 201);
    }

    /**
     * Display specified tenant profile.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $tenant = Tenant::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        return response()->json([
            'data' => $tenant,
        ]);
    }

    /**
     * Update tenant profile.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $tenant = Tenant::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'nid_number' => ['nullable', 'string', 'max:50'],
            'passport_number' => ['nullable', 'string', 'max:50'],
            'father_name' => ['nullable', 'string', 'max:255'],
            'permanent_address' => ['nullable', 'string'],
            'occupation' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:30'],
            'emergency_contact_relation' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'in:active,inactive,archived'],
        ]);

        $tenant->update($request->only([
            'name',
            'email',
            'phone',
            'nid_number',
            'passport_number',
            'father_name',
            'permanent_address',
            'occupation',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relation',
            'status',
        ]));

        return response()->json([
            'message' => 'Tenant updated successfully.',
            'data' => $tenant,
        ]);
    }

    /**
     * Generate official Dhaka Metropolitan Police (DMP) Citizen Information Form data.
     */
    public function dmpForm(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $tenant = Tenant::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with(['leases.unit.property', 'leases.unit.building'])
            ->findOrFail($id);

        $activeLease = $tenant->leases->where('status', 'active')->first() ?: $tenant->leases->first();

        return response()->json([
            'title' => 'ঢাকা মেট্রোপলিটন পুলিশ (DMP) - ভাড়াটিয়া নিবন্ধন ফরম',
            'police_station' => 'স্থানীয় থানা (Local Thana)',
            'tenant' => [
                'name' => $tenant->name,
                'father_name' => $tenant->father_name ?: 'N/A',
                'nid_number' => $tenant->nid_number ?: 'N/A',
                'passport_number' => $tenant->passport_number ?: 'N/A',
                'phone' => $tenant->phone,
                'email' => $tenant->email ?: 'N/A',
                'occupation' => $tenant->occupation ?: 'N/A',
                'permanent_address' => $tenant->permanent_address ?: 'N/A',
                'emergency_contact' => "{$tenant->emergency_contact_name} ({$tenant->emergency_contact_phone} - {$tenant->emergency_contact_relation})",
            ],
            'flat_info' => [
                'property_name' => $activeLease?->unit?->property?->name ?: 'BashaBari Building',
                'address' => $activeLease?->unit?->property?->address ?: 'Dhaka, Bangladesh',
                'unit_number' => $activeLease?->unit?->unit_number ?: 'N/A',
                'rent_start_date' => $activeLease?->start_date ?: BusinessTime::todayString(),
            ],
        ]);
    }

    /**
     * Soft-delete tenant profile.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $tenant = Tenant::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        AuditLogService::log('tenant.deleted', $tenant, $tenant->toArray());
        $tenant->delete();

        return response()->json([
            'message' => 'Tenant deleted successfully.',
        ]);
    }
}
