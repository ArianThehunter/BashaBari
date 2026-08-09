<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\MaintenanceRequest;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Property;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MaintenanceAndExpenseTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_user_can_submit_and_update_maintenance_request_ticket(): void
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

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/maintenance-requests', [
                'property_id' => $property->id,
                'title' => 'Elevator Emergency Sensor Failure',
                'description' => 'Lift stopped between 2nd and 3rd floor.',
                'category' => 'elevator',
                'priority' => 'emergency',
                'estimated_cost_bdt' => 15000,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.priority', 'emergency')
            ->assertJsonPath('data.status', 'pending');

        $ticketId = $response->json('data.id');

        // Update status to in_progress with assigned vendor
        $updateResponse = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->putJson("/api/v1/maintenance-requests/{$ticketId}", [
                'status' => 'in_progress',
                'assigned_vendor_name' => 'Dhaka Elevator Repair Services',
                'assigned_vendor_phone' => '01711223344',
            ]);

        $updateResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.assigned_vendor_name', 'Dhaka Elevator Repair Services');
    }

    public function test_logging_expense_creates_exp_number_and_ledger_entry(): void
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

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/expenses', [
                'property_id' => $property->id,
                'category' => 'plumbing',
                'amount_bdt' => 5000,
                'expense_date' => '2026-08-01',
                'vendor_name' => 'Rahim Plumbing Shop',
                'payment_method' => 'cash',
                'notes' => 'Replaced main pipe valve',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.amount', 500000);

        $expenseId = $response->json('data.id');

        $this->assertDatabaseHas('expenses', [
            'id' => $expenseId,
            'organization_id' => $org->id,
            'amount' => 500000,
        ]);

        // Verify ledger entry created
        $this->assertDatabaseHas('ledger_entries', [
            'organization_id' => $org->id,
            'type' => 'expense',
            'category' => 'plumbing',
            'amount' => 500000,
        ]);
    }
}
