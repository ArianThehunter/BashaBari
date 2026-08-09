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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->nullable()->constrained('properties')->onDelete('set null');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->foreignId('maintenance_request_id')->nullable()->constrained('maintenance_requests')->onDelete('set null');
            $table->string('expense_number', 50); // EXP-YYYYMM-XXX
            $table->string('category', 50); // 'plumbing', 'electrical', 'painting', 'elevator', 'cleaning', 'repairs', 'utility_bill', 'tax', 'other'
            $table->bigInteger('amount'); // Stored in poisha
            $table->date('expense_date');
            $table->string('vendor_name')->nullable();
            $table->string('payment_method', 30)->default('cash'); // 'cash', 'bkash', 'nagad', 'bank_transfer', 'cheque'
            $table->string('receipt_reference', 100)->nullable();
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
        Schema::dropIfExists('expenses');
    }
};
