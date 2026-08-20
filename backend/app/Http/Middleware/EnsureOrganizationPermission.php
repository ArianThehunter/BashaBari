<?php

namespace App\Http\Middleware;

use App\Support\OrganizationContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforces a named RBAC permission against the active organization membership.
 *
 * Usage: ->middleware('org.permission:properties.create')
 *
 * Multiple permissions may be passed; the member needs *any* of them.
 */
class EnsureOrganizationPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = $request->user();

        if ($user?->isPlatformAdmin()) {
            return $next($request);
        }

        $member = app(OrganizationContext::class)->member();

        if (! $member) {
            return response()->json([
                'message' => 'No active organization context for this request.',
            ], 403);
        }

        foreach ($permissions as $permission) {
            if ($member->hasPermission($permission)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'You do not have permission to perform this action.',
            'required_permission' => $permissions,
        ], 403);
    }
}
