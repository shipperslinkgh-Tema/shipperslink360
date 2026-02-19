<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tax_filings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('tax_type'); // VAT, PAYE, Corporate, Withholding, Customs Duty
            $table->string('period');   // e.g. "2026-Q1", "2026-01"
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('currency', 10)->default('GHS');
            $table->date('due_date');
            $table->date('filing_date')->nullable();
            $table->date('payment_date')->nullable();
            $table->string('reference_number')->nullable();
            $table->string('payment_ref')->nullable();
            $table->string('status')->default('pending'); // pending, filed, paid, overdue
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tax_type', 'status']);
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_filings');
    }
};
