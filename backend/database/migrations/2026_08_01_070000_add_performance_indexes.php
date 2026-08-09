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
        Schema::table('properties', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_properties_org_status');
        });

        Schema::table('buildings', function (Blueprint $table) {
            $table->index(['organization_id', 'property_id'], 'idx_buildings_org_prop');
        });

        Schema::table('floors', function (Blueprint $table) {
            $table->index(['organization_id', 'building_id'], 'idx_floors_org_bldg');
        });

        Schema::table('units', function (Blueprint $table) {
            $table->index(['organization_id', 'occupancy_status'], 'idx_units_org_occupancy');
            $table->index(['building_id', 'occupancy_status'], 'idx_units_bldg_occupancy');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_tenants_org_status');
            $table->index('phone', 'idx_tenants_phone');
            $table->index('nid_number', 'idx_tenants_nid');
        });

        Schema::table('leases', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_leases_org_status');
            $table->index(['unit_id', 'status'], 'idx_leases_unit_status');
            $table->index('start_date', 'idx_leases_start_date');
            $table->index('end_date', 'idx_leases_end_date');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_invoices_org_status');
            $table->index(['tenant_id', 'status'], 'idx_invoices_tenant_status');
            $table->index('due_date', 'idx_invoices_due_date');
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->index(['organization_id', 'status'], 'idx_payments_org_status');
            $table->index(['invoice_id', 'status'], 'idx_payments_inv_status');
            $table->index('val_id', 'idx_payments_val_id');
        });

        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->index(['organization_id', 'type'], 'idx_ledger_org_type');
            $table->index(['organization_id', 'entry_date'], 'idx_ledger_org_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', fn (Blueprint $table) => $table->dropIndex('idx_properties_org_status'));
        Schema::table('buildings', fn (Blueprint $table) => $table->dropIndex('idx_buildings_org_prop'));
        Schema::table('floors', fn (Blueprint $table) => $table->dropIndex('idx_floors_org_bldg'));
        Schema::table('units', function (Blueprint $table) {
            $table->dropIndex('idx_units_org_occupancy');
            $table->dropIndex('idx_units_bldg_occupancy');
        });
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex('idx_tenants_org_status');
            $table->dropIndex('idx_tenants_phone');
            $table->dropIndex('idx_tenants_nid');
        });
        Schema::table('leases', function (Blueprint $table) {
            $table->dropIndex('idx_leases_org_status');
            $table->dropIndex('idx_leases_unit_status');
            $table->dropIndex('idx_leases_start_date');
            $table->dropIndex('idx_leases_end_date');
        });
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropIndex('idx_invoices_org_status');
            $table->dropIndex('idx_invoices_tenant_status');
            $table->dropIndex('idx_invoices_due_date');
        });
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('idx_payments_org_status');
            $table->dropIndex('idx_payments_inv_status');
            $table->dropIndex('idx_payments_val_id');
        });
        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->dropIndex('idx_ledger_org_type');
            $table->dropIndex('idx_ledger_org_date');
        });
    }
};
