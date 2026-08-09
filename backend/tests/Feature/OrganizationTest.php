<?php

namespace Tests\Feature;

use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_user_can_create_organization_and_becomes_owner(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/organizations', [
            'name' => 'Dhaka Heights',
            'phone' => '01711000000',
            'email' => 'contact@dhakaheights.com',
            'address' => 'Gulshan 2, Dhaka',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.name', 'Dhaka Heights')
            ->assertJsonPath('data.slug', 'dhaka-heights')
            ->assertJsonPath('data.status', 'trial');

        $org = Organization::where('slug', 'dhaka-heights')->first();
        $this->assertNotNull($org);

        // BD-001: 5-day trial period
        $this->assertNotNull($org->trial_ends_at);
        $this->assertTrue($org->isTrial());

        // Check creator is assigned as owner
        $member = OrganizationMember::where('organization_id', $org->id)
            ->where('user_id', $user->id)
            ->first();

        $this->assertNotNull($member);
        $this->assertTrue($member->is_owner);
    }

    public function test_user_can_list_their_organizations(): void
    {
        $user = User::factory()->create();
        $org1 = Organization::factory()->create(['name' => 'Org 1', 'slug' => 'org-1']);
        $org2 = Organization::factory()->create(['name' => 'Org 2', 'slug' => 'org-2']);

        // User belongs to Org 1 only
        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org1->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/organizations');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Org 1');
    }

    public function test_owner_can_add_team_member(): void
    {
        $owner = User::factory()->create();
        $org = Organization::factory()->create();
        $caretakerRole = Role::where('slug', 'caretaker')->first();

        OrganizationMember::create([
            'user_id' => $owner->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $newMemberUser = User::factory()->create(['email' => 'caretaker@example.com']);

        $response = $this->actingAs($owner)->postJson("/api/v1/organizations/{$org->id}/members", [
            'email' => 'caretaker@example.com',
            'role_id' => $caretakerRole->id,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.email', 'caretaker@example.com');

        $this->assertDatabaseHas('organization_members', [
            'organization_id' => $org->id,
            'user_id' => $newMemberUser->id,
            'role_id' => $caretakerRole->id,
            'is_owner' => false,
        ]);
    }

    public function test_non_member_cannot_view_organization(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        $response = $this->actingAs($user)->getJson("/api/v1/organizations/{$org->id}");

        $response->assertStatus(404);
    }
}
