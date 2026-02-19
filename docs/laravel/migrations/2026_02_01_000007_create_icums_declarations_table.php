<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('icums_declarations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('declaration_number')->unique();
            $table->uuid('shipment_id');
            $table->foreign('shipment_id')->references('id')->on('shipments');
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->string('declaration_type'); // import, export, transit, re-import
            $table->string('regime_code')->nullable();
            $table->string('hs_code')->nullable();
            $table->text('goods_description');
            $table->decimal('customs_value', 15, 2)->default(0);
            $table->string('currency', 10)->default('USD');
            $table->decimal('exchange_rate', 10, 4)->default(1);
            $table->decimal('ghs_value', 15, 2)->default(0);
            $table->decimal('import_duty', 15, 2)->default(0);
            $table->decimal('vat', 15, 2)->default(0);
            $table->decimal('levy', 15, 2)->default(0);
            $table->decimal('nhil', 15, 2)->default(0);
            $table->decimal('getfund', 15, 2)->default(0);
            $table->decimal('total_taxes', 15, 2)->default(0);
            $table->string('status')->default('draft'); // draft, submitted, under_assessment, assessed, paid, cleared
            $table->date('submission_date')->nullable();
            $table->date('assessment_date')->nullable();
            $table->date('payment_date')->nullable();
            $table->date('clearance_date')->nullable();
            $table->string('payment_ref')->nullable();
            $table->string('customs_office')->default('Tema');
            $table->string('declarant')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['shipment_id', 'status']);
            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('icums_declarations');
    }
};
