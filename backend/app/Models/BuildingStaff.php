<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BuildingStaff extends Model
{
    use BelongsToOrganization, HasFactory, SoftDeletes;

    protected $table = 'building_staff';

    protected $fillable = [
        'organization_id',
        'property_id',
        'building_id',
        'user_id',
        'name',
        'phone',
        'nid_number',
        'is_caretaker',
        'is_security_guard',
        'is_agency_contracted',
        'is_owner_manager',
        'staff_role',
        'employment_type',
        'agency_name',
        'shift_type',
        'shift_hours',
        'monthly_salary',
        'status',
        'joining_date',
        'notes',
    ];

    protected $casts = [
        'is_caretaker' => 'boolean',
        'is_security_guard' => 'boolean',
        'is_agency_contracted' => 'boolean',
        'is_owner_manager' => 'boolean',
        'monthly_salary' => 'integer',
        'joining_date' => 'date',
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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dutyLogs(): HasMany
    {
        return $this->hasMany(StaffDutyLog::class, 'building_staff_id');
    }

    public function vendorVisitLogs(): HasMany
    {
        return $this->hasMany(VendorVisitLog::class, 'recorded_by_staff_id');
    }
}
