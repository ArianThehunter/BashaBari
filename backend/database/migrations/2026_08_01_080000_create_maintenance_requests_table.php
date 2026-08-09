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
        Schema::create('maintenance_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('building_id')->nullable()->constrained('buildings')->onDelete('set null');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('set null');
            $table->foreignId('reported_by_user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->string('category', 30)->default('repairs'); // 'plumbing', 'electrical', 'painting', 'elevator', 'cleaning', 'repairs', 'other'
            $table->string('priority', 20)->default('medium'); // 'low', 'medium', 'high', 'emergency'
            $table->string('status', 20)->default('pending'); // 'pending', 'in_progress', 'completed', 'cancelled'
            
            $table->boolean('is_escalated_to_owner')->default(false);
            $table->string('escalated_by', 30)->nullable(); // 'tenant', 'caretaker'
            $table->text('escalation_reason')->nullable();
            
            $table->bigInteger('estimated_cost_amount')->default(0); // In poisha
            $table->bigInteger('actual_cost_amount')->default(0); // In poisha
            $table->string('assigned_vendor_name')->nullable();
            $table->string('assigned_vendor_phone')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_requests');
    }
};
