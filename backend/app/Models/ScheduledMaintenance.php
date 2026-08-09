<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScheduledMaintenance extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'scheduled_maintenances';

    protected $fillable = [
        'organization_id',
        'property_id',
        'building_id',
        'title',
        'description',
        'maintenance_type',
        'scheduled_date',
        'start_time',
        'end_time',
        'scheduled_by_role',
        'scheduled_by_name',
        'is_tenant_notified',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'is_tenant_notified' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }
}
