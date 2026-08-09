<?php

namespace Database\Factories;

use App\Models\Lease;
use App\Models\Organization;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lease>
 */
class LeaseFactory extends Factory
{
    protected $model = Lease::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', 'now');
        $endDate = (clone $startDate)->modify('+1 year');

        return [
            'organization_id' => Organization::factory(),
            'unit_id' => Unit::factory(),
            'tenant_id' => Tenant::factory(),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'rent_amount' => 2000000, // 20,000 BDT in poisha
            'security_deposit' => 4000000, // 40,000 BDT in poisha
            'advance_rent' => 2000000,
            'billing_day' => 1,
            'status' => 'active',
        ];
    }
}
