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
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('floor_id')->constrained('floors')->onDelete('cascade');
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->string('unit_number', 50);
            $table->string('unit_type', 30)->default('residential'); // 'residential', 'commercial', 'garage', 'storage'
            $table->string('occupancy_status', 30)->default('vacant'); // 'vacant', 'occupied', 'maintenance', 'reserved'
            $table->string('occupancy_type', 40)->default('tenant_occupied'); // 'tenant_occupied', 'flat_owner_occupied', 'bariwala_occupied'
            
            $table->integer('bedrooms')->nullable();
            $table->integer('bathrooms')->nullable();
            $table->decimal('area_sqft', 10, 2)->nullable();
            
            $table->bigInteger('base_rent_amount')->default(0); // Stored in poisha (1 BDT = 100 poisha)
            $table->bigInteger('previous_base_rent_amount')->default(0); // Previous rent before revision (poisha)
            $table->timestamp('last_rent_revised_at')->nullable(); // Timestamp of last Rent Act 1992 revision
            $table->bigInteger('service_charge_amount')->default(200000); // Default ৳2,000 poisha mandatory service charge
            
            $table->string('garage_type', 30)->default('none'); // 'none', 'bike', 'car', 'both'
            $table->bigInteger('garage_fee_amount')->default(0); // Bike: ৳700, Car: ৳1,200 (stored in poisha)
            $table->integer('bike_count')->default(0);
            $table->integer('car_count')->default(0);
            
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
        Schema::dropIfExists('units');
    }
};
