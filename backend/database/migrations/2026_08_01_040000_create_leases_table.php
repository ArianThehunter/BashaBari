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
        Schema::create('leases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('unit_id')->constrained('units')->onDelete('cascade');
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->date('start_date');
            $table->date('end_date');
            $table->bigInteger('rent_amount'); // Stored in poisha (1 BDT = 100 poisha)
            $table->bigInteger('security_deposit')->default(0); // Stored in poisha
            $table->bigInteger('advance_rent')->default(0); // Stored in poisha
            $table->integer('billing_day')->default(1); // Day of month rent is due (1-31)
            $table->string('status', 20)->default('active'); // 'active', 'pending', 'expired', 'terminated'
            $table->text('terms_and_conditions')->nullable();
            $table->timestamp('terminated_at')->nullable();
            $table->text('termination_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leases');
    }
};
