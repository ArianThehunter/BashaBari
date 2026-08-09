<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Floor;
use App\Models\Lease;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Property;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeaseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_user_can_create_lease_and_auto_sync_unit_occupancy(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $property = Property::factory()->create(['organization_id' => $org->id]);
        $building = Building::factory()->create(['property_id' => $property->id, 'organization_id' => $org->id]);
        $floor = Floor::create(['building_id' => $building->id, 'organization_id' => $org->id, 'name' => '1st Floor', 'floor_number' => 1]);
        $unit = Unit::create([
            'floor_id' => $floor->id,
            'building_id' => $building->id,
            'property_id' => $property->id,
            'organization_id' => $org->id,
            'unit_number' => 'Flat 1-A',
            'base_rent_amount' => 2500000,
            'occupancy_status' => 'vacant',
        ]);

        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/leases', [
                'unit_id' => $unit->id,
                'tenant_id' => $tenant->id,
                'start_date' => '2026-08-01',
                'end_date' => '2027-07-31',
                'rent_amount' => 2500000,
                'security_deposit' => 5000000,
                'advance_rent' => 2500000,
                'billing_day' => 1,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.rent_amount', 2500000)
            ->assertJsonPath('data.status', 'active');

        // Verify unit occupancy status was updated from vacant -> occupied
        $this->assertDatabaseHas('units', [
            'id' => $unit->id,
            'occupancy_status' => 'occupied',
        ]);
    }

    public function test_terminating_lease_resets_unit_occupancy_to_vacant(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $property = Property::factory()->create(['organization_id' => $org->id]);
        $building = Building::factory()->create(['property_id' => $property->id, 'organization_id' => $org->id]);
        $floor = Floor::create(['building_id' => $building->id, 'organization_id' => $org->id, 'name' => '1st Floor', 'floor_number' => 1]);
        $unit = Unit::create([
            'floor_id' => $floor->id,
            'building_id' => $building->id,
            'property_id' => $property->id,
            'organization_id' => $org->id,
            'unit_number' => 'Flat 1-B',
            'base_rent_amount' => 2000000,
            'occupancy_status' => 'occupied',
        ]);

        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);

        $lease = Lease::create([
            'organization_id' => $org->id,
            'unit_id' => $unit->id,
            'tenant_id' => $tenant->id,
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'rent_amount' => 2000000,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson("/api/v1/leases/{$lease->id}/terminate", [
                'termination_reason' => 'Tenant requested early move-out due to job transfer.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'terminated');

        // Verify unit occupancy status was reset back to vacant
        $this->assertDatabaseHas('units', [
            'id' => $unit->id,
            'occupancy_status' => 'vacant',
        ]);
    }

    public function test_rent_roll_meta_calculation(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $property = Property::factory()->create(['organization_id' => $org->id]);
        $building = Building::factory()->create(['property_id' => $property->id, 'organization_id' => $org->id]);
        $floor = Floor::create(['building_id' => $building->id, 'organization_id' => $org->id, 'name' => '1st Floor', 'floor_number' => 1]);

        $unit1 = Unit::create(['floor_id' => $floor->id, 'building_id' => $building->id, 'property_id' => $property->id, 'organization_id' => $org->id, 'unit_number' => 'Flat 1', 'base_rent_amount' => 2000000]);
        $unit2 = Unit::create(['floor_id' => $floor->id, 'building_id' => $building->id, 'property_id' => $property->id, 'organization_id' => $org->id, 'unit_number' => 'Flat 2', 'base_rent_amount' => 3000000]);

        $tenant1 = Tenant::factory()->create(['organization_id' => $org->id]);
        $tenant2 = Tenant::factory()->create(['organization_id' => $org->id]);

        Lease::create(['organization_id' => $org->id, 'unit_id' => $unit1->id, 'tenant_id' => $tenant1->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'rent_amount' => 2000000, 'status' => 'active']);
        Lease::create(['organization_id' => $org->id, 'unit_id' => $unit2->id, 'tenant_id' => $tenant2->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'rent_amount' => 3000000, 'status' => 'active']);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/leases');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total_rent_roll_poisha', 5000000)
            ->assertJsonPath('meta.active_leases_count', 2);
    }
}
