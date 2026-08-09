<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffDutyLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'building_staff_id',
        'action_type',
        'previous_role',
        'new_role',
        'amount_paid',
        'payment_method',
        'voucher_number',
        'notes',
    ];

    protected $casts = [
        'amount_paid' => 'integer',
    ];

    public function staff(): BelongsTo
    {
        return $this->belongsTo(BuildingStaff::class, 'building_staff_id');
    }
}
