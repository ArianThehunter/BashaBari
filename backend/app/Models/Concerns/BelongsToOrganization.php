<?php

namespace App\Models\Concerns;

use App\Exceptions\MissingOrganizationContextException;
use App\Models\Organization;
use App\Support\OrganizationContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Applies automatic organization scoping to a model.
 *
 * Unlike a permissive scope, this one **fails closed**: inside a tenant-scoped
 * request (one the tenancy middleware has marked as enforced) a missing
 * organization context raises rather than silently returning every tenant's
 * rows.
 */
trait BelongsToOrganization
{
    protected static function bootBelongsToOrganization(): void
    {
        static::creating(function ($model) {
            $context = app(OrganizationContext::class);

            if (empty($model->organization_id) && $context->has()) {
                $model->organization_id = $context->id();
            }

            // Never let a record be written into another tenant while a
            // context is active.
            if ($context->has()
                && ! $context->isBypassed()
                && (int) $model->organization_id !== $context->id()) {
                throw new MissingOrganizationContextException(static::class);
            }
        });

        static::addGlobalScope('organization', function (Builder $builder) {
            $context = app(OrganizationContext::class);

            if ($context->isBypassed()) {
                return;
            }

            if ($context->has()) {
                $builder->where(
                    $builder->getModel()->getTable().'.organization_id',
                    $context->id()
                );

                return;
            }

            // No context. Inside a tenant-scoped request this is a bug or an
            // attack: refuse rather than degrade to an unscoped query.
            if ($context->isEnforced()) {
                throw new MissingOrganizationContextException(static::class);
            }

            // Otherwise we are in CLI / seeding / a queue worker, where callers
            // filter explicitly or opt in via OrganizationContext::forOrganization().
        });
    }

    /**
     * Query without organization scoping. Cross-tenant by definition — only
     * for platform-level tooling and scheduled sweeps.
     */
    public function scopeAcrossOrganizations(Builder $query): Builder
    {
        return $query->withoutGlobalScope('organization');
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
