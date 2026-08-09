<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\MaintenanceRequest;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantPortalController extends Controller
{
    /**
     * Fetch active tenant profile and overview statistics.
     */
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();

        $tenant = Tenant::where('email', $user->email)
            ->orWhere('phone', $user->phone)
            ->with(['organization'])
            ->first();

        if (! $tenant) {
            return response()->json([
                'message' => 'No active tenant profile linked to your user account.',
            ], 404);
        }

        $activeLease = Lease::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->with(['unit.property', 'unit.building', 'unit.floor'])
            ->first();

        $unpaidInvoices = Invoice::where('tenant_id', $tenant->id)
            ->whereIn('status', ['unpaid', 'partially_paid'])
            ->get();

        $maintenanceCount = MaintenanceRequest::where('tenant_id', $tenant->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        return response()->json([
            'tenant' => $tenant,
            'active_lease' => $activeLease,
            'unpaid_invoices_count' => $unpaidInvoices->count(),
            'total_due_poisha' => (int) $unpaidInvoices->sum('due_amount'),
            'open_maintenance_tickets_count' => $maintenanceCount,
        ]);
    }

    /**
     * Display tenant's rent invoice history.
     */
    public function invoices(Request $request): JsonResponse
    {
        $user = $request->user();

        $tenant = Tenant::where('email', $user->email)
            ->orWhere('phone', $user->phone)
            ->firstOrFail();

        $invoices = Invoice::where('tenant_id', $tenant->id)
            ->with(['items', 'lease.unit.property'])
            ->latest('billing_month')
            ->get();

        return response()->json(['data' => $invoices]);
    }

    /**
     * Display tenant's maintenance request tickets.
     */
    public function maintenance(Request $request): JsonResponse
    {
        $user = $request->user();

        $tenant = Tenant::where('email', $user->email)
            ->orWhere('phone', $user->phone)
            ->firstOrFail();

        $tickets = MaintenanceRequest::where('tenant_id', $tenant->id)
            ->with(['property', 'unit'])
            ->latest()
            ->get();

        return response()->json(['data' => $tickets]);
    }
}
