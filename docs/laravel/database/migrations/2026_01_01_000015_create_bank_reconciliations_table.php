<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_reconciliations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->uuid('bank_connection_id');
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('bank_opening_balance', 18, 2)->default(0);
            $table->decimal('bank_closing_balance', 18, 2)->default(0);
            $table->decimal('book_opening_balance', 18, 2)->default(0);
            $table->decimal('book_closing_balance', 18, 2)->default(0);
            $table->decimal('total_credits', 18, 2)->default(0);
            $table->decimal('total_debits', 18, 2)->default(0);
            $table->integer('matched_count')->default(0);
            $table->integer('unmatched_count')->default(0);
            $table->decimal('discrepancy_amount', 18, 2)->default(0);
            $table->enum('status', ['draft', 'in_progress', 'completed', 'approved'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('completed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->foreign('bank_connection_id')->references('id')->on('bank_connections')->cascadeOnDelete();
            $table->index('period_start');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_reconciliations');
    }
};
