<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The tenant portal previously identified a tenant by matching the logged-in
 * user's email OR phone against the tenants table, across every organization.
 * Phone numbers are never verified at registration, so that allowed anyone to
 * read another tenant's lease and invoices by registering with their number.
 *
 * Portal access is now resolved strictly through tenants.user_id, which needs
 * an index because it is on the hot path of every portal request.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->index('user_id', 'tenants_user_id_index');
            $table->index(['organization_id', 'status'], 'tenants_org_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex('tenants_user_id_index');
            $table->dropIndex('tenants_org_status_index');
        });
    }
};
