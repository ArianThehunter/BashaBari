<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Lease;
use App\Models\Organization;
use App\Services\Invoice\InvoiceNumberGenerator;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateMonthlyInvoicesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'invoices:generate-monthly {--month= : Target billing month (1-12)} {--year= : Target billing year (e.g. 2026)} {--org= : Target organization ID (optional)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automate generation of monthly rent invoices across active leases in Bangladesh Timezone';

    /**
     * Execute the console command.
     */
    public function handle(InvoiceNumberGenerator $numbers): int
    {
        $today = Carbon::today('Asia/Dhaka');
        $month = (int) ($this->option('month') ?: $today->month);
        $year = (int) ($this->option('year') ?: $today->year);
        $targetOrgId = $this->option('org');

        $this->info("Starting Automated Monthly Invoicing for {$year}-".str_pad((string) $month, 2, '0', STR_PAD_LEFT).' [Asia/Dhaka]...');

        $organizationsQuery = Organization::query()->whereIn('status', ['active', 'trial']);
        if ($targetOrgId) {
            $organizationsQuery->where('id', $targetOrgId);
        }

        $organizations = $organizationsQuery->get();
        $totalInvoicesGenerated = 0;

        foreach ($organizations as $org) {
            $leases = Lease::where('organization_id', $org->id)
                ->where('status', 'active')
                ->with(['tenant', 'unit'])
                ->get();

            if ($leases->isEmpty()) {
                continue;
            }

            DB::transaction(function () use ($leases, $org, $month, $year, $numbers, &$totalInvoicesGenerated) {
                foreach ($leases as $lease) {
                    $exists = Invoice::where('organization_id', $org->id)
                        ->where('lease_id', $lease->id)
                        ->where('billing_period_month', $month)
                        ->where('billing_period_year', $year)
                        ->exists();

                    if ($exists) {
                        continue;
                    }

                    $invoiceNumber = $numbers->next($org->id, $year, $month);

                    $billingDay = min($lease->billing_day ?: 5, 28);
                    $issueDate = Carbon::createFromDate($year, $month, 1, 'Asia/Dhaka')->toDateString();
                    $dueDate = Carbon::createFromDate($year, $month, $billingDay, 'Asia/Dhaka')->toDateString();

                    $subtotal = $lease->rent_amount;
                    $taxAmount = 0;
                    $totalAmount = $subtotal + $taxAmount;

                    $invoice = Invoice::create([
                        'organization_id' => $org->id,
                        'lease_id' => $lease->id,
                        'tenant_id' => $lease->tenant_id,
                        'unit_id' => $lease->unit_id,
                        'invoice_number' => $invoiceNumber,
                        'billing_period_month' => $month,
                        'billing_period_year' => $year,
                        'issue_date' => $issueDate,
                        'due_date' => $dueDate,
                        'subtotal_amount' => $subtotal,
                        'tax_amount' => $taxAmount,
                        'discount_amount' => 0,
                        'total_amount' => $totalAmount,
                        'paid_amount' => 0,
                        'due_amount' => $totalAmount,
                        'status' => 'unpaid',
                        'notes' => "Automated Monthly Rent for {$year}-{$month}",
                    ]);

                    InvoiceItem::create([
                        'invoice_id' => $invoice->id,
                        'type' => 'rent',
                        'description' => "Monthly Rent for Unit {$lease->unit?->unit_number} ({$year}-{$month})",
                        'quantity' => 1,
                        'unit_price' => $subtotal,
                        'total_amount' => $subtotal,
                    ]);

                    $totalInvoicesGenerated++;
                }
            });
        }

        $this->info("Completed. Total Invoices Generated: {$totalInvoicesGenerated}");
        Log::info("GenerateMonthlyInvoicesCommand completed. Invoices generated: {$totalInvoicesGenerated}");

        return Command::SUCCESS;
    }
}
