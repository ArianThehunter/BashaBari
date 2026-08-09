<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Floor extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_id',
        'organization_id',
        'name',
        'floor_number',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(Building::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function units(): HasMany
    {
        return $this->hasMany(Unit::class);
    }
}
