<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Property;
use App\Models\User;
use App\Models\UtilityProvider;
use App\Services\Sms\Drivers\MockBDSmsDriver;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\UtilityProviderSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UtilityAndSmsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
        $this->seed(UtilityProviderSeeder::class);
    }

    public function test_utility_providers_are_seeded_correctly(): void
    {
        $this->assertDatabaseHas('utility_providers', ['code' => 'DPDC']);
        $this->assertDatabaseHas('utility_providers', ['code' => 'DESCO']);
        $this->assertDatabaseHas('utility_providers', ['code' => 'BREB']);
        $this->assertDatabaseHas('utility_providers', ['code' => 'TITAS']);
        $this->assertDatabaseHas('utility_providers', ['code' => 'DWASA']);

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
            ->getJson('/api/v1/utility-providers');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 10);
    }

    public function test_utility_providers_are_not_readable_without_an_organization(): void
    {
        // A user with no active membership must not reach org-scoped data.
        $user = User::factory()->create();

        $this->actingAs($user)
            ->getJson('/api/v1/utility-providers')
            ->assertStatus(403);
    }

    public function test_user_can_log_meter_reading_and_calculate_cost(): void
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
        $provider = UtilityProvider::where('code', 'DPDC')->firstOrFail();

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/meter-readings', [
                'property_id' => $property->id,
                'utility_provider_id' => $provider->id,
                'meter_number' => 'MTR-DPDC-89421',
                'previous_reading' => 120.00,
                'current_reading' => 220.00, // 100 units consumed
                'rate_per_unit_bdt' => 8.50, // 850 poisha
                'reading_date' => '2026-08-01',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.units_consumed', 100)
            ->assertJsonPath('data.total_amount_poisha', 85000); // 850 BDT
    }

    public function test_mock_bd_sms_driver_dispatches_successfully(): void
    {
        $driver = new MockBDSmsDriver;
        $sent = $driver->sendSms('01711223344', 'Your rent invoice INV-202608-001 of 15,000 BDT is due.');

        $this->assertTrue($sent);
    }
}
