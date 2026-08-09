<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lease extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'unit_id',
        'tenant_id',
        'start_date',
        'end_date',
        'rent_amount',
        'security_deposit',
        'advance_rent',
        'billing_day',
        'status',
        'terms_and_conditions',
        'terminated_at',
        'termination_reason',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
            'rent_amount' => 'integer',
            'security_deposit' => 'integer',
            'advance_rent' => 'integer',
            'billing_day' => 'integer',
            'terminated_at' => 'datetime',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
