<?php

use App\Http\Middleware\EnsureOrganizationPermission;
use App\Http\Middleware\RequestIdMiddleware;
use App\Http\Middleware\SetCurrentOrganization;
use App\Http\Middleware\SetTenantPortalOrganization;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        // Laravel does not throttle API routes by default; without this the
        // entire authenticated API is unlimited.
        $middleware->throttleApi('api');

        $middleware->append(RequestIdMiddleware::class);

        // Tenancy middleware is opt-in per route group rather than global, so
        // that onboarding and tenant-portal routes (which have no organization
        // membership) are not locked out.
        $middleware->alias([
            'organization' => SetCurrentOrganization::class,
            'org.permission' => EnsureOrganizationPermission::class,
            'tenant.portal' => SetTenantPortalOrganization::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->wantsJson(),
        );
    })->create();
