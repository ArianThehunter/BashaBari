<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TenantWarning extends Model
{
    use BelongsToOrganization, HasFactory, SoftDeletes;

    protected $table = 'tenant_warnings';

    protected $fillable = [
        'organization_id',
        'property_id',
        'unit_id',
        'tenant_id',
        'issued_by_user_id',
        'issued_by_role',
        'title',
        'damage_description',
        'fine_amount',
        'status',
    ];

    protected $casts = [
        'fine_amount' => 'integer',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by_user_id');
    }
}
