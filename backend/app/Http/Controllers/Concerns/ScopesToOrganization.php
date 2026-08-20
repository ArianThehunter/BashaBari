<?php

namespace App\Http\Controllers\Concerns;

use App\Support\OrganizationContext;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

/**
 * Validation helpers bound to the active organization.
 *
 * A bare `exists:units,id` validates against every tenant's rows, which lets a
 * caller attach one organization's record to another's, and lets them probe
 * which ids exist by watching the validation response.
 */
trait ScopesToOrganization
{
    protected function currentOrganizationId(): ?int
    {
        return app(OrganizationContext::class)->id();
    }

    /**
     * An `exists` rule constrained to the active organization, ignoring
     * soft-deleted rows.
     */
    protected function orgExists(string $table, string $column = 'id'): Exists
    {
        return Rule::exists($table, $column)
            ->where('organization_id', $this->currentOrganizationId())
            ->whereNull('deleted_at');
    }

    /**
     * As {@see orgExists()} for tables without soft deletes.
     */
    protected function orgExistsHard(string $table, string $column = 'id'): Exists
    {
        return Rule::exists($table, $column)
            ->where('organization_id', $this->currentOrganizationId());
    }
}
