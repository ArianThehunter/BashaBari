<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TenantMoveOutNotice extends Model
{
    use BelongsToOrganization, HasFactory, SoftDeletes;

    protected $table = 'tenant_move_out_notices';

    protected $fillable = [
        'organization_id',
        'property_id',
        'building_id',
        'unit_id',
        'tenant_id',
        'intended_move_out_date',
        'reason_for_leaving',
        'deposit_refund_account',
        'status',
        'caretaker_notes',
    ];

    protected $casts = [
        'intended_move_out_date' => 'date',
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

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
