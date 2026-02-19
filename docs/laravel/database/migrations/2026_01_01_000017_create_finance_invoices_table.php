<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_invoices', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('invoice_number', 100)->unique();
            $table->enum('invoice_type', ['proforma', 'commercial', 'credit-note', 'debit-note'])->default('commercial');
            $table->string('customer');
            $table->string('customer_id', 100);
            $table->string('service_type', 100)->default('other');
            $table->string('currency', 10)->default('GHS');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('subtotal', 18, 2)->default(0);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->decimal('ghs_equivalent', 18, 2)->default(0);
            $table->enum('status', [
                'draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'disputed'
            ])->default('draft');
            $table->date('issue_date')->useCurrent();
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->decimal('paid_amount', 18, 2)->default(0);
            $table->string('payment_method', 100)->nullable();
            $table->string('shipment_ref', 100)->nullable();
            $table->string('job_ref', 100)->nullable();
            $table->string('consolidation_ref', 100)->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->string('created_by')->default('System');
            $table->string('approved_by')->nullable();
            $table->date('approval_date')->nullable();
            $table->timestamps();

            $table->index('customer_id');
            $table->index('status');
            $table->index('due_date');
            $table->index('issue_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_invoices');
    }
};
