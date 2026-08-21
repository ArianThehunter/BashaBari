<?php

namespace Tests\Feature;

use App\Models\BuildingStaff;
use App\Models\Expense;
use App\Models\LedgerEntry;
use App\Models\Organization;
use App\Models\OrganizationMember;
use App\Models\Property;
use App\Models\User;
use App\Services\Expense\ExpenseRecorder;
use App\Support\BusinessTime;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ExpenseLedgerTest extends TestCase
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
    // Every expense reaches the ledger
    // ---------------------------------------------------------------

    public function test_a_logged_expense_writes_a_matching_ledger_entry(): void
    {
        $org = Organization::factory()->create();
        $user = $this->owner($org);
        $property = Property::factory()->create(['organization_id' => $org->id]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/expenses', [
                'property_id' => $property->id,
                'category' => 'plumbing',
                'amount_bdt' => 3500,
                'expense_date' => '2026-08-10',
                'vendor_name' => 'Karim Plumbing',
                'payment_method' => 'cash',
            ])
            ->assertStatus(201);

        $expense = Expense::withoutGlobalScope('organization')->firstOrFail();

        $this->assertDatabaseHas('ledger_entries', [
            'organization_id' => $org->id,
            'expense_id' => $expense->id,
            'type' => 'expense',
            'category' => 'plumbing',
            'amount' => 350000,
        ]);
    }

    public function test_a_salary_payment_reaches_the_ledger(): void
    {
        // Staff salaries created an `expenses` row and no ledger entry, so the
        // cash-flow report — which sums the ledger — omitted payroll entirely.
        $org = Organization::factory()->create();
        $user = $this->owner($org);
        $property = Property::factory()->create(['organization_id' => $org->id]);

        $staff = BuildingStaff::create([
            'organization_id' => $org->id,
            'property_id' => $property->id,
            'name' => 'Rahim Caretaker',
            'phone' => '01711000000',
            'staff_role' => 'caretaker',
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->postJson("/api/v1/building-staff/{$staff->id}/pay-salary", [
                'amount' => 1200000, // ৳12,000 in poisha
                'payment_method' => 'bkash',
            ])
            ->assertStatus(200);

        $this->assertDatabaseHas('ledger_entries', [
            'organization_id' => $org->id,
            'type' => 'expense',
            'category' => 'staff_salary',
            'amount' => 1200000,
        ]);

        // And the duty log is written in the same transaction.
        $this->assertDatabaseHas('staff_duty_logs', [
            'building_staff_id' => $staff->id,
            'action_type' => 'salary_paid',
            'amount_paid' => 1200000,
        ]);
    }

    public function test_the_cash_flow_report_includes_payroll(): void
    {
        $org = Organization::factory()->create();
        $user = $this->owner($org);
        $recorder = app(ExpenseRecorder::class);

        $recorder->record([
            'organization_id' => $org->id,
            'category' => 'staff_salary',
            'amount' => 1000000,
            'vendor_name' => 'Rahim',
        ]);

        $recorder->record([
            'organization_id' => $org->id,
            'category' => 'plumbing',
            'amount' => 250000,
            'vendor_name' => 'Karim',
        ]);

        $response = $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson('/api/v1/reports/cash-flow')
            ->assertStatus(200);

        // Before the fix, total_expense_poisha was 0 here while
        // staff_payroll_expense_poisha reported the full ৳10,000.
        $response
            ->assertJsonPath('summary.total_expense_poisha', 1250000)
            ->assertJsonPath('summary.staff_payroll_expense_poisha', 1000000)
            ->assertJsonPath('summary.property_repair_expense_poisha', 250000)
            ->assertJsonPath('summary.net_cash_flow_poisha', -1250000);
    }

    public function test_expense_detail_loads_its_ledger_entries(): void
    {
        // Expense::ledgerEntries() infers ledger_entries.expense_id, which did
        // not exist, so this endpoint returned a 500.
        $org = Organization::factory()->create();
        $user = $this->owner($org);

        $expense = app(ExpenseRecorder::class)->record([
            'organization_id' => $org->id,
            'category' => 'cleaning',
            'amount' => 50000,
        ]);

        $this->actingAs($user)
            ->withHeader('X-Organization-Id', $org->id)
            ->getJson("/api/v1/expenses/{$expense->id}")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data.ledger_entries');
    }

    // ---------------------------------------------------------------
    // Voucher numbering
    // ---------------------------------------------------------------

    public function test_voucher_numbers_are_sequential_and_unique(): void
    {
        $org = Organization::factory()->create();
        $recorder = app(ExpenseRecorder::class);

        $numbers = collect(range(1, 5))->map(fn () => $recorder->record([
            'organization_id' => $org->id,
            'category' => 'other',
            'amount' => 1000,
            'expense_date' => '2026-08-15',
        ])->expense_number);

        $this->assertSame(
            ['EXP-202608-001', 'EXP-202608-002', 'EXP-202608-003', 'EXP-202608-004', 'EXP-202608-005'],
            $numbers->all(),
        );
    }

    public function test_voucher_numbers_do_not_collide_across_the_three_write_paths(): void
    {
        // The three paths previously used three different schemes, two of them
        // rand(100, 999), all producing EXP-YYYYMM-NNN in the same namespace.
        $org = Organization::factory()->create();
        $user = $this->owner($org);
        $property = Property::factory()->create(['organization_id' => $org->id]);

        $staff = BuildingStaff::create([
            'organization_id' => $org->id,
            'property_id' => $property->id,
            'name' => 'Guard',
            'phone' => '01711000001',
            'staff_role' => 'security_guard',
            'status' => 'active',
        ]);

        $this->actingAs($user)->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/expenses', [
                'category' => 'repairs',
                'amount_bdt' => 100,
                'expense_date' => BusinessTime::todayString(),
                'payment_method' => 'cash',
            ])->assertStatus(201);

        $this->actingAs($user)->withHeader('X-Organization-Id', $org->id)
            ->postJson("/api/v1/building-staff/{$staff->id}/pay-salary", [
                'amount' => 500000,
                'payment_method' => 'cash',
            ])->assertStatus(200);

        $this->actingAs($user)->withHeader('X-Organization-Id', $org->id)
            ->postJson('/api/v1/vendor-visit-logs', [
                'property_id' => $property->id,
                'technician_name' => 'Elevator Tech',
                'technician_phone' => '01711000002',
                'service_category' => 'elevator',
                'entry_time' => '2026-08-21 10:00:00',
                'purpose_of_visit' => 'Annual service',
                'amount_paid' => 300000,
                'payment_method' => 'cash',
            ])->assertStatus(201);

        $numbers = Expense::withoutGlobalScope('organization')->pluck('expense_number');

        $this->assertCount(3, $numbers);
        $this->assertCount(3, $numbers->unique(), 'Voucher numbers collided across write paths.');

        // All three carry a ledger entry.
        $this->assertSame(3, LedgerEntry::withoutGlobalScope('organization')
            ->whereNotNull('expense_id')->count());
    }

    public function test_numbering_is_independent_per_organization(): void
    {
        $recorder = app(ExpenseRecorder::class);
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();

        $a = $recorder->record(['organization_id' => $orgA->id, 'category' => 'other', 'amount' => 1, 'expense_date' => '2026-08-01']);
        $b = $recorder->record(['organization_id' => $orgB->id, 'category' => 'other', 'amount' => 1, 'expense_date' => '2026-08-01']);

        $this->assertSame('EXP-202608-001', $a->expense_number);
        $this->assertSame('EXP-202608-001', $b->expense_number);
    }

    // ---------------------------------------------------------------
    // Business dates
    // ---------------------------------------------------------------

    public function test_an_expense_recorded_before_dawn_gets_the_dhaka_date(): void
    {
        // 01:00 Dhaka on 21 Aug is still 19:00 UTC on 20 Aug. The old code used
        // now()->toDateString() and filed the expense under the 20th.
        Carbon::setTestNow(Carbon::parse('2026-08-20 19:00:00', 'UTC'));

        $org = Organization::factory()->create();

        $expense = app(ExpenseRecorder::class)->record([
            'organization_id' => $org->id,
            'category' => 'other',
            'amount' => 1000,
        ]);

        $this->assertSame('2026-08-21', $expense->expense_date->toDateString());
        $this->assertSame('2026-08-21', BusinessTime::todayString());
        $this->assertSame('2026-08-20', now()->toDateString(), 'UTC really is a day behind here.');

        Carbon::setTestNow();
    }

    public function test_voucher_month_follows_the_dhaka_calendar(): void
    {
        // 00:30 Dhaka on 1 September is 18:30 UTC on 31 August, so date('Ym')
        // produced an August prefix for a September expense.
        Carbon::setTestNow(Carbon::parse('2026-08-31 18:30:00', 'UTC'));

        $org = Organization::factory()->create();

        $expense = app(ExpenseRecorder::class)->record([
            'organization_id' => $org->id,
            'category' => 'other',
            'amount' => 1000,
        ]);

        $this->assertStringStartsWith('EXP-202609-', $expense->expense_number);

        Carbon::setTestNow();
    }
}
