<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->uuid('bank_connection_id');
            $table->string('transaction_ref', 100)->unique();
            $table->enum('transaction_type', ['credit', 'debit']);
            $table->decimal('amount', 18, 2);
            $table->string('currency', 10)->default('GHS');
            $table->text('description')->nullable();
            $table->string('counterparty_name')->nullable();
            $table->string('counterparty_account', 50)->nullable();
            $table->timestamp('transaction_date');
            $table->timestamp('value_date')->nullable();
            $table->decimal('balance_after', 18, 2)->nullable();
            $table->enum('match_status', ['unmatched', 'matched', 'partial', 'manual'])->default('unmatched');
            $table->decimal('match_confidence', 5, 2)->nullable();
            $table->string('matched_invoice_id')->nullable();
            $table->string('matched_receivable_id')->nullable();
            $table->boolean('is_reconciled')->default(false);
            $table->foreignId('reconciled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reconciled_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('raw_data')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('bank_connection_id')->references('id')->on('bank_connections')->cascadeOnDelete();
            $table->index('bank_connection_id');
            $table->index('transaction_date');
            $table->index('match_status');
            $table->index('is_reconciled');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_transactions');
    }
};
