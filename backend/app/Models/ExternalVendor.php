<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExternalVendor extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'external_vendors';

    protected $fillable = [
        'organization_id',
        'property_id',
        'recorded_by_role',
        'recorded_by_name',
        'vendor_name',
        'vendor_phone',
        'company_name',
        'service_category',
        'address',
        'notes',
        'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
