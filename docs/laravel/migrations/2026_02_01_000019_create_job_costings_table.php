<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_costings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('job_ref');
            $table->string('job_type'); // shipment, consolidation, container
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->uuid('shipment_id')->nullable();
            $table->foreign('shipment_id')->references('id')->on('shipments')->nullOnDelete();
            $table->string('cost_category'); // freight_sea, customs_duty, gpha_charges, trucking, etc.
            $table->text('description');
            $table->string('vendor')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('currency', 10)->default('GHS');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('ghs_equivalent', 15, 2)->default(0);
            $table->string('payment_status')->default('unpaid'); // unpaid, partially_paid, paid
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->date('paid_date')->nullable();
            $table->boolean('is_reimbursable')->default(false);
            $table->string('invoice_ref')->nullable();
            $table->string('icums_ref')->nullable();
            $table->string('gpha_ref')->nullable();
            $table->string('approval_status')->default('pending'); // pending, approved, rejected
            $table->string('approved_by')->nullable();
            $table->string('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['job_ref', 'job_type']);
            $table->index(['customer_id', 'payment_status']);
            $table->index('cost_category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_costings');
    }
};
