<?php

namespace App\Http\Middleware;

use App\Exceptions\OrganizationAccessDeniedException;
use App\Models\OrganizationMember;
use App\Support\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves the active organization for a tenant-scoped request.
 *
 * Fail-closed: if an organization cannot be resolved the request is rejected
 * here, so no controller ever runs without tenant context.
 */
class SetCurrentOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        $context = app(OrganizationContext::class);

        // Declare scoping mandatory *before* resolving, so that any org-scoped
        // query reached by an unexpected path throws instead of running
        // unscoped.
        $context->reset();
        $context->enforce();

        $user = $request->user();

        if (! $user) {
            throw new OrganizationAccessDeniedException('Unauthenticated.');
        }

        $requestedOrgId = $request->header('X-Organization-Id')
            ?: $request->query('organization_id')
            ?: $request->input('organization_id');

        $membership = OrganizationMember::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->when($requestedOrgId, fn ($q) => $q->where('organization_id', $requestedOrgId))
            ->with('role.permissions')
            ->first();

        if (! $membership) {
            // Distinguish "you asked for an org you don't belong to" from
            // "you belong to no organization at all" — the first is an access
            // violation, the second is an onboarding state.
            throw new OrganizationAccessDeniedException(
                $requestedOrgId
                    ? 'You do not have access to this organization.'
                    : 'No active organization membership. Create or join an organization first.'
            );
        }

        $context->set($membership->organization_id, $membership);

        $request->attributes->set('current_organization_id', $membership->organization_id);
        $request->attributes->set('current_organization_member', $membership);

        return $next($request);
    }
}
