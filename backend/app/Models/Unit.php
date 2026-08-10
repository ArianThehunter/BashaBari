<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Unit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'floor_id',
        'building_id',
        'property_id',
        'organization_id',
        'unit_number',
        'unit_type',
        'bedrooms',
        'bathrooms',
        'area_sqft',
        'base_rent_amount',
        'previous_base_rent_amount',
        'last_rent_revised_at',
        'occupancy_status',
        'occupancy_type',
        'service_charge_amount',
        'garage_type',
        'garage_fee_amount',
        'bike_count',
        'car_count',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'bedrooms' => 'integer',
            'bathrooms' => 'integer',
            'area_sqft' => 'float',
            'base_rent_amount' => 'integer', // Always stored as integer poisha (1 BDT = 100 poisha)
            'previous_base_rent_amount' => 'integer',
            'last_rent_revised_at' => 'datetime',
            'service_charge_amount' => 'integer',
            'garage_fee_amount' => 'integer',
            'bike_count' => 'integer',
            'car_count' => 'integer',
        ];
    }

    public function floor(): BelongsTo
    {
        return $this->belongsTo(Floor::class);
    }

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
