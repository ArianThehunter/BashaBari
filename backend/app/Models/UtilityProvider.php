<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UtilityProvider extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'default_rate_per_unit_poisha',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'default_rate_per_unit_poisha' => 'integer',
        ];
    }

    public function meterReadings(): HasMany
    {
        return $this->hasMany(MeterReading::class);
    }
}
