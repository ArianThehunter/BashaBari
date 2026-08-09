<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('lease_id')->nullable()->constrained('leases')->onDelete('set null');
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->string('invoice_number', 50);
            $table->integer('billing_period_month');
            $table->integer('billing_period_year');
            $table->date('issue_date');
            $table->date('due_date');
            $table->bigInteger('subtotal_amount'); // Stored in poisha (1 BDT = 100 poisha)
            $table->bigInteger('tax_amount')->default(0); // Stored in poisha
            $table->bigInteger('late_fee_amount')->default(0); // Stored in poisha
            $table->bigInteger('total_amount'); // Stored in poisha
            $table->bigInteger('paid_amount')->default(0); // Stored in poisha
            $table->bigInteger('due_amount'); // Stored in poisha
            $table->string('status', 20)->default('unpaid'); // 'draft', 'unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
