<?php

namespace App\Providers;

use App\Models\User;
use App\Support\OrganizationContext;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Scoped (not singleton) so the container rebuilds it per request and
        // tenant context cannot leak between requests under Octane.
        $this->app->scoped(OrganizationContext::class, fn () => new OrganizationContext);
    }

    public function boot(): void
    {
        $this->registerRateLimiters();
        $this->registerGates();
    }

    private function registerRateLimiters(): void
    {
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->input('email').'|'.$request->ip());
        });

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        // Tighter budget for endpoints that mutate money or send messages.
        RateLimiter::for('sensitive', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });
    }

    private function registerGates(): void
    {
        // Resolves dotted permission names ("invoices.create") against the
        // active organization membership, so `$user->can(...)` and
        // `@can` work without registering an ability per permission.
        //
        // This has to be a `before` hook: an undefined ability resolves to
        // `false`, not `null`, so an `after` hook could never grant it.
        // Returning null falls through to normal resolution, which denies.
        Gate::before(function (User $user, string $ability) {
            if ($user->isPlatformAdmin()) {
                return true;
            }

            if (! str_contains($ability, '.')) {
                return null;
            }

            $member = app(OrganizationContext::class)->member();

            return $member?->hasPermission($ability) ? true : null;
        });
    }
}
