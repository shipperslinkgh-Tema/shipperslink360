<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('expense_ref')->unique();
            $table->string('category'); // fuel, maintenance, office, salary, travel, customs_duties, port_charges, miscellaneous
            $table->string('description');
            $table->string('currency', 10)->default('GHS');
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('ghs_equivalent', 15, 2)->default(0);
            $table->string('status')->default('pending'); // pending, approved, rejected, paid
            $table->date('expense_date');
            $table->date('paid_date')->nullable();
            $table->string('requested_by');
            $table->string('approved_by')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'expense_date']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
