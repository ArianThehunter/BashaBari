<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Floor;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Property;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_user_can_create_property(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/properties', [
                'name' => 'Gulshan Heights',
                'city' => 'Dhaka',
                'area' => 'Gulshan 2',
                'address' => 'Road 115, Block SE(F)',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Gulshan Heights')
            ->assertJsonPath('data.city', 'Dhaka');

        $this->assertDatabaseHas('properties', [
            'organization_id' => $org->id,
            'name' => 'Gulshan Heights',
        ]);
    }

    public function test_user_can_create_building_with_floors(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();
        $property = Property::factory()->create(['organization_id' => $org->id]);

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/buildings', [
                'property_id' => $property->id,
                'name' => 'Tower A',
                'total_floors' => 3,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Tower A')
            ->assertJsonCount(3, 'data.floors');

        $building = Building::where('name', 'Tower A')->first();
        $this->assertEquals(3, Floor::where('building_id', $building->id)->count());
    }

    public function test_user_can_create_unit_with_poisha_rent(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();
        $property = Property::factory()->create(['organization_id' => $org->id]);
        $building = Building::factory()->create(['property_id' => $property->id, 'organization_id' => $org->id]);
        $floor = Floor::create(['building_id' => $building->id, 'organization_id' => $org->id, 'name' => '1st Floor', 'floor_number' => 1]);

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        // Pass 2500000 poisha (25,000.00 BDT)
        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/units', [
                'floor_id' => $floor->id,
                'unit_number' => 'Flat 1-A',
                'unit_type' => 'residential',
                'bedrooms' => 3,
                'bathrooms' => 2,
                'area_sqft' => 1450.5,
                'base_rent_amount' => 2500000,
                'occupancy_status' => 'vacant',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.unit_number', 'Flat 1-A')
            ->assertJsonPath('data.base_rent_amount', 2500000);

        $this->assertDatabaseHas('units', [
            'unit_number' => 'Flat 1-A',
            'base_rent_amount' => 2500000,
            'occupancy_status' => 'vacant',
        ]);
    }

    public function test_filter_units_by_occupancy_status(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();
        $property = Property::factory()->create(['organization_id' => $org->id]);
        $building = Building::factory()->create(['property_id' => $property->id, 'organization_id' => $org->id]);
        $floor = Floor::create(['building_id' => $building->id, 'organization_id' => $org->id, 'name' => '1st Floor', 'floor_number' => 1]);

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        Unit::create([
            'floor_id' => $floor->id,
            'building_id' => $building->id,
            'property_id' => $property->id,
            'organization_id' => $org->id,
            'unit_number' => 'Flat 101',
            'base_rent_amount' => 2000000,
            'occupancy_status' => 'vacant',
        ]);

        Unit::create([
            'floor_id' => $floor->id,
            'building_id' => $building->id,
            'property_id' => $property->id,
            'organization_id' => $org->id,
            'unit_number' => 'Flat 102',
            'base_rent_amount' => 2000000,
            'occupancy_status' => 'occupied',
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/units?occupancy_status=vacant');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.unit_number', 'Flat 101');
    }
}
