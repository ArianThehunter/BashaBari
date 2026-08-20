<?php

namespace Tests\Feature;

use App\Exceptions\MissingOrganizationContextException;
use App\Models\BuildingStaff;
use App\Models\Invoice;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Property;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Invoice\InvoiceNumberGenerator;
use App\Support\OrganizationContext;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenancyIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    private function owner(Organization $org): User
    {
        $user = User::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        return $user;
    }

    // ---------------------------------------------------------------
    // Organization scoping
    // ---------------------------------------------------------------

    public function test_org_scoped_queries_refuse_to_run_without_context(): void
    {
        $context = app(OrganizationContext::class);
        $context->enforce();

        $this->expectException(MissingOrganizationContextException::class);

        // Previously this silently returned every organization's properties.
        Property::query()->get();
    }

    public function test_a_user_only_sees_properties_from_their_own_organization(): void
    {
        $org = Organization::factory()->create();
        $user = $this->owner($org);
        Property::factory()->create(['organization_id' => $org->id, 'name' => 'Mine']);

        $otherOrg = Organization::factory()->create();
        Property::factory()->create(['organization_id' => $otherOrg->id, 'name' => 'Theirs']);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/properties')
            ->assertStatus(200)
            ->assertJsonFragment(['name' => 'Mine'])
            ->assertJsonMissing(['name' => 'Theirs']);
    }

    public function test_building_staff_of_another_organization_are_not_listed(): void
    {
        // BuildingStaff previously had no organization scoping at all: the
        // endpoint applied no filter and the model had no global scope.
        $org = Organization::factory()->create();
        $user = $this->owner($org);

        $otherOrg = Organization::factory()->create();
        $otherProperty = Property::factory()->create(['organization_id' => $otherOrg->id]);

        BuildingStaff::create([
            'organization_id' => $otherOrg->id,
            'property_id' => $otherProperty->id,
            'name' => 'Another Landlord Caretaker',
            'phone' => '01799999999',
            'staff_role' => 'caretaker',
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/building-staff')
            ->assertStatus(200)
            ->assertJsonMissing(['name' => 'Another Landlord Caretaker']);
    }

    // ---------------------------------------------------------------
    // RBAC
    // ---------------------------------------------------------------

    public function test_a_role_without_the_permission_is_refused(): void
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create();

        // Caretakers may view properties but not create them.
        $caretaker = Role::where('slug', 'caretaker')->firstOrFail();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'role_id' => $caretaker->id,
            'is_owner' => false,
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/properties')
            ->assertStatus(200);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/properties', ['name' => 'Unauthorized Tower'])
            ->assertStatus(403);

        $this->assertDatabaseMissing('properties', ['name' => 'Unauthorized Tower']);
    }

    public function test_a_member_with_no_role_holds_no_permissions(): void
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => false,
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/properties')
            ->assertStatus(403);
    }

    // ---------------------------------------------------------------
    // Tenant portal identity
    // ---------------------------------------------------------------

    public function test_portal_does_not_match_a_tenant_by_phone_number(): void
    {
        // The old resolver was `where('email', ...)->orWhere('phone', ...)`
        // across all organizations. Phone numbers are never verified at
        // signup, so registering with a tenant's number exposed their lease,
        // invoices and balances.
        $org = Organization::factory()->create();

        Tenant::factory()->create([
            'organization_id' => $org->id,
            'name' => 'Real Tenant',
            'email' => 'real.tenant@example.com',
            'phone' => '01712345678',
            'user_id' => null,
        ]);

        $attacker = User::factory()->create([
            'email' => 'attacker@example.com',
            'phone' => '01712345678', // same number, unverified
            'email_verified_at' => now(),
        ]);

        $this->actingAs($attacker)
            ->getJson('/api/v1/tenant-portal/overview')
            ->assertStatus(404);
    }

    public function test_portal_resolves_a_tenant_linked_by_user_id(): void
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create(['email_verified_at' => now()]);

        Tenant::factory()->create([
            'organization_id' => $org->id,
            'name' => 'Linked Tenant',
            'user_id' => $user->id,
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/tenant-portal/overview')
            ->assertStatus(200)
            ->assertJsonPath('tenant.name', 'Linked Tenant');
    }

    public function test_portal_claim_by_email_requires_a_verified_address(): void
    {
        $org = Organization::factory()->create();

        Tenant::factory()->create([
            'organization_id' => $org->id,
            'name' => 'Claimable Tenant',
            'email' => 'claimable@example.com',
            'user_id' => null,
        ]);

        $unverified = User::factory()->create([
            'email' => 'claimable@example.com',
            'email_verified_at' => null,
        ]);

        $this->actingAs($unverified)
            ->getJson('/api/v1/tenant-portal/overview')
            ->assertStatus(404);

        $unverified->forceFill(['email_verified_at' => now()])->save();

        $this->actingAs($unverified)
            ->getJson('/api/v1/tenant-portal/overview')
            ->assertStatus(200)
            ->assertJsonPath('tenant.name', 'Claimable Tenant');

        // The claim is persisted, so it happens once.
        $this->assertDatabaseHas('tenants', [
            'email' => 'claimable@example.com',
            'user_id' => $unverified->id,
        ]);
    }

    public function test_a_tenant_cannot_see_another_tenants_invoices(): void
    {
        $org = Organization::factory()->create();

        $user = User::factory()->create(['email_verified_at' => now()]);
        $mine = Tenant::factory()->create(['organization_id' => $org->id, 'user_id' => $user->id]);
        $theirs = Tenant::factory()->create(['organization_id' => $org->id]);

        foreach ([[$mine, 'INV-202608-MINE'], [$theirs, 'INV-202608-THEIRS']] as [$tenant, $number]) {
            Invoice::create([
                'organization_id' => $org->id,
                'tenant_id' => $tenant->id,
                'invoice_number' => $number,
                'billing_period_month' => 8,
                'billing_period_year' => 2026,
                'issue_date' => '2026-08-01',
                'due_date' => '2026-08-05',
                'subtotal_amount' => 500000,
                'total_amount' => 500000,
                'paid_amount' => 0,
                'due_amount' => 500000,
                'status' => 'unpaid',
            ]);
        }

        $this->actingAs($user)
            ->getJson('/api/v1/tenant-portal/invoices')
            ->assertStatus(200)
            ->assertJsonFragment(['invoice_number' => 'INV-202608-MINE'])
            ->assertJsonMissing(['invoice_number' => 'INV-202608-THEIRS']);
    }

    // ---------------------------------------------------------------
    // Invoice numbering
    // ---------------------------------------------------------------

    public function test_invoice_numbers_are_not_reused_after_a_soft_delete(): void
    {
        $org = Organization::factory()->create();
        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);
        $numbers = app(InvoiceNumberGenerator::class);

        $make = function (string $number) use ($org, $tenant) {
            return Invoice::create([
                'organization_id' => $org->id,
                'tenant_id' => $tenant->id,
                'invoice_number' => $number,
                'billing_period_month' => 8,
                'billing_period_year' => 2026,
                'issue_date' => '2026-08-01',
                'due_date' => '2026-08-05',
                'subtotal_amount' => 100000,
                'total_amount' => 100000,
                'paid_amount' => 0,
                'due_amount' => 100000,
                'status' => 'unpaid',
            ]);
        };

        $this->assertSame('INV-202608-001', $numbers->next($org->id, 2026, 8));
        $first = $make('INV-202608-001');

        $this->assertSame('INV-202608-002', $numbers->next($org->id, 2026, 8));
        $make('INV-202608-002');

        // Under `count() + 1`, deleting one freed its number for reuse and the
        // next allocation collided with a live invoice.
        $first->delete();

        $this->assertSame('INV-202608-003', $numbers->next($org->id, 2026, 8));
    }

    public function test_invoice_numbering_is_independent_per_organization(): void
    {
        $numbers = app(InvoiceNumberGenerator::class);

        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();
        $tenantA = Tenant::factory()->create(['organization_id' => $orgA->id]);

        Invoice::create([
            'organization_id' => $orgA->id,
            'tenant_id' => $tenantA->id,
            'invoice_number' => 'INV-202608-001',
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'issue_date' => '2026-08-01',
            'due_date' => '2026-08-05',
            'subtotal_amount' => 100000,
            'total_amount' => 100000,
            'paid_amount' => 0,
            'due_amount' => 100000,
            'status' => 'unpaid',
        ]);

        $this->assertSame('INV-202608-002', $numbers->next($orgA->id, 2026, 8));
        $this->assertSame('INV-202608-001', $numbers->next($orgB->id, 2026, 8));
    }
}
