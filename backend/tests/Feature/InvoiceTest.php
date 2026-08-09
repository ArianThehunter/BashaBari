<?php

namespace Tests\Feature;

use App\Models\Building;
use App\Models\Floor;
use App\Models\Invoice;
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

class InvoiceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_batch_generate_monthly_invoices_for_active_leases(): void
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
        $unit2 = Unit::create(['floor_id' => $floor->id, 'building_id' => $building->id, 'property_id' => $property->id, 'organization_id' => $org->id, 'unit_number' => 'Flat 2', 'base_rent_amount' => 2500000]);

        $tenant1 = Tenant::factory()->create(['organization_id' => $org->id]);
        $tenant2 = Tenant::factory()->create(['organization_id' => $org->id]);

        Lease::create(['organization_id' => $org->id, 'unit_id' => $unit1->id, 'tenant_id' => $tenant1->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'rent_amount' => 2000000, 'billing_day' => 5, 'status' => 'active']);
        Lease::create(['organization_id' => $org->id, 'unit_id' => $unit2->id, 'tenant_id' => $tenant2->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'rent_amount' => 2500000, 'billing_day' => 10, 'status' => 'active']);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/invoices/generate', [
                'month' => 8,
                'year' => 2026,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('generated_count', 2);

        $this->assertDatabaseHas('invoices', [
            'organization_id' => $org->id,
            'invoice_number' => 'INV-202608-001',
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'status' => 'unpaid',
        ]);
    }

    public function test_duplicate_billing_prevention(): void
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
        $unit = Unit::create(['floor_id' => $floor->id, 'building_id' => $building->id, 'property_id' => $property->id, 'organization_id' => $org->id, 'unit_number' => 'Flat 1', 'base_rent_amount' => 2000000]);
        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);
        Lease::create(['organization_id' => $org->id, 'unit_id' => $unit->id, 'tenant_id' => $tenant->id, 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'rent_amount' => 2000000, 'billing_day' => 1, 'status' => 'active']);

        // First run generates 1 invoice
        $this->actingAs($user)->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/invoices/generate', ['month' => 8, 'year' => 2026]);

        // Second run should generate 0 new invoices
        $response = $this->actingAs($user)->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/invoices/generate', ['month' => 8, 'year' => 2026]);

        $response->assertStatus(200)
            ->assertJsonPath('generated_count', 0);
    }

    public function test_user_can_create_custom_invoice_with_items(): void
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

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/invoices', [
                'tenant_id' => $tenant->id,
                'billing_period_month' => 8,
                'billing_period_year' => 2026,
                'issue_date' => '2026-08-01',
                'due_date' => '2026-08-10',
                'items' => [
                    ['description' => 'Monthly Base Rent', 'quantity' => 1, 'unit_amount' => 2000000],
                    ['description' => 'Water Bill', 'quantity' => 1, 'unit_amount' => 50000],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.total_amount', 2050000)
            ->assertJsonCount(2, 'data.items');
    }
}
