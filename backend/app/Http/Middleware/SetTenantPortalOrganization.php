<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Support\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resolves organization context for tenant-portal requests.
 *
 * Portal users are not organization members, so the regular tenancy middleware
 * would reject them. Their context comes from the tenant record their user
 * account is linked to.
 *
 * Linking is by tenants.user_id only. A tenant record may be claimed once, by a
 * user whose email is *verified* and matches the record — phone numbers are
 * never used, because nothing proves ownership of a phone number at signup.
 */
class SetTenantPortalOrganization
{
    public function handle(Request $request, Closure $next): Response
    {
        $context = app(OrganizationContext::class);
        $context->reset();
        $context->enforce();

        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $tenant = $context->withoutScope(fn () => $this->resolveTenant($user));

        if (! $tenant) {
            return response()->json([
                'message' => 'No tenant profile is linked to your account. '
                    .'Ask your landlord to add your email address to your tenancy record.',
            ], 404);
        }

        $context->set($tenant->organization_id);

        $request->attributes->set('current_tenant', $tenant);
        $request->attributes->set('current_organization_id', $tenant->organization_id);

        return $next($request);
    }

    private function resolveTenant($user): ?Tenant
    {
        $linked = Tenant::query()
            ->where('user_id', $user->id)
            ->orderByRaw("CASE WHEN status = 'active' THEN 0 ELSE 1 END")
            ->first();

        if ($linked) {
            return $linked;
        }

        return $this->claimByVerifiedEmail($user);
    }

    /**
     * One-time claim of an unlinked tenant record by a verified email match.
     */
    private function claimByVerifiedEmail($user): ?Tenant
    {
        if (! $user->hasVerifiedEmail() || blank($user->email)) {
            return null;
        }

        $candidates = Tenant::query()
            ->whereNull('user_id')
            ->whereRaw('LOWER(email) = ?', [mb_strtolower($user->email)])
            ->get();

        // Ambiguous matches are refused rather than guessed at.
        if ($candidates->count() !== 1) {
            return null;
        }

        $tenant = $candidates->first();
        $tenant->forceFill(['user_id' => $user->id])->save();

        return $tenant;
    }
}
