<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('customer_id', 100);
            $table->uuid('shipment_id')->nullable();
            $table->string('invoice_number', 100)->unique();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('GHS');
            $table->string('status', 50)->default('pending');
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->foreign('shipment_id')->references('id')->on('client_shipments')->nullOnDelete();
            $table->index('customer_id');
            $table->index('status');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_invoices');
    }
};
