<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceRequest extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'property_id',
        'building_id',
        'unit_id',
        'tenant_id',
        'reported_by_user_id',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'estimated_cost_amount',
        'actual_cost_amount',
        'assigned_vendor_name',
        'assigned_vendor_phone',
        'is_escalated_to_owner',
        'escalated_by',
        'escalation_reason',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'estimated_cost_amount' => 'integer',
            'actual_cost_amount' => 'integer',
            'is_escalated_to_owner' => 'boolean',
            'resolved_at' => 'datetime',
        ];
    }

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

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by_user_id');
    }

    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }
}
