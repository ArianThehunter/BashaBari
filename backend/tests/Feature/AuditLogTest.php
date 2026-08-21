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

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_terminating_lease_records_security_audit_log(): void
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
        $building = Building::create([
            'organization_id' => $org->id,
            'property_id' => $property->id,
            'name' => 'Main Tower',
            'total_floors' => 5,
        ]);
        $floor = Floor::create([
            'organization_id' => $org->id,
            'building_id' => $building->id,
            'floor_number' => 1,
            'name' => '1st Floor',
        ]);
        $unit = Unit::create([
            'organization_id' => $org->id,
            'property_id' => $property->id,
            'building_id' => $building->id,
            'floor_id' => $floor->id,
            'unit_number' => 'A-101',
            'unit_type' => 'residential',
            'base_rent_amount' => 2000000,
            'occupancy_status' => 'occupied',
        ]);
        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);

        $lease = Lease::create([
            'organization_id' => $org->id,
            'unit_id' => $unit->id,
            'tenant_id' => $tenant->id,
            'lease_number' => 'LSE-202608-001',
            'start_date' => '2026-01-01',
            'end_date' => '2026-12-31',
            'rent_amount' => 2000000,
            'billing_day' => 1,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson("/api/v1/leases/{$lease->id}/terminate", [
                'termination_reason' => 'Tenant requested early vacating due to transfer.',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'organization_id' => $org->id,
            'event' => 'lease.terminated',
            'auditable_type' => Lease::class,
            'auditable_id' => $lease->id,
        ]);
    }

    public function test_user_can_retrieve_organization_audit_logs(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);

        // Delete tenant to trigger audit log
        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->deleteJson("/api/v1/tenants/{$tenant->id}");

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/audit-logs');

        $response->assertStatus(200)
            ->assertJsonPath('data.0.event', 'tenant.deleted');
    }
}
