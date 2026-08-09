<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Property>
 */
class PropertyFactory extends Factory
{
    protected $model = Property::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'name' => fake()->company().' Residence',
            'address' => fake()->address(),
            'city' => 'Dhaka',
            'area' => 'Gulshan',
            'description' => fake()->sentence(),
            'status' => 'active',
        ];
    }
}
