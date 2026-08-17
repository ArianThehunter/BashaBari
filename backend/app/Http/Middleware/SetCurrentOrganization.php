<?php

namespace App\Http\Middleware;

use App\Models\OrganizationMember;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetCurrentOrganization
{
    /**
     * Handle an incoming request.
     *
     * Identifies active organization context for multi-tenant data isolation.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $requestedOrgId = $request->header('X-Organization-Id') ?: $request->query('organization_id') ?: $request->input('organization_id');

            // Find active membership matching request or fallback to primary active membership
            $membership = OrganizationMember::where('user_id', $user->id)
                ->where('status', 'active')
                ->when($requestedOrgId, fn ($q) => $q->where('organization_id', $requestedOrgId))
                ->first();

            if ($membership) {
                app()->instance('current_organization_id', $membership->organization_id);
                $request->attributes->set('current_organization_id', $membership->organization_id);
                $request->attributes->set('current_organization_member', $membership);
            }
        }

        return $next($request);
    }
}
