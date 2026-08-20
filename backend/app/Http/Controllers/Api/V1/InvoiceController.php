<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\Lease;
use App\Models\OrganizationMember;
use App\Services\Invoice\InvoiceNumberGenerator;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    /**
     * Display a listing of invoices for the active organization.
     */
    public function index(Request $request): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->query('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $status = $request->query('status');
        $search = $request->query('search');

        // Auto-update overdue status for past due unpaid invoices
        Invoice::where('organization_id', $member->organization_id)
            ->whereIn('status', ['unpaid', 'partially_paid'])
            ->where('due_date', '<', Carbon::today()->toDateString())
            ->update(['status' => 'overdue']);

        $query = Invoice::query()
            ->where('organization_id', $member->organization_id)
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($search, function ($q, $term) {
                $q->where(function ($sub) use ($term) {
                    $sub->where('invoice_number', 'like', "%{$term}%")
                        ->orWhereHas('tenant', fn ($t) => $t->where('name', 'like', "%{$term}%"));
                });
            })
            ->with(['tenant', 'unit.property', 'items'])
            ->latest('issue_date');

        $invoices = $query->get();

        // Calculate aggregate billing metrics for active organization (in poisha)
        $totalBilledPoisha = Invoice::where('organization_id', $member->organization_id)
            ->where('status', '!=', 'cancelled')
            ->sum('total_amount');

        $totalCollectedPoisha = Invoice::where('organization_id', $member->organization_id)
            ->where('status', '!=', 'cancelled')
            ->sum('paid_amount');

        $totalOutstandingPoisha = Invoice::where('organization_id', $member->organization_id)
            ->whereIn('status', ['unpaid', 'partially_paid', 'overdue'])
            ->sum('due_amount');

        return response()->json([
            'data' => $invoices,
            'meta' => [
                'total_billed_poisha' => (int) $totalBilledPoisha,
                'total_collected_poisha' => (int) $totalCollectedPoisha,
                'total_outstanding_poisha' => (int) $totalOutstandingPoisha,
            ],
        ]);
    }

    /**
     * Batch generate monthly rent invoices for active organization leases.
     */
    public function generate(Request $request, InvoiceNumberGenerator $numbers): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->input('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $request->validate([
            'month' => ['required', 'integer', 'min:1', 'max:12'],
            'year' => ['required', 'integer', 'min:2020', 'max:2100'],
        ]);

        $month = (int) $request->month;
        $year = (int) $request->year;

        // Fetch active leases for organization
        $activeLeases = Lease::where('organization_id', $member->organization_id)
            ->where('status', 'active')
            ->with(['tenant', 'unit'])
            ->get();

        if ($activeLeases->isEmpty()) {
            return response()->json([
                'message' => 'No active leases found for generating monthly invoices.',
                'generated_count' => 0,
            ]);
        }

        $generatedCount = 0;
        $monthPadded = str_pad((string) $month, 2, '0', STR_PAD_LEFT);

        DB::transaction(function () use ($activeLeases, $member, $month, $year, $monthPadded, $numbers, &$generatedCount) {
            foreach ($activeLeases as $lease) {
                // Check if invoice already exists for this lease and month
                $exists = Invoice::where('organization_id', $member->organization_id)
                    ->where('lease_id', $lease->id)
                    ->where('billing_period_month', $month)
                    ->where('billing_period_year', $year)
                    ->exists();

                if ($exists) {
                    continue;
                }

                // Allocated under a row lock; see InvoiceNumberGenerator.
                $invoiceNumber = $numbers->next($member->organization_id, $year, $month);

                // Compute issue and due dates
                $issueDate = Carbon::createFromDate($year, $month, 1)->toDateString();
                $dueDay = min($lease->billing_day ?: 1, Carbon::createFromDate($year, $month, 1)->daysInMonth);
                $dueDate = Carbon::createFromDate($year, $month, $dueDay)->toDateString();

                $rentAmountPoisha = (int) $lease->rent_amount;

                $invoice = Invoice::create([
                    'organization_id' => $member->organization_id,
                    'lease_id' => $lease->id,
                    'tenant_id' => $lease->tenant_id,
                    'unit_id' => $lease->unit_id,
                    'invoice_number' => $invoiceNumber,
                    'billing_period_month' => $month,
                    'billing_period_year' => $year,
                    'issue_date' => $issueDate,
                    'due_date' => $dueDate,
                    'subtotal_amount' => $rentAmountPoisha,
                    'tax_amount' => 0,
                    'late_fee_amount' => 0,
                    'total_amount' => $rentAmountPoisha,
                    'paid_amount' => 0,
                    'due_amount' => $rentAmountPoisha,
                    'status' => 'unpaid',
                    'notes' => "Monthly Rent Bill for {$monthPadded}/{$year}",
                ]);

                // Create line item for base rent
                $monthName = Carbon::createFromDate($year, $month, 1)->format('F Y');
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => "Monthly Base Rent ({$monthName})",
                    'quantity' => 1,
                    'unit_amount' => $rentAmountPoisha,
                    'total_amount' => $rentAmountPoisha,
                ]);

                $generatedCount++;
            }
        });

        return response()->json([
            'message' => "Successfully generated {$generatedCount} monthly invoices for {$monthPadded}/{$year}.",
            'generated_count' => $generatedCount,
        ]);
    }

    /**
     * Store a newly created custom invoice with line items.
     */
    public function store(Request $request, InvoiceNumberGenerator $numbers): JsonResponse
    {
        $organizationId = $request->header('X-Organization-Id') ?: $request->input('organization_id');
        $user = $request->user();

        $member = OrganizationMember::where('user_id', $user->id)
            ->where('status', 'active')
            ->when($organizationId, fn ($q) => $q->where('organization_id', $organizationId))
            ->first();

        if (! $member) {
            return response()->json(['message' => 'No active organization selected.'], 400);
        }

        $request->validate([
            'tenant_id' => ['required', $this->orgExists('tenants')],
            'unit_id' => ['nullable', $this->orgExists('units')],
            'lease_id' => ['nullable', $this->orgExists('leases')],
            'billing_period_month' => ['required', 'integer', 'min:1', 'max:12'],
            'billing_period_year' => ['required', 'integer', 'min:2020'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issue_date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_amount' => ['required', 'numeric', 'min:0'], // In poisha
            'notes' => ['nullable', 'string'],
        ]);

        $invoiceNumber = DB::transaction(fn () => $numbers->next(
            $member->organization_id,
            (int) $request->billing_period_year,
            (int) $request->billing_period_month,
        ));

        return DB::transaction(function () use ($request, $member, $invoiceNumber) {
            $subtotalPoisha = 0;

            foreach ($request->items as $item) {
                $subtotalPoisha += (int) round($item['unit_amount']) * (int) $item['quantity'];
            }

            $invoice = Invoice::create([
                'organization_id' => $member->organization_id,
                'lease_id' => $request->lease_id,
                'tenant_id' => $request->tenant_id,
                'unit_id' => $request->unit_id,
                'invoice_number' => $invoiceNumber,
                'billing_period_month' => $request->billing_period_month,
                'billing_period_year' => $request->billing_period_year,
                'issue_date' => $request->issue_date,
                'due_date' => $request->due_date,
                'subtotal_amount' => $subtotalPoisha,
                'tax_amount' => 0,
                'late_fee_amount' => 0,
                'total_amount' => $subtotalPoisha,
                'paid_amount' => 0,
                'due_amount' => $subtotalPoisha,
                'status' => 'unpaid',
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                $qty = (int) $item['quantity'];
                $unitAmt = (int) round($item['unit_amount']);
                InvoiceItem::create([
                    'invoice_id' => $invoice->id,
                    'description' => $item['description'],
                    'quantity' => $qty,
                    'unit_amount' => $unitAmt,
                    'total_amount' => $qty * $unitAmt,
                ]);
            }

            return response()->json([
                'message' => 'Invoice created successfully.',
                'data' => $invoice->load(['tenant', 'unit', 'items']),
            ], 201);
        });
    }

    /**
     * Display specified invoice details.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $invoice = Invoice::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('status', 'active');
            })
            ->with(['organization', 'tenant', 'unit.property', 'unit.building', 'items'])
            ->findOrFail($id);

        return response()->json([
            'data' => $invoice,
        ]);
    }

    /**
     * Soft-delete invoice.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $invoice = Invoice::query()
            ->whereHas('organization.members', function ($query) use ($user) {
                $query->where('user_id', $user->id)->where('is_owner', true);
            })
            ->findOrFail($id);

        $invoice->delete();

        return response()->json([
            'message' => 'Invoice deleted successfully.',
        ]);
    }
}
