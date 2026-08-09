<?php

namespace Database\Factories;

use App\Models\Organization;
use App\Models\Payment;
use App\Models\Tenant;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amountPoisha = 2000000;

        return [
            'organization_id' => Organization::factory(),
            'tenant_id' => Tenant::factory(),
            'unit_id' => Unit::factory(),
            'transaction_number' => 'TRX-202608-'.fake()->numberBetween(100, 999),
            'val_id' => 'VAL-SSL-'.fake()->alphanumeric(10),
            'bank_tran_id' => 'BANK-'.fake()->numberBetween(100000, 999999),
            'payment_method' => 'sslcommerz',
            'card_type' => 'BKASH-BKASH',
            'card_no' => '0171****890',
            'amount' => $amountPoisha,
            'store_amount' => $amountPoisha,
            'currency' => 'BDT',
            'payment_date' => '2026-08-01',
            'status' => 'completed',
            'notes' => 'Rent Payment via bKash',
        ];
    }
}
