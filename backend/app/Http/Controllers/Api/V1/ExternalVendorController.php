<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ExternalVendor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExternalVendorController extends Controller
{
    /**
     * Display a listing of external service providers (hired technicians directory).
     */
    public function index(Request $request): JsonResponse
    {
        $query = ExternalVendor::with(['property']);

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        if ($request->has('service_category')) {
            $query->where('service_category', $request->service_category);
        }

        $vendors = $query->orderBy('vendor_name')->get();

        return response()->json([
            'data' => $vendors,
        ]);
    }

    /**
     * Store a newly hired external service provider details.
     * Hierarchy of recording: Caretaker -> Guard -> Owner.
     * Prepared for future lead referral commission expansion (5%-10%).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => 'nullable|exists:properties,id',
            'recorded_by_role' => 'required|string|in:caretaker,guard,owner',
            'recorded_by_name' => 'nullable|string|max:255',
            'vendor_name' => 'required|string|max:255',
            'vendor_phone' => 'required|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'service_category' => 'required|string|in:plumbing,electrical,elevator,tank_cleaning,generator,painting,pest_control,other',
            'address' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $organizationId = 1;
        if (!empty($validated['property_id'])) {
            $property = DB::table('properties')->where('id', $validated['property_id'])->first();
            if ($property) {
                $organizationId = $property->organization_id;
            }
        }

        $vendor = ExternalVendor::create(array_merge($validated, [
            'organization_id' => $organizationId,
            'is_verified' => false,
        ]));

        return response()->json([
            'message' => 'External service provider stored in directory.',
            'data' => $vendor,
        ], 201);
    }

    /**
     * Display specified external vendor details.
     */
    public function show(string $id): JsonResponse
    {
        $vendor = ExternalVendor::with(['property'])->findOrFail($id);

        return response()->json(['data' => $vendor]);
    }

    /**
     * Soft-delete an external vendor entry.
     */
    public function destroy(string $id): JsonResponse
    {
        $vendor = ExternalVendor::findOrFail($id);
        $vendor->delete();

        return response()->json(['message' => 'Service provider entry removed.']);
    }
}
