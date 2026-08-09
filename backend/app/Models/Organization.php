<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'address',
        'phone',
        'email',
        'status',
        'settings',
        'trial_ends_at',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'trial_ends_at' => 'date',
        ];
    }

    /**
     * Get members of this organization.
     */
    public function members(): HasMany
    {
        return $this->hasMany(OrganizationMember::class);
    }

    /**
     * Check if organization is currently in trial mode.
     */
    public function isTrial(): bool
    {
        return $this->status === 'trial' && ($this->trial_ends_at === null || $this->trial_ends_at->isFuture());
    }

    /**
     * Check if trial has expired.
     */
    public function isTrialExpired(): bool
    {
        return $this->status === 'trial' && $this->trial_ends_at !== null && $this->trial_ends_at->isPast();
    }
}
