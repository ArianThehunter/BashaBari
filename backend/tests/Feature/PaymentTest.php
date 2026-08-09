<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);
    }

    public function test_user_can_initiate_sslcommerz_payment_session(): void
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

        $invoice = Invoice::create([
            'organization_id' => $org->id,
            'tenant_id' => $tenant->id,
            'invoice_number' => 'INV-202608-001',
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'issue_date' => '2026-08-01',
            'due_date' => '2026-08-05',
            'subtotal_amount' => 2000000,
            'total_amount' => 2000000,
            'paid_amount' => 0,
            'due_amount' => 2000000,
            'status' => 'unpaid',
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/payments/initiate-sslcommerz', [
                'invoice_id' => $invoice->id,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'SUCCESS')
            ->assertJsonPath('amount_bdt', 20000);

        $this->assertDatabaseHas('payments', [
            'organization_id' => $org->id,
            'invoice_id' => $invoice->id,
            'status' => 'pending',
        ]);
    }

    public function test_sslcommerz_success_callback_reconciles_invoice_and_creates_ledger(): void
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

        $invoice = Invoice::create([
            'organization_id' => $org->id,
            'tenant_id' => $tenant->id,
            'invoice_number' => 'INV-202608-002',
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'issue_date' => '2026-08-01',
            'due_date' => '2026-08-05',
            'subtotal_amount' => 2000000,
            'total_amount' => 2000000,
            'paid_amount' => 0,
            'due_amount' => 2000000,
            'status' => 'unpaid',
        ]);

        $payment = Payment::create([
            'organization_id' => $org->id,
            'invoice_id' => $invoice->id,
            'tenant_id' => $tenant->id,
            'transaction_number' => 'TRX-202608-888',
            'payment_method' => 'sslcommerz',
            'amount' => 2000000,
            'payment_date' => '2026-08-01',
            'status' => 'pending',
        ]);

        $response = $this->actingAs($user)
            ->postJson('/api/v1/payments/sslcommerz/success', [
                'tran_id' => 'TRX-202608-888',
                'val_id' => 'VAL-SSL-9999',
                'card_type' => 'BKASH-BKASH',
                'bank_tran_id' => 'BANK-8888',
            ]);

        $response->assertStatus(200);

        // Verify payment marked completed with SSLCommerz metadata
        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'completed',
            'val_id' => 'VAL-SSL-9999',
            'card_type' => 'BKASH-BKASH',
        ]);

        // Verify invoice balance auto-reconciled to paid
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'paid_amount' => 2000000,
            'due_amount' => 0,
            'status' => 'paid',
        ]);

        // Verify double-entry ledger entry created
        $this->assertDatabaseHas('ledger_entries', [
            'payment_id' => $payment->id,
            'type' => 'income',
            'category' => 'rent',
            'amount' => 2000000,
        ]);
    }

    public function test_financial_cash_flow_report(): void
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

        $invoice = Invoice::create([
            'organization_id' => $org->id,
            'tenant_id' => $tenant->id,
            'invoice_number' => 'INV-202608-003',
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'issue_date' => '2026-08-01',
            'due_date' => '2026-08-05',
            'subtotal_amount' => 3000000,
            'total_amount' => 3000000,
            'paid_amount' => 3000000,
            'due_amount' => 0,
            'status' => 'paid',
        ]);

        Payment::create([
            'organization_id' => $org->id,
            'invoice_id' => $invoice->id,
            'tenant_id' => $tenant->id,
            'transaction_number' => 'TRX-202608-777',
            'payment_method' => 'sslcommerz',
            'card_type' => 'NAGAD-NAGAD',
            'amount' => 3000000,
            'payment_date' => '2026-08-01',
            'status' => 'completed',
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/reports/cash-flow');

        $response->assertStatus(200)
            ->assertJsonPath('summary.total_collected_poisha', 3000000)
            ->assertJsonPath('summary.collection_rate_percentage', 100);
    }
}
