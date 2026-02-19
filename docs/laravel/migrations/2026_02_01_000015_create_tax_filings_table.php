<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tax_filings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('filing_ref')->unique();
            $table->string('tax_type'); // VAT, NHIL, COVID_LEVY, INCOME_TAX, WITHHOLDING
            $table->string('period'); // e.g. 2026-01, Q1-2026
            $table->string('period_type')->default('monthly'); // monthly, quarterly, annual
            $table->decimal('gross_amount', 15, 2)->default(0);
            $table->decimal('taxable_amount', 15, 2)->default(0);
            $table->decimal('tax_rate', 6, 4)->default(0);
            $table->decimal('tax_due', 15, 2)->default(0);
            $table->decimal('tax_paid', 15, 2)->default(0);
            $table->decimal('penalty', 15, 2)->default(0);
            $table->string('status')->default('draft'); // draft, filed, paid, overdue
            $table->date('due_date');
            $table->date('filed_date')->nullable();
            $table->date('paid_date')->nullable();
            $table->string('filed_by')->nullable();
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tax_type', 'period']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_filings');
    }
};
