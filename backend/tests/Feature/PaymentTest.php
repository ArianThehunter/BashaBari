<?php

namespace Tests\Feature;

use App\Models\Invoice;
use App\Models\LedgerEntry;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Payment;
use App\Models\Role;
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

        // The gateway callback is unauthenticated; authorization comes from the
        // signature the driver verifies, not from the session.
        $response = $this->postJson('/api/v1/gateway/sslcommerz/ipn', $this->signedCallback([
            'tran_id' => 'TRX-202608-888',
            'amount' => '20000.00',
            'val_id' => 'VAL-SSL-9999',
            'card_type' => 'BKASH-BKASH',
            'bank_tran_id' => 'BANK-8888',
        ]));

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

    /**
     * Build a callback payload signed the way the sandbox gateway signs it.
     */
    private function signedCallback(array $payload): array
    {
        $amountPoisha = (int) round(((float) $payload['amount']) * 100);
        $secret = config('services.sslcommerz.store_passwd') ?: config('app.key');

        $payload['signature'] = hash_hmac(
            'sha256',
            $payload['tran_id'].'|'.$amountPoisha,
            (string) $secret
        );

        return $payload;
    }

    public function test_unsigned_gateway_callback_cannot_mark_a_payment_paid(): void
    {
        $org = Organization::factory()->create();
        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);

        $payment = Payment::create([
            'organization_id' => $org->id,
            'tenant_id' => $tenant->id,
            'transaction_number' => 'TRX-202608-FORGED',
            'payment_method' => 'sslcommerz',
            'amount' => 5000000,
            'payment_date' => '2026-08-01',
            'status' => 'pending',
        ]);

        // Exactly what the previous implementation accepted: a bare tran_id.
        $this->postJson('/api/v1/gateway/sslcommerz/ipn', [
            'tran_id' => 'TRX-202608-FORGED',
            'val_id' => 'VAL-ATTACKER',
        ])->assertStatus(422);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'pending',
        ]);

        $this->assertDatabaseMissing('ledger_entries', ['payment_id' => $payment->id]);
    }

    public function test_gateway_callback_rejects_an_amount_that_does_not_match(): void
    {
        $org = Organization::factory()->create();
        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);

        Payment::create([
            'organization_id' => $org->id,
            'tenant_id' => $tenant->id,
            'transaction_number' => 'TRX-202608-SHORT',
            'payment_method' => 'sslcommerz',
            'amount' => 5000000, // 50,000 BDT expected
            'payment_date' => '2026-08-01',
            'status' => 'pending',
        ]);

        // Correctly signed, but for 1 BDT rather than 50,000.
        $this->postJson('/api/v1/gateway/sslcommerz/ipn', $this->signedCallback([
            'tran_id' => 'TRX-202608-SHORT',
            'amount' => '1.00',
        ]))->assertStatus(422);

        $this->assertDatabaseHas('payments', [
            'transaction_number' => 'TRX-202608-SHORT',
            'status' => 'failed',
        ]);
    }

    public function test_repeated_gateway_callbacks_are_idempotent(): void
    {
        $org = Organization::factory()->create();
        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);

        $invoice = Invoice::create([
            'organization_id' => $org->id,
            'tenant_id' => $tenant->id,
            'invoice_number' => 'INV-202608-IDEM',
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'issue_date' => '2026-08-01',
            'due_date' => '2026-08-05',
            'subtotal_amount' => 1000000,
            'total_amount' => 1000000,
            'paid_amount' => 0,
            'due_amount' => 1000000,
            'status' => 'unpaid',
        ]);

        $payment = Payment::create([
            'organization_id' => $org->id,
            'invoice_id' => $invoice->id,
            'tenant_id' => $tenant->id,
            'transaction_number' => 'TRX-202608-IDEM',
            'payment_method' => 'sslcommerz',
            'amount' => 1000000,
            'payment_date' => '2026-08-01',
            'status' => 'pending',
        ]);

        $callback = $this->signedCallback(['tran_id' => 'TRX-202608-IDEM', 'amount' => '10000.00']);

        $this->postJson('/api/v1/gateway/sslcommerz/ipn', $callback)->assertStatus(200);
        $this->postJson('/api/v1/gateway/sslcommerz/ipn', $callback)->assertStatus(200);

        // The invoice must not be credited twice.
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'paid_amount' => 1000000,
            'due_amount' => 0,
            'status' => 'paid',
        ]);

        $this->assertSame(1, LedgerEntry::withoutGlobalScope('organization')
            ->where('payment_id', $payment->id)
            ->count());
    }

    public function test_a_payment_cannot_be_attached_to_another_organizations_invoice(): void
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

        // A different landlord: separate organization, separate invoice.
        $otherOrg = Organization::factory()->create();
        $otherTenant = Tenant::factory()->create(['organization_id' => $otherOrg->id]);

        $foreignInvoice = Invoice::create([
            'organization_id' => $otherOrg->id,
            'tenant_id' => $otherTenant->id,
            'invoice_number' => 'INV-202608-FOREIGN',
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'issue_date' => '2026-08-01',
            'due_date' => '2026-08-05',
            'subtotal_amount' => 900000,
            'total_amount' => 900000,
            'paid_amount' => 0,
            'due_amount' => 900000,
            'status' => 'unpaid',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/payments', [
                'tenant_id' => $tenant->id,
                'invoice_id' => $foreignInvoice->id,
                'payment_method' => 'cash',
                'amount_bdt' => 9000,
                'payment_date' => '2026-08-01',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('invoice_id');
    }

    public function test_payments_of_another_organization_are_not_listed(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $otherOrg = Organization::factory()->create();
        $otherTenant = Tenant::factory()->create(['organization_id' => $otherOrg->id]);

        Payment::create([
            'organization_id' => $otherOrg->id,
            'tenant_id' => $otherTenant->id,
            'transaction_number' => 'TRX-202608-OTHERORG',
            'payment_method' => 'cash',
            'amount' => 700000,
            'payment_date' => '2026-08-01',
            'status' => 'completed',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/payments')
            ->assertStatus(200)
            ->assertJsonPath('meta.total', 0)
            ->assertJsonMissing(['transaction_number' => 'TRX-202608-OTHERORG']);
    }

    public function test_refunding_the_only_payment_returns_the_invoice_to_unpaid(): void
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create();

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
            'invoice_number' => 'INV-202608-REFUND',
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'issue_date' => '2026-08-01',
            'due_date' => '2026-08-05',
            'subtotal_amount' => 1500000,
            'total_amount' => 1500000,
            'paid_amount' => 1500000,
            'due_amount' => 0,
            'status' => 'paid',
        ]);

        $payment = Payment::create([
            'organization_id' => $org->id,
            'invoice_id' => $invoice->id,
            'tenant_id' => $tenant->id,
            'transaction_number' => 'TRX-202608-REFUNDME',
            'payment_method' => 'cash',
            'amount' => 1500000,
            'payment_date' => '2026-08-01',
            'status' => 'completed',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson("/api/v1/payments/{$payment->id}/refund")
            ->assertStatus(200);

        // The balance must follow the money: the invoice is owed again.
        $this->assertDatabaseHas('invoices', [
            'id' => $invoice->id,
            'paid_amount' => 0,
            'due_amount' => 1500000,
            'status' => 'unpaid',
        ]);
    }

    public function test_a_non_owner_cannot_issue_a_refund(): void
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create();

        $accountant = Role::where('slug', 'accountant')->firstOrFail();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'role_id' => $accountant->id,
            'is_owner' => false,
            'status' => 'active',
        ]);

        $tenant = Tenant::factory()->create(['organization_id' => $org->id]);

        $payment = Payment::create([
            'organization_id' => $org->id,
            'tenant_id' => $tenant->id,
            'transaction_number' => 'TRX-202608-NOREFUND',
            'payment_method' => 'cash',
            'amount' => 100000,
            'payment_date' => '2026-08-01',
            'status' => 'completed',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson("/api/v1/payments/{$payment->id}/refund")
            ->assertStatus(403);

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'completed',
        ]);
    }

    public function test_requesting_an_organization_you_do_not_belong_to_is_denied(): void
    {
        $user = User::factory()->create();
        $org = Organization::factory()->create();

        OrganizationMember::create([
            'user_id' => $user->id,
            'organization_id' => $org->id,
            'is_owner' => true,
            'status' => 'active',
        ]);

        $otherOrg = Organization::factory()->create();

        // Previously this silently fell back to the user's own membership.
        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $otherOrg->id)
            ->getJson('/api/v1/payments')
            ->assertStatus(403);
    }
}
