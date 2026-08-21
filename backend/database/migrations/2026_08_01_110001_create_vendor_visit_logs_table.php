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
        Schema::create('vendor_visit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('building_id')->nullable()->constrained('buildings')->onDelete('cascade');
            $table->foreignId('recorded_by_staff_id')->nullable()->constrained('building_staff')->onDelete('set null');
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->string('technician_name');
            $table->string('technician_phone', 20);
            $table->string('company_name')->nullable(); // e.g. "Dhaka Electric Solutions"
            $table->string('service_category', 50); // 'plumbing', 'electrical', 'elevator', 'tank_cleaning', 'generator', 'painting', 'pest_control', 'other'

            $table->timestamp('entry_time');
            $table->timestamp('exit_time')->nullable();
            $table->text('purpose_of_visit');

            $table->bigInteger('amount_paid')->default(0); // Poisha
            $table->string('payment_method', 30)->nullable(); // 'cash', 'bkash', 'nagad', 'bank'
            $table->string('receipt_reference', 100)->nullable();
            $table->string('status', 30)->default('completed'); // 'in_progress', 'completed', 'cancelled'

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_visit_logs');
    }
};
