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
        Schema::create('external_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->nullable()->constrained('properties')->onDelete('cascade');
            
            $table->string('recorded_by_role', 30)->default('caretaker'); // 'caretaker', 'guard', 'owner'
            $table->string('recorded_by_name')->nullable();
            
            $table->string('vendor_name');
            $table->string('vendor_phone', 20);
            $table->string('company_name')->nullable();
            $table->string('service_category', 50); // 'plumbing', 'electrical', 'elevator', 'tank_cleaning', 'generator', 'painting', 'pest_control', 'other'
            $table->string('address')->nullable();
            $table->text('notes')->nullable();
            
            $table->boolean('is_verified')->default(false); // For future lead referral commission expansion
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('external_vendors');
    }
};
