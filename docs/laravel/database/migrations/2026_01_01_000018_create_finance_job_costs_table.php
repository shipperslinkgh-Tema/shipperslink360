<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance_job_costs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('job_ref', 100);
            $table->enum('job_type', ['shipment', 'consolidation', 'trucking', 'warehouse', 'other'])->default('shipment');
            $table->string('customer');
            $table->string('customer_id', 100);
            $table->text('description');
            $table->string('vendor')->nullable();
            $table->string('cost_category', 100)->default('other');
            $table->string('currency', 10)->default('GHS');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('amount', 18, 2)->default(0);
            $table->decimal('ghs_equivalent', 18, 2)->default(0);
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->default('unpaid');
            $table->decimal('paid_amount', 18, 2)->default(0);
            $table->date('paid_date')->nullable();
            $table->date('due_date')->nullable();
            $table->boolean('is_reimbursable')->default(true);
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('approved_by')->nullable();
            $table->string('shipment_ref', 100)->nullable();
            $table->string('consolidation_ref', 100)->nullable();
            $table->string('created_by')->default('System');
            $table->timestamps();

            $table->index('customer_id');
            $table->index('job_ref');
            $table->index('payment_status');
            $table->index('approval_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('finance_job_costs');
    }
};
