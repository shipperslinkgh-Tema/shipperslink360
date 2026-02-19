<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_expenses', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('expense_ref', 100)->unique();
            $table->text('description');
            $table->string('category', 100)->default('other');
            $table->string('currency', 10)->default('GHS');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('amount', 18, 2)->default(0);
            $table->decimal('ghs_equivalent', 18, 2)->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected', 'paid'])->default('pending');
            $table->date('expense_date')->useCurrent();
            $table->date('paid_date')->nullable();
            $table->string('requested_by')->default('System');
            $table->string('approved_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('expense_date');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_expenses');
    }
};
