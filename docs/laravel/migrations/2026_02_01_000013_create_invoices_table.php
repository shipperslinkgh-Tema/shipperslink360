<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('invoice_number')->unique();
            $table->string('invoice_type')->default('commercial'); // proforma, commercial, credit_note, debit_note
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->uuid('shipment_id')->nullable();
            $table->foreign('shipment_id')->references('id')->on('shipments')->nullOnDelete();
            $table->string('job_ref')->nullable();
            $table->string('consolidation_ref')->nullable();
            $table->text('description')->nullable();
            $table->string('service_type')->default('agency_fee'); // agency_fee, customs_duty, freight, trucking, etc.
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->string('currency', 10)->default('GHS');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('ghs_equivalent', 15, 2)->default(0);
            $table->string('status')->default('draft'); // draft, sent, partially_paid, paid, overdue, cancelled, disputed
            $table->date('issue_date');
            $table->date('due_date');
            $table->date('paid_date')->nullable();
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->string('payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->string('created_by');
            $table->string('approved_by')->nullable();
            $table->date('approval_date')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['status', 'due_date']);
            $table->index('invoice_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
