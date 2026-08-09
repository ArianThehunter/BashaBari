<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceRequest;
use App\Models\OrganizationMember;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaintenanceRequestController extends Controller
{
    /**
     * Display a listing of maintenance requests for active organization.
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
        $priority = $request->query('priority');
        $category = $request->query('category');
        $search = $request->query('search');

        $query = MaintenanceRequest::query()
            ->where('organization_id', $member->organization_id)
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($priority, fn ($q) => $q->where('priority', $priority))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($search, function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('title', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%")
                        ->orWhere('assigned_vendor_name', 'like', "%{$term}%");
                });
            })
            ->with(['property', 'building', 'unit', 'tenant', 'reporter', 'expenses'])
            ->latest();

        $tickets = $query->get();

        return response()->json([
            'data' => $tickets,
            'meta' => [
                'total_tickets' => $tickets->count(),
                'pending_count' => $tickets->where('status', 'pending')->count(),
                'in_progress_count' => $tickets->where('status', 'in_progress')->count(),
                'emergency_count' => $tickets->where('priority', 'emergency')->count(),
            ],
        ]);
    }

    /**
     * Store a newly created maintenance request.
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
            'property_id' => ['required', 'exists:properties,id'],
            'building_id' => ['nullable', 'exists:buildings,id'],
            'unit_id' => ['nullable', 'exists:units,id'],
            'tenant_id' => ['nullable', 'exists:tenants,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'category' => ['required', 'string', 'in:plumbing,electrical,painting,elevator,cleaning,repairs,other'],
            'priority' => ['required', 'string', 'in:low,medium,high,emergency'],
            'estimated_cost_bdt' => ['nullable', 'numeric', 'min:0'],
            'assigned_vendor_name' => ['nullable', 'string', 'max:255'],
            'assigned_vendor_phone' => ['nullable', 'string', 'max:50'],
        ]);

        $estimatedPoisha = (int) round(($request->estimated_cost_bdt ?: 0) * 100);

        $ticket = MaintenanceRequest::create([
            'organization_id' => $member->organization_id,
            'property_id' => $request->property_id,
            'building_id' => $request->building_id,
            'unit_id' => $request->unit_id,
            'tenant_id' => $request->tenant_id,
            'reported_by_user_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'priority' => $request->priority,
            'status' => 'pending',
            'estimated_cost_amount' => $estimatedPoisha,
            'actual_cost_amount' => 0,
            'assigned_vendor_name' => $request->assigned_vendor_name,
            'assigned_vendor_phone' => $request->assigned_vendor_phone,
        ]);

        return response()->json([
            'message' => 'Maintenance request ticket created successfully.',
            'data' => $ticket->load(['property', 'unit', 'reporter']),
        ], 201);
    }

    /**
     * Display specified maintenance request.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $ticket = MaintenanceRequest::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with(['property', 'building', 'unit', 'tenant', 'reporter', 'expenses'])
            ->findOrFail($id);

        return response()->json(['data' => $ticket]);
    }

    /**
     * Update specified maintenance request status or cost.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $ticket = MaintenanceRequest::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        $request->validate([
            'status' => ['sometimes', 'string', 'in:pending,in_progress,completed,cancelled'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high,emergency'],
            'actual_cost_bdt' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'assigned_vendor_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'assigned_vendor_phone' => ['sometimes', 'nullable', 'string', 'max:50'],
        ]);

        $data = $request->only(['status', 'priority', 'assigned_vendor_name', 'assigned_vendor_phone']);

        if ($request->has('actual_cost_bdt')) {
            $data['actual_cost_amount'] = (int) round(($request->actual_cost_bdt ?: 0) * 100);
        }

        if ($request->status === 'completed' && ! $ticket->resolved_at) {
            $data['resolved_at'] = Carbon::now();
        }

        $ticket->update($data);

        return response()->json([
            'message' => 'Maintenance request ticket updated successfully.',
            'data' => $ticket->load(['property', 'unit', 'expenses']),
        ]);
    }

    /**
     * Soft-delete maintenance request.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $ticket = MaintenanceRequest::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_owner', true);
            })
            ->findOrFail($id);

        $ticket->delete();

        return response()->json(['message' => 'Maintenance request deleted successfully.']);
    }

    /**
     * Escalate an unresolved maintenance request directly to Property Owner (Bariwala).
     */
    public function escalate(Request $request, string $id): JsonResponse
    {
        $ticket = MaintenanceRequest::findOrFail($id);

        $request->validate([
            'reason' => 'required|string',
            'escalated_by' => 'required|string|in:tenant,caretaker',
        ]);

        $ticket->update([
            'is_escalated_to_owner' => true,
            'escalated_by' => $request->escalated_by,
            'escalation_reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Maintenance request escalated directly to Property Owner (Bariwala).',
            'data' => $ticket->load(['property', 'building', 'unit', 'reporter']),
        ]);
    }
}
