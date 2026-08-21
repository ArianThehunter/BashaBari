<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Organization;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Invoice>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $rentPoisha = 2000000;

        return [
            'organization_id' => Organization::factory(),
            'tenant_id' => Tenant::factory(),
            'unit_id' => Unit::factory(),
            'invoice_number' => 'INV-202608-'.str_pad((string) fake()->numberBetween(1, 999), 3, '0', STR_PAD_LEFT),
            'billing_period_month' => 8,
            'billing_period_year' => 2026,
            'issue_date' => '2026-08-01',
            'due_date' => '2026-08-05',
            'subtotal_amount' => $rentPoisha,
            'tax_amount' => 0,
            'late_fee_amount' => 0,
            'total_amount' => $rentPoisha,
            'paid_amount' => 0,
            'due_amount' => $rentPoisha,
            'status' => 'unpaid',
            'notes' => 'Monthly Rent Bill',
        ];
    }
}
