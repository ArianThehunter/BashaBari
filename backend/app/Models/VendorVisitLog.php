<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VendorVisitLog extends Model
{
    use BelongsToOrganization, HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'property_id',
        'building_id',
        'recorded_by_staff_id',
        'recorded_by_user_id',
        'technician_name',
        'technician_phone',
        'company_name',
        'service_category',
        'entry_time',
        'exit_time',
        'purpose_of_visit',
        'amount_paid',
        'payment_method',
        'receipt_reference',
        'status',
    ];

    protected $casts = [
        'entry_time' => 'datetime',
        'exit_time' => 'datetime',
        'amount_paid' => 'integer',
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

    public function recordedByStaff(): BelongsTo
    {
        return $this->belongsTo(BuildingStaff::class, 'recorded_by_staff_id');
    }

    public function recordedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by_user_id');
    }
}
