<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MeterReading;
use App\Models\OrganizationMember;
use App\Models\UtilityProvider;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeterReadingController extends Controller
{
    /**
     * Display a listing of sub-meter readings for active organization.
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

        $propertyId = $request->query('property_id');
        $providerId = $request->query('utility_provider_id');
        $billingMonth = $request->query('billing_month');

        $query = MeterReading::query()
            ->where('organization_id', $member->organization_id)
            ->when($propertyId, fn ($q) => $q->where('property_id', $propertyId))
            ->when($providerId, fn ($q) => $q->where('utility_provider_id', $providerId))
            ->when($billingMonth, fn ($q) => $q->where('billing_month', $billingMonth))
            ->with(['property', 'building', 'unit', 'utilityProvider'])
            ->latest('reading_date');

        $readings = $query->get();

        $totalConsumptionAmountPoisha = MeterReading::where('organization_id', $member->organization_id)
            ->sum('total_amount_poisha');

        return response()->json([
            'data' => $readings,
            'meta' => [
                'total_readings' => $readings->count(),
                'total_amount_poisha' => (int) $totalConsumptionAmountPoisha,
            ],
        ]);
    }

    /**
     * Store a newly logged sub-meter reading.
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
            'utility_provider_id' => ['required', 'exists:utility_providers,id'],
            'meter_number' => ['required', 'string', 'max:100'],
            'previous_reading' => ['required', 'numeric', 'min:0'],
            'current_reading' => ['required', 'numeric', 'gte:previous_reading'],
            'rate_per_unit_bdt' => ['nullable', 'numeric', 'min:0'],
            'reading_date' => ['required', 'date'],
        ]);

        $provider = UtilityProvider::findOrFail($request->utility_provider_id);

        $unitsConsumed = (float) ($request->current_reading - $request->previous_reading);

        $ratePoisha = $request->has('rate_per_unit_bdt') && $request->rate_per_unit_bdt > 0
            ? (int) round($request->rate_per_unit_bdt * 100)
            : $provider->default_rate_per_unit_poisha;

        $totalAmountPoisha = (int) round($unitsConsumed * ($ratePoisha / 100) * 100);
        $billingMonth = Carbon::parse($request->reading_date)->format('Y-m');

        $reading = MeterReading::create([
            'organization_id' => $member->organization_id,
            'property_id' => $request->property_id,
            'building_id' => $request->building_id,
            'unit_id' => $request->unit_id,
            'utility_provider_id' => $request->utility_provider_id,
            'meter_number' => $request->meter_number,
            'previous_reading' => $request->previous_reading,
            'current_reading' => $request->current_reading,
            'units_consumed' => $unitsConsumed,
            'rate_per_unit_poisha' => $ratePoisha,
            'total_amount_poisha' => $totalAmountPoisha,
            'reading_date' => $request->reading_date,
            'billing_month' => $billingMonth,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Sub-meter reading logged successfully.',
            'data' => $reading->load(['property', 'unit', 'utilityProvider']),
        ], 201);
    }

    /**
     * Display specified meter reading.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $reading = MeterReading::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with(['property', 'building', 'unit', 'utilityProvider'])
            ->findOrFail($id);

        return response()->json(['data' => $reading]);
    }

    /**
     * Soft-delete meter reading.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $reading = MeterReading::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_owner', true);
            })
            ->findOrFail($id);

        $reading->delete();

        return response()->json(['message' => 'Meter reading deleted successfully.']);
    }
}
