<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Transaction numbers were generated as "TRX-YYYYMM-" plus rand(100, 999) with
 * no uniqueness constraint: 900 possible values per month, so collisions were
 * likely and enumeration was trivial. Ids are now UUID-based; this adds the
 * constraint that should have been enforcing it all along.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->unique('transaction_number', 'payments_transaction_number_unique');
            $table->index(['organization_id', 'status'], 'payments_org_status_index');
            $table->index(['invoice_id', 'status'], 'payments_invoice_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique('payments_transaction_number_unique');
            $table->dropIndex('payments_org_status_index');
            $table->dropIndex('payments_invoice_status_index');
        });
    }
};
