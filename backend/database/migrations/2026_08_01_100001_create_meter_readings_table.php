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
        Schema::create('meter_readings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('building_id')->nullable()->constrained('buildings')->onDelete('set null');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->foreignId('utility_provider_id')->constrained('utility_providers')->onDelete('cascade');
            $table->string('meter_number', 100);
            $table->decimal('previous_reading', 10, 2);
            $table->decimal('current_reading', 10, 2);
            $table->decimal('units_consumed', 10, 2);
            $table->bigInteger('rate_per_unit_poisha'); // Stored in poisha
            $table->bigInteger('total_amount_poisha'); // Stored in poisha
            $table->date('reading_date');
            $table->string('billing_month', 20); // YYYY-MM
            $table->string('status', 20)->default('pending'); // 'pending', 'invoiced'
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meter_readings');
    }
};
