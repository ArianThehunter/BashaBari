<?php

namespace App\Models\Concerns;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

trait BelongsToOrganization
{
    /**
     * Boot the BelongsToOrganization trait.
     *
     * Automatically applies organization scoping during HTTP request lifecycle
     * while preserving clean execution in CLI/seeders/migrations.
     */
    protected static function bootBelongsToOrganization(): void
    {
        static::creating(function ($model) {
            if (empty($model->organization_id) && app()->has('current_organization_id')) {
                $model->organization_id = app('current_organization_id');
            }
        });

        static::addGlobalScope('organization', function (Builder $builder) {
            if (app()->has('current_organization_id') && ! empty(app('current_organization_id'))) {
                $builder->where($builder->getModel()->getTable().'.organization_id', app('current_organization_id'));
            }
        });
    }

    /**
     * Get the organization that owns the entity.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
