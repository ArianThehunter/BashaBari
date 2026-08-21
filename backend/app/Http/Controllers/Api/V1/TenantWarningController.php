<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Tenant;
use App\Models\TenantWarning;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantWarningController extends Controller
{
    /**
     * Display a listing of warnings and fines.
     */
    public function index(Request $request): JsonResponse
    {
        $query = TenantWarning::with(['tenant', 'unit', 'property', 'issuer']);

        if ($request->has('tenant_id')) {
            $query->where('tenant_id', $request->tenant_id);
        }

        if ($request->has('property_id')) {
            $query->where('property_id', $request->property_id);
        }

        $warnings = $query->latest()->get();

        return response()->json([
            'data' => $warnings,
        ]);
    }

    /**
     * Issue warning and set property damage fine to tenant.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'property_id' => ['required', $this->orgExists('properties')],
            'unit_id' => ['nullable', $this->orgExists('units')],
            'tenant_id' => ['required', $this->orgExists('tenants')],
            'title' => 'required|string|max:255',
            'damage_description' => 'required|string',
            'fine_amount' => 'required|numeric|min:0', // fine in BDT or raw poisha
            'issued_by_role' => 'required|string|in:caretaker,owner',
        ]);

        $tenant = Tenant::findOrFail($validated['tenant_id']);
        $finePoisha = (int) round($validated['fine_amount']);

        $warning = TenantWarning::create([
            'organization_id' => $tenant->organization_id,
            'property_id' => $validated['property_id'],
            'unit_id' => $validated['unit_id'],
            'tenant_id' => $tenant->id,
            'issued_by_user_id' => $user?->id,
            'issued_by_role' => $validated['issued_by_role'],
            'title' => $validated['title'],
            'damage_description' => $validated['damage_description'],
            'fine_amount' => $finePoisha,
            'status' => 'issued',
        ]);

        // If fine is set (> 0), automatically attach line item to tenant's current unpaid invoice
        if ($finePoisha > 0) {
            $invoice = Invoice::where('tenant_id', $tenant->id)
                ->whereIn('status', ['draft', 'sent', 'partially_paid'])
                ->first();

            if ($invoice) {
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'item_type' => 'tenant_fine',
                    'description' => "Property Damage Fine: {$validated['title']}",
                    'quantity' => 1,
                    'unit_amount' => $finePoisha,
                    'total_amount' => $finePoisha,
                ]);

                $invoice->recalculateTotals();
            }
        }

        return response()->json([
            'message' => 'Warning and property damage fine issued successfully. Tenant notified on portal.',
            'data' => $warning->load(['tenant', 'unit', 'property']),
        ], 201);
    }
}
