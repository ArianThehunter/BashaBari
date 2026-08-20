<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Invoice numbers were generated with `count(...) + 1` in three places, with no
 * constraint behind them. Concurrent generation (the monthly command and the
 * API endpoint can overlap) produced duplicates, and soft-deleting an invoice
 * freed its number for reuse.
 *
 * Numbering now derives from the highest suffix ever issued; this index makes a
 * duplicate impossible rather than merely unlikely.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->unique(['organization_id', 'invoice_number'], 'invoices_org_number_unique');
            $table->index(['organization_id', 'status'], 'invoices_org_status_index');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropUnique('invoices_org_number_unique');
            $table->dropIndex('invoices_org_status_index');
        });
    }
};
