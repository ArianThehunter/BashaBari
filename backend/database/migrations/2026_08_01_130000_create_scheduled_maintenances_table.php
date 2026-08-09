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
        Schema::create('scheduled_maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('building_id')->nullable()->constrained('buildings')->onDelete('cascade');
            
            $table->string('title');
            $table->text('description');
            $table->string('maintenance_type', 50); // 'water_tank_cleaning', 'elevator_servicing', 'generator_maintenance', 'electrical_overhaul', 'pest_control', 'painting', 'other'
            
            $table->date('scheduled_date'); // Must be at least 3 days in advance
            $table->string('start_time', 20)->default('09:00 AM');
            $table->string('end_time', 20)->default('05:00 PM');
            
            $table->string('scheduled_by_role', 30)->default('caretaker'); // 'caretaker', 'owner'
            $table->string('scheduled_by_name')->nullable();
            
            $table->boolean('is_tenant_notified')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scheduled_maintenances');
    }
};
