<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'organization_id',
        'user_id',
        'name',
        'email',
        'phone',
        'nid_number',
        'passport_number',
        'father_name',
        'permanent_address',
        'occupation',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relation',
        'documents',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'documents' => 'array',
        ];
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
