<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Building;
use App\Models\Floor;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuildingController extends Controller
{
    /**
     * Store a newly created building under a property.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'property_id' => ['required', 'exists:properties,id'],
            'name' => ['required', 'string', 'max:255'],
            'total_floors' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $property = Property::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($request->property_id);

        $building = Building::create([
            'property_id' => $property->id,
            'organization_id' => $property->organization_id,
            'name' => $request->name,
            'total_floors' => $request->total_floors,
        ]);

        // Auto-create default floors if total_floors is specified
        if ($request->total_floors) {
            for ($i = 0; $i < $request->total_floors; $i++) {
                $floorName = $i === 0 ? 'Ground Floor' : "Floor {$i}";
                Floor::create([
                    'building_id' => $building->id,
                    'organization_id' => $property->organization_id,
                    'name' => $floorName,
                    'floor_number' => $i,
                ]);
            }
        }

        return response()->json([
            'message' => 'Building created successfully.',
            'data' => $building->load('floors'),
        ], 201);
    }

    /**
     * Update specified building.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $building = Building::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'total_floors' => ['nullable', 'integer', 'min:1'],
        ]);

        $building->update($request->only('name', 'total_floors'));

        return response()->json([
            'message' => 'Building updated successfully.',
            'data' => $building,
        ]);
    }

    /**
     * Remove building.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $building = Building::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        $building->delete();

        return response()->json([
            'message' => 'Building deleted successfully.',
        ]);
    }
}
