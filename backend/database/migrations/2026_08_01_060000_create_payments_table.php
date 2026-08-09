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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained('organizations')->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
            $table->foreignId('tenant_id')->constrained('tenants')->onDelete('cascade');
            $table->foreignId('unit_id')->nullable()->constrained('units')->onDelete('set null');
            $table->string('transaction_number', 50); // SSLCommerz tran_id
            $table->string('val_id', 50)->nullable(); // SSLCommerz val_id
            $table->string('bank_tran_id', 50)->nullable(); // SSLCommerz bank_tran_id
            $table->string('payment_method', 30)->default('sslcommerz'); // 'sslcommerz', 'bkash', 'nagad', 'rocket', 'bank_transfer', 'cash', 'cheque'
            $table->string('card_type', 50)->nullable(); // e.g. BKASH-BKASH, NAGAD-NAGAD, VISA-CITY, MASTER-DBBL
            $table->string('card_no', 50)->nullable(); // Masked account or card number
            $table->bigInteger('amount'); // Stored in poisha (1 BDT = 100 poisha)
            $table->bigInteger('store_amount')->default(0); // Net store amount in poisha
            $table->string('currency', 10)->default('BDT');
            $table->date('payment_date');
            $table->string('status', 20)->default('completed'); // 'completed', 'pending', 'refunded', 'failed', 'cancelled'
            $table->string('reference_number', 100)->nullable();
            $table->json('raw_response')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
