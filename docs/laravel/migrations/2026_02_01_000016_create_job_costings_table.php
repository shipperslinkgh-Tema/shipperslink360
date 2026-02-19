<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('job_costings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('job_ref')->unique();
            $table->string('job_type'); // import, export, consolidation, trucking
            $table->string('customer_name');
            $table->string('customer_id');
            $table->string('shipment_ref')->nullable();
            $table->string('consolidation_ref')->nullable();
            $table->string('cost_category'); // customs_duty, port_charges, shipping_freight, trucking, documentation, handling, others
            $table->string('description');
            $table->string('vendor')->nullable();
            $table->string('currency', 10)->default('GHS');
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('ghs_equivalent', 15, 2)->default(0);
            $table->decimal('amount_billed', 15, 2)->default(0);
            $table->decimal('profit_loss', 15, 2)->default(0);
            $table->boolean('is_reimbursable')->default(true);
            $table->string('payment_status')->default('unpaid'); // unpaid, partially_paid, paid
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->date('paid_date')->nullable();
            $table->date('due_date')->nullable();
            $table->string('approval_status')->default('pending'); // pending, approved, rejected
            $table->string('approved_by')->nullable();
            $table->string('created_by');
            $table->timestamps();

            $table->index(['job_type', 'payment_status']);
            $table->index('customer_id');
            $table->index('shipment_ref');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_costings');
    }
};
