<?php

namespace App\Http\Requests;

use App\Support\OrganizationContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Exists;

/**
 * Base request for endpoints that operate inside an organization.
 *
 * Provides {@see orgExists()}, which constrains an `exists` rule to the active
 * organization. A plain `exists:invoices,id` validates against every tenant's
 * rows — enough to attach a payment to another organization's invoice, and
 * enough to probe which ids exist.
 */
abstract class OrganizationFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route middleware (`organization` + `org.permission`) is the
        // authorization boundary; by the time a request is validated it has
        // already passed both.
        return true;
    }

    protected function organizationId(): ?int
    {
        return app(OrganizationContext::class)->id();
    }

    /**
     * An `exists` rule scoped to the active organization.
     */
    protected function orgExists(string $table, string $column = 'id'): Exists
    {
        return Rule::exists($table, $column)
            ->where('organization_id', $this->organizationId());
    }

    /**
     * As {@see orgExists()}, but also excluding soft-deleted rows.
     */
    protected function orgExistsActive(string $table, string $column = 'id'): Exists
    {
        return $this->orgExists($table, $column)->whereNull('deleted_at');
    }
}
