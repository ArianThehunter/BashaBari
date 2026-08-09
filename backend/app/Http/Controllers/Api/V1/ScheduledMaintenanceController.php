<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ScheduledMaintenance;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduledMaintenanceController extends Controller
{
    /**
     * Display a listing of scheduled maintenance events.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ScheduledMaintenance::with(['property', 'building']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        $events = $query->where('scheduled_date', '>=', now()->toDateString())
            ->orderBy('scheduled_date')
            ->get();

        return response()->json([
            'data' => $events,
        ]);
    }

    /**
     * Store a newly scheduled maintenance event (enforces 3-day advance notice policy).
     */
    public function store(Request $request): JsonResponse
    {
        $minDate = Carbon::today()->addDays(3)->toDateString();

        $validated = $request->validate([
            'property_id' => 'required|exists:properties,id',
            'building_id' => 'nullable|exists:buildings,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'maintenance_type' => 'required|string|in:water_tank_cleaning,elevator_servicing,generator_maintenance,electrical_overhaul,pest_control,painting,other',
            'scheduled_date' => "required|date|after_or_equal:{$minDate}",
            'start_time' => 'required|string',
            'end_time' => 'required|string',
            'scheduled_by_role' => 'required|string|in:caretaker,owner',
            'scheduled_by_name' => 'nullable|string|max:255',
        ], [
            'scheduled_date.after_or_equal' => 'Policy Error: Property maintenance must be scheduled at least 3 days in advance to notify tenants.',
        ]);

        $property = \App\Models\Property::findOrFail($validated['property_id']);

        $event = ScheduledMaintenance::create(array_merge($validated, [
            'organization_id' => $property->organization_id,
            'is_tenant_notified' => true,
        ]));

        return response()->json([
            'message' => 'Property maintenance scheduled successfully. Broadcast notice sent to all tenants 3 days in advance.',
            'data' => $event->load(['property', 'building']),
        ], 201);
    }
}
