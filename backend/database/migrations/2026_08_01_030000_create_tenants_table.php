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
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone', 30);
            $table->string('nid_number', 50)->nullable();
            $table->string('passport_number', 50)->nullable();
            $table->string('father_name')->nullable();
            $table->text('permanent_address')->nullable();
            $table->string('occupation', 100)->nullable();
            $table->string('emergency_contact_name')->nullable();
            $table->string('emergency_contact_phone', 30)->nullable();
            $table->string('emergency_contact_relation', 50)->nullable();
            $table->json('documents')->nullable(); // NID copy, photo file metadata
            $table->string('status', 20)->default('active'); // 'active', 'inactive', 'archived'
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
