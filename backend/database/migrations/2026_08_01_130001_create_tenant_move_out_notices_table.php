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
        Schema::create('tenant_move_out_notices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('building_id')->nullable()->constrained('buildings')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');

            $table->date('intended_move_out_date');
            $table->text('reason_for_leaving')->nullable();
            $table->string('deposit_refund_account')->nullable(); // bKash / Nagad / Bank details for deposit return

            $table->string('status', 30)->default('pending_inspection'); // 'pending_inspection', 'approved', 'deposit_refunded', 'completed'
            $table->text('caretaker_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_move_out_notices');
    }
};
