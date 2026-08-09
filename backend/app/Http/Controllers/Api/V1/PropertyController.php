<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\OrganizationMember;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    /**
     * Display a listing of properties for the organization.
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->query('organization_id');
        $user = $request->user();

        // Find active organization membership
        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $properties = Property::query()
            ->where('organization_id', $member->organization_id)
            ->withCount(['buildings', 'units'])
            ->withCount(['units as occupied_units_count' => function ($query) {
                $query->where('occupancy_status', 'occupied');
            }])
            ->get();

        return response()->json([
            'data' => $properties,
        ]);
    }

    /**
     * Store a newly created property.
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
            return response()->json(['message' => 'No active organization found.'], 400);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'area' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ]);

        $property = Property::create([
            'organization_id' => $member->organization_id,
            'name' => $request->name,
            'address' => $request->address,
            'city' => $request->city,
            'area' => $request->area,
            'description' => $request->description,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Property created successfully.',
            'data' => $property->loadCount(['buildings', 'units']),
        ], 201);
    }

    /**
     * Display the specified property with hierarchy.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $property = Property::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with(['buildings.floors.units'])
            ->withCount(['buildings', 'units'])
            ->withCount(['units as occupied_units_count' => function ($query) {
                $query->where('occupancy_status', 'occupied');
            }])
            ->findOrFail($id);

        return response()->json([
            'data' => $property,
        ]);
    }

    /**
     * Update the specified property.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $property = Property::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'area' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'in:active,inactive'],
        ]);

        $property->update($request->only('name', 'address', 'city', 'area', 'description', 'status'));

        return response()->json([
            'message' => 'Property updated successfully.',
            'data' => $property,
        ]);
    }

    /**
     * Remove the specified property (soft delete).
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $property = Property::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_owner', true);
            })
            ->findOrFail($id);

        $property->delete();

        return response()->json([
            'message' => 'Property deleted successfully.',
        ]);
    }
}
