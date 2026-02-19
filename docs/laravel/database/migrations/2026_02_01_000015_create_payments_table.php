<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('payment_ref')->unique();
            $table->uuid('invoice_id')->nullable();
            $table->foreign('invoice_id')->references('id')->on('invoices')->nullOnDelete();
            $table->uuid('customer_id')->nullable();
            $table->foreign('customer_id')->references('id')->on('customers')->nullOnDelete();
            $table->string('type'); // incoming, outgoing
            $table->string('category'); // invoice, customs_duty, freight, trucking, salary, tax, office
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('currency', 10)->default('GHS');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('ghs_equivalent', 15, 2)->default(0);
            $table->string('method'); // bank_transfer, cheque, cash, mobile_money, letter_of_credit
            $table->string('bank_account')->nullable();
            $table->string('transaction_ref')->nullable();
            $table->string('status')->default('pending'); // pending, processing, completed, failed, refunded, cancelled
            $table->date('payment_date');
            $table->date('value_date')->nullable();
            $table->text('description');
            $table->string('approval_status')->default('pending'); // pending, approved, rejected
            $table->string('approved_by')->nullable();
            $table->date('approval_date')->nullable();
            $table->string('created_by');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['type', 'status']);
            $table->index('payment_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
