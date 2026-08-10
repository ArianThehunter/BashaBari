<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Floor;
use App\Models\OrganizationMember;
use App\Models\Unit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    /**
     * Display a listing of units in the active organization.
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
            return response()->json(['message' => 'No active organization found.'], 400);
        }

        $units = Unit::query()
            ->where('organization_id', $member->organization_id)
            ->when($request->query('property_id'), fn ($q, $id) => $q->where('property_id', $id))
            ->when($request->query('building_id'), fn ($q, $id) => $q->where('building_id', $id))
            ->when($request->query('unit_type'), fn ($q, $type) => $q->where('unit_type', $type))
            ->when($request->query('occupancy_status'), fn ($q, $status) => $q->where('occupancy_status', $status))
            ->with(['property', 'building', 'floor'])
            ->get();

        return response()->json([
            'data' => $units,
        ]);
    }

    /**
     * Store a newly created flat unit.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'floor_id' => ['required', 'exists:floors,id'],
            'unit_number' => ['required', 'string', 'max:50'],
            'unit_type' => ['required', 'in:residential,commercial,garage,storage'],
            'occupancy_type' => ['nullable', 'in:tenant_occupied,flat_owner_occupied,bariwala_occupied'],
            'garage_type' => ['nullable', 'in:none,bike,car,both'],
            'bike_count' => ['nullable', 'integer', 'min:0', 'max:2'],
            'car_count' => ['nullable', 'integer', 'min:0', 'max:2'],
            'service_charge_amount' => ['nullable', 'numeric', 'min:0'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'area_sqft' => ['nullable', 'numeric', 'min:0'],
            'base_rent_amount' => ['required', 'numeric', 'min:0'], // Pass raw poisha or BDT
            'occupancy_status' => ['nullable', 'in:vacant,occupied,maintenance,reserved'],
            'notes' => ['nullable', 'string'],
        ]);

        $bikeCount = (int) ($request->bike_count ?: 0);
        $carCount = (int) ($request->car_count ?: 0);

        if (($bikeCount + $carCount) > 2) {
            return response()->json([
                'message' => 'Vehicle Limit Error: Maximum 2 vehicles total (bikes/cars combined) permitted per flat unit.',
            ], 422);
        }

        $floor = Floor::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with('building.property')
            ->findOrFail($request->floor_id);

        $building = $floor->building;
        $property = $building->property;

        $occupancyType = $request->occupancy_type ?: 'tenant_occupied';
        
        // If flat owner or Bariwala lives in unit, base rent is ৳0
        $baseRentPoisha = in_array($occupancyType, ['flat_owner_occupied', 'bariwala_occupied']) ? 0 : (int) round($request->base_rent_amount);

        // Garage fee calculation: 1 Bike = ৳700 (70000 poisha), 1 Car = ৳1,200 (120000 poisha)
        $garageFeePoisha = ($bikeCount * 70000) + ($carCount * 120000);
        $garageType = 'none';
        if ($bikeCount > 0 && $carCount > 0) $garageType = 'both';
        else if ($bikeCount > 0) $garageType = 'bike';
        else if ($carCount > 0) $garageType = 'car';

        // Mandatory Service Charge: ৳2,000 = 200,000 poisha for all units
        $serviceChargePoisha = $request->service_charge_amount !== null ? (int) round($request->service_charge_amount) : 200000;

        $unit = Unit::create([
            'floor_id' => $floor->id,
            'building_id' => $building->id,
            'property_id' => $property->id,
            'organization_id' => $property->organization_id,
            'unit_number' => $request->unit_number,
            'unit_type' => $request->unit_type,
            'occupancy_type' => $occupancyType,
            'service_charge_amount' => $serviceChargePoisha,
            'garage_type' => $garageType,
            'garage_fee_amount' => $garageFeePoisha,
            'bedrooms' => $request->bedrooms,
            'bathrooms' => $request->bathrooms,
            'area_sqft' => $request->area_sqft,
            'base_rent_amount' => $baseRentPoisha,
            'occupancy_status' => $request->occupancy_status ?: 'vacant',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Unit created successfully with flat ownership & garage fee rules.',
            'data' => $unit->load(['property', 'building', 'floor']),
        ], 201);
    }

    /**
     * Update unit details.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $unit = Unit::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        $request->validate([
            'unit_number' => ['required', 'string', 'max:50'],
            'unit_type' => ['required', 'in:residential,commercial,garage,storage'],
            'occupancy_type' => ['nullable', 'in:tenant_occupied,flat_owner_occupied,bariwala_occupied'],
            'garage_type' => ['nullable', 'in:none,bike,car,both'],
            'service_charge_amount' => ['nullable', 'numeric', 'min:0'],
            'bedrooms' => ['nullable', 'integer', 'min:0'],
            'bathrooms' => ['nullable', 'integer', 'min:0'],
            'area_sqft' => ['nullable', 'numeric', 'min:0'],
            'base_rent_amount' => ['required', 'numeric', 'min:0'],
            'occupancy_status' => ['required', 'in:vacant,occupied,maintenance,reserved'],
            'notes' => ['nullable', 'string'],
        ]);

        $occupancyType = $request->occupancy_type ?: $unit->occupancy_type;
        $baseRentPoisha = in_array($occupancyType, ['flat_owner_occupied', 'bariwala_occupied']) ? 0 : (int) round($request->base_rent_amount);

        $garageType = $request->garage_type ?: $unit->garage_type;
        $garageFeePoisha = 0;
        if ($garageType === 'bike') $garageFeePoisha = 70000;
        else if ($garageType === 'car') $garageFeePoisha = 120000;
        else if ($garageType === 'both') $garageFeePoisha = 190000;

        $serviceChargePoisha = $request->service_charge_amount !== null ? (int) round($request->service_charge_amount) : $unit->service_charge_amount;

        $unit->update([
            'unit_number' => $request->unit_number,
            'unit_type' => $request->unit_type,
            'occupancy_type' => $occupancyType,
            'service_charge_amount' => $serviceChargePoisha,
            'garage_type' => $garageType,
            'garage_fee_amount' => $garageFeePoisha,
            'bedrooms' => $request->bedrooms,
            'bathrooms' => $request->bathrooms,
            'area_sqft' => $request->area_sqft,
            'base_rent_amount' => $baseRentPoisha,
            'occupancy_status' => $request->occupancy_status,
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Unit updated successfully.',
            'data' => $unit->load(['property', 'building', 'floor']),
        ]);
    }

    /**
     * Soft-delete unit.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $unit = Unit::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->findOrFail($id);

        $unit->delete();

        return response()->json([
            'message' => 'Unit deleted successfully.',
        ]);
    }

    /**
     * Revise base rent for a unit adhering to Premises Rent Control Act 1992 of Bangladesh.
     */
    public function reviseRent(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $organizationId = $request->header('X-Organization-Id') ?: $request->query('organization_id');

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member || ! in_array($member->role, ['owner', 'bariwala', 'admin'])) {
            return response()->json([
                'message' => 'Role Restricted: Only Property Owners (Bariwalas) can authorize rent increases under platform policy & Bangladesh law.',
            ], 403);
        }

        $unit = Unit::where('organization_id', $member->organization_id)->findOrFail($id);

        $request->validate([
            'new_base_rent_amount' => ['required', 'numeric', 'min:0'],
        ]);

        $newBaseRentPoisha = (int) round($request->new_base_rent_amount);
        $currentBaseRentPoisha = (int) $unit->base_rent_amount;

        // If decreasing rent or keeping it unchanged, allow immediately
        if ($newBaseRentPoisha <= $currentBaseRentPoisha) {
            $unit->update([
                'previous_base_rent_amount' => $currentBaseRentPoisha,
                'base_rent_amount' => $newBaseRentPoisha,
                'last_rent_revised_at' => now(),
            ]);

            return response()->json([
                'message' => 'Unit rent updated successfully.',
                'data' => $unit->load(['property', 'building', 'floor']),
            ]);
        }

        // 1. Statutory 24-month cooling period check for rent increases
        if ($unit->last_rent_revised_at) {
            $monthsSinceLastRevision = $unit->last_rent_revised_at->diffInMonths(now());
            if ($monthsSinceLastRevision < 24) {
                $eligibleDate = $unit->last_rent_revised_at->addMonths(24)->format('d M, Y');
                return response()->json([
                    'message' => "Statutory Cooling Period Active: Under Premises Rent Control Act 1992 of Bangladesh, rent revision is locked for 24 months from the previous agreement date. Next eligible date: {$eligibleDate}.",
                ], 422);
            }
        }

        // 2. Statutory 20% maximum ceiling cap check
        $maxAllowedRentPoisha = (int) round($currentBaseRentPoisha * 1.20);
        if ($newBaseRentPoisha > $maxAllowedRentPoisha) {
            $currentBdt = number_format($currentBaseRentPoisha / 100, 2);
            $maxAllowedBdt = number_format($maxAllowedRentPoisha / 100, 2);
            $requestedBdt = number_format($newBaseRentPoisha / 100, 2);

            return response()->json([
                'message' => "Statutory Ceiling Exceeded: Under Premises Rent Control Act 1992, the maximum allowed rent for this unit is ৳{$maxAllowedBdt} (20% max ceiling above current base rent of ৳{$currentBdt}). You requested ৳{$requestedBdt}.",
                'max_allowed_bdt' => $maxAllowedRentPoisha / 100,
            ], 422);
        }

        // 3. Perform rent revision
        $unit->update([
            'previous_base_rent_amount' => $currentBaseRentPoisha,
            'base_rent_amount' => $newBaseRentPoisha,
            'last_rent_revised_at' => now(),
        ]);

        return response()->json([
            'message' => 'Rent revised successfully in compliance with Premises Rent Control Act 1992.',
            'data' => $unit->load(['property', 'building', 'floor']),
        ]);
    }
}

