<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MeterReading extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'property_id',
        'building_id',
        'unit_id',
        'utility_provider_id',
        'meter_number',
        'previous_reading',
        'current_reading',
        'units_consumed',
        'rate_per_unit_poisha',
        'total_amount_poisha',
        'reading_date',
        'billing_month',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'previous_reading' => 'float',
            'current_reading' => 'float',
            'units_consumed' => 'float',
            'rate_per_unit_poisha' => 'integer',
            'total_amount_poisha' => 'integer',
            'reading_date' => 'date:Y-m-d',
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

    public function utilityProvider(): BelongsTo
    {
        return $this->belongsTo(UtilityProvider::class);
    }
}
