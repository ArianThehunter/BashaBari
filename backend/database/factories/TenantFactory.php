<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tenant>
 */
class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => '017'.fake()->numberBetween(10000000, 99999999),
            'nid_number' => (string) fake()->numberBetween(1000000000, 9999999999),
            'father_name' => fake()->name('male'),
            'permanent_address' => fake()->address(),
            'occupation' => fake()->jobTitle(),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_phone' => '018'.fake()->numberBetween(10000000, 99999999),
            'emergency_contact_relation' => fake()->randomElement(['Brother', 'Father', 'Spouse', 'Friend']),
            'status' => 'active',
        ];
    }
}
