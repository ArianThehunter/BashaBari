<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\MaintenanceRequest;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Self-service endpoints for tenants.
 *
 * The tenant is resolved once, by SetTenantPortalOrganization, from
 * tenants.user_id — never by matching an unverified email or phone number
 * across organizations. Organization context is set by the same middleware, so
 * every org-scoped query below is additionally constrained to the tenant's own
 * organization.
 */
class TenantPortalController extends Controller
{
    private function tenant(Request $request): Tenant
    {
        return $request->attributes->get('current_tenant');
    }

    /**
     * Fetch the tenant profile and overview statistics.
     */
    public function overview(Request $request): JsonResponse
    {
        $tenant = $this->tenant($request);
        $tenant->load('organization');

        $activeLease = Lease::where('tenant_id', $tenant->id)
            ->where('status', 'active')
            ->with(['unit.property', 'unit.building', 'unit.floor'])
            ->first();

        $outstanding = Invoice::where('tenant_id', $tenant->id)
            ->whereIn('status', ['unpaid', 'partially_paid'])
            ->selectRaw('COUNT(*) as invoice_count, COALESCE(SUM(due_amount), 0) as total_due')
            ->first();

        $maintenanceCount = MaintenanceRequest::where('tenant_id', $tenant->id)
            ->whereIn('status', ['pending', 'in_progress'])
            ->count();

        return response()->json([
            'tenant' => $tenant,
            'active_lease' => $activeLease,
            'unpaid_invoices_count' => (int) $outstanding->invoice_count,
            'total_due_poisha' => (int) $outstanding->total_due,
            'open_maintenance_tickets_count' => $maintenanceCount,
        ]);
    }

    /**
     * Display the tenant's rent invoice history.
     */
    public function invoices(Request $request): JsonResponse
    {
        $invoices = Invoice::where('tenant_id', $this->tenant($request)->id)
            ->with(['items', 'lease.unit.property'])
            ->latest('issue_date')
            ->paginate($request->integer('per_page', 25));

        return response()->json($invoices);
    }

    /**
     * Display the tenant's maintenance request tickets.
     */
    public function maintenance(Request $request): JsonResponse
    {
        $tickets = MaintenanceRequest::where('tenant_id', $this->tenant($request)->id)
            ->with(['property', 'unit'])
            ->latest()
            ->paginate($request->integer('per_page', 25));

        return response()->json($tickets);
    }
}
