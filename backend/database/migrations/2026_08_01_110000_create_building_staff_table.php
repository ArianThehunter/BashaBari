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
        Schema::create('building_staff', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('building_id')->nullable()->constrained('buildings')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->string('name');
            $table->string('phone', 20);
            $table->string('nid_number', 30)->nullable();
            
            // Checkbox attributes for bi-directional duty capability
            $table->boolean('is_caretaker')->default(false);
            $table->boolean('is_security_guard')->default(false);
            $table->boolean('is_agency_contracted')->default(false);
            $table->boolean('is_owner_manager')->default(false);
            
            // Primary role designation
            $table->string('staff_role', 50)->default('caretaker'); // 'caretaker', 'security_guard', 'guard_caretaker_dual', 'caretaker_guard_dual', 'bariwala_manager'
            $table->string('employment_type', 30)->default('direct_employed'); // 'direct_employed', 'agency_contracted'
            $table->string('agency_name')->nullable();
            
            $table->string('shift_type', 30)->default('day_shift'); // 'day_shift', 'night_shift', '24h_duty', 'rotation'
            $table->string('shift_hours')->default('08:00 AM - 08:00 PM');
            
            $table->bigInteger('monthly_salary')->default(0); // Stored in poisha
            $table->string('status', 30)->default('active'); // 'active', 'on_leave', 'rotated_out', 'resigned', 'terminated'
            $table->date('joining_date')->nullable();
            $table->text('notes')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('staff_duty_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_staff_id')->constrained('building_staff')->onDelete('cascade');
            $table->string('action_type', 50); // 'role_change', 'salary_paid', 'shift_change', 'status_change'
            $table->string('previous_role')->nullable();
            $table->string('new_role')->nullable();
            $table->bigInteger('amount_paid')->nullable(); // Poisha
            $table->string('payment_method', 30)->nullable(); // 'cash', 'bkash', 'nagad', 'bank'
            $table->string('voucher_number', 50)->nullable(); // EXP-YYYYMM-XXX
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_duty_logs');
        Schema::dropIfExists('building_staff');
    }
};
