<?php

namespace Database\Factories;

use App\Models\Building;
use App\Models\Organization;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Building>
 */
class BuildingFactory extends Factory
{
    protected $model = Building::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'property_id' => Property::factory(),
            'organization_id' => Organization::factory(),
            'name' => 'Building '.fake()->randomLetter(),
            'total_floors' => 5,
        ];
    }
}
