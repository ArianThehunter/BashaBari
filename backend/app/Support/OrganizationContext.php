<?php

namespace App\Support;

use App\Exceptions\MissingOrganizationContextException;
use App\Models\OrganizationMember;

/**
 * Holds the active organization for the current request / job.
 *
 * Registered as a *scoped* container binding so it is rebuilt per request
 * (including under Laravel Octane, where singletons would leak between
 * requests).
 *
 * Three states matter:
 *
 *  - **unset & unenforced** — CLI, seeders, migrations, queue workers. No
 *    scoping is applied and nothing throws; callers are expected to filter
 *    explicitly or opt in via {@see forOrganization()}.
 *  - **set** — an organization is active; every org-scoped model filters on it.
 *  - **enforced but unset** — a tenant-scoped HTTP route was reached without a
 *    resolvable organization. This must never happen (the middleware 403s
 *    first), so org-scoped queries throw rather than silently returning every
 *    tenant's rows.
 */
class OrganizationContext
{
    private ?int $organizationId = null;

    private ?OrganizationMember $member = null;

    private bool $enforced = false;

    private int $bypassDepth = 0;

    /**
     * Bind an organization (and the membership that granted access) to this request.
     */
    public function set(int $organizationId, ?OrganizationMember $member = null): void
    {
        $this->organizationId = $organizationId;
        $this->member = $member;
    }

    public function id(): ?int
    {
        return $this->organizationId;
    }

    public function member(): ?OrganizationMember
    {
        return $this->member;
    }

    public function has(): bool
    {
        return $this->organizationId !== null;
    }

    /**
     * Return the active organization id or fail loudly.
     */
    public function idOrFail(): int
    {
        if ($this->organizationId === null) {
            throw new MissingOrganizationContextException;
        }

        return $this->organizationId;
    }

    /**
     * Declare that organization scoping is mandatory from this point on.
     *
     * Called by the tenancy middleware *before* it attempts resolution, so a
     * failure to resolve can never degrade into an unscoped query.
     */
    public function enforce(): void
    {
        $this->enforced = true;
    }

    public function isEnforced(): bool
    {
        return $this->enforced;
    }

    public function isBypassed(): bool
    {
        return $this->bypassDepth > 0;
    }

    /**
     * Run a callback with organization scoping suspended.
     *
     * Reserved for genuinely cross-tenant work (platform admin tooling,
     * scheduled jobs that sweep every organization). Re-entrant.
     */
    public function withoutScope(callable $callback): mixed
    {
        $this->bypassDepth++;

        try {
            return $callback();
        } finally {
            $this->bypassDepth--;
        }
    }

    /**
     * Run a callback with a specific organization active, restoring the
     * previous context afterwards.
     */
    public function forOrganization(int $organizationId, callable $callback): mixed
    {
        $previousId = $this->organizationId;
        $previousMember = $this->member;

        $this->organizationId = $organizationId;
        $this->member = null;

        try {
            return $callback();
        } finally {
            $this->organizationId = $previousId;
            $this->member = $previousMember;
        }
    }

    public function forget(): void
    {
        $this->organizationId = null;
        $this->member = null;
    }

    /**
     * Clear every piece of per-request state.
     *
     * The container rebuilds this object per request under PHP-FPM and Octane,
     * but the tenancy middleware calls this anyway so that any environment
     * which reuses the container (the test harness, a long-running worker)
     * cannot carry one request's organization into the next.
     */
    public function reset(): void
    {
        $this->organizationId = null;
        $this->member = null;
        $this->enforced = false;
        $this->bypassDepth = 0;
    }
}
