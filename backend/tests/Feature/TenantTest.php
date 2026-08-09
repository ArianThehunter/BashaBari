<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_user_can_create_tenant_profile(): void
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
            ->postJson('/api/v1/tenants', [
                'name' => 'Mohammad Rahim',
                'email' => 'rahim@example.com',
                'phone' => '01711223344',
                'nid_number' => '19902692837182910',
                'father_name' => 'Abdul Karim',
                'permanent_address' => 'Village: Rampur, Upazila: Feni Sadar, Feni',
                'occupation' => 'Software Engineer',
                'emergency_contact_name' => 'Abdur Rahman',
                'emergency_contact_phone' => '01811998877',
                'emergency_contact_relation' => 'Brother',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Mohammad Rahim')
            ->assertJsonPath('data.nid_number', '19902692837182910');

        $this->assertDatabaseHas('tenants', [
            'organization_id' => $org->id,
            'name' => 'Mohammad Rahim',
            'nid_number' => '19902692837182910',
        ]);
    }

    public function test_user_can_search_tenants_by_name_or_nid(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        Tenant::factory()->create([
            'organization_id' => $org->id,
            'name' => 'Kamal Hossain',
            'nid_number' => '9988776655',
        ]);

        Tenant::factory()->create([
            'organization_id' => $org->id,
            'name' => 'Selim Chowdhury',
            'nid_number' => '1122334455',
        ]);

        // Search by NID
        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/tenants?search=9988776655');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Kamal Hossain');
    }

    public function test_tenant_data_is_isolated_between_organizations(): void
    {
        $userA = User::factory()->create();
        $orgA = Organization::factory()->create();
        OrganizationMember::create([
            'user_id' => $userA->id,
            'organization_id' => $orgA->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $userB = User::factory()->create();
        $orgB = Organization::factory()->create();
        OrganizationMember::create([
            'user_id' => $userB->id,
            'organization_id' => $orgB->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        Tenant::factory()->create([
            'organization_id' => $orgA->id,
            'name' => 'Org A Tenant',
        ]);

        Tenant::factory()->create([
            'organization_id' => $orgB->id,
            'name' => 'Org B Tenant',
        ]);

        $response = $this->actingAs($userA)
            ->withHeader('X-Organization-Id', $orgA->id)
            ->getJson('/api/v1/tenants');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Org A Tenant');
    }
}
