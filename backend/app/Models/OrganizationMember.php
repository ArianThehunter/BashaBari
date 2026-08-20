<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'organization_id',
        'role_id',
        'is_owner',
        'property_access',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_owner' => 'boolean',
            'property_access' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Does this membership grant the named permission (e.g. "properties.create")?
     *
     * Organization owners implicitly hold every permission. Everyone else is
     * resolved against their assigned role, and denied when they have none.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->is_owner) {
            return true;
        }

        if (! $this->role_id) {
            return false;
        }

        $this->loadMissing('role.permissions');

        return (bool) $this->role?->permissions->contains('name', $permission);
    }

    /**
     * The role slug for this membership ("owner", "caretaker", ...).
     *
     * Owners are reported as "owner" even when no role row is attached, which
     * is how memberships created during organization setup are stored.
     */
    public function roleSlug(): ?string
    {
        if ($this->role_id) {
            $this->loadMissing('role');

            if ($this->role?->slug) {
                return $this->role->slug;
            }
        }

        return $this->is_owner ? 'owner' : null;
    }

    /**
     * Is this membership restricted to a subset of the organization's properties?
     */
    public function hasRestrictedPropertyAccess(): bool
    {
        return ! $this->is_owner && ! empty($this->property_access);
    }

    /**
     * Property ids this membership may act on, or null when unrestricted.
     *
     * @return array<int, int>|null
     */
    public function accessiblePropertyIds(): ?array
    {
        if (! $this->hasRestrictedPropertyAccess()) {
            return null;
        }

        return array_map('intval', $this->property_access);
    }
}
