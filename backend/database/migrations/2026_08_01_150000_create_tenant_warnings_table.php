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
        Schema::create('tenant_warnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('property_id')->constrained('properties')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('issued_by_user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->string('issued_by_role', 30)->default('caretaker'); // 'caretaker', 'owner'
            $table->string('title');
            $table->text('damage_description');
            $table->bigInteger('fine_amount')->default(0); // Stored in poisha
            $table->string('status', 30)->default('issued'); // 'issued', 'fine_paid', 'waived'

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_warnings');
    }
};
