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
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('payment_id')->nullable()->constrained('payments')->onDelete('set null');
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
            $table->string('type', 20); // 'income', 'expense', 'refund'
            $table->string('category', 50); // 'rent', 'security_deposit', 'advance_rent', 'utility', 'maintenance', 'other'
            $table->bigInteger('amount'); // Stored in poisha
            $table->date('entry_date');
            $table->string('description');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};
