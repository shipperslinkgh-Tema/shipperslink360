<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('delivery_orders', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('do_number')->unique();
            $table->uuid('shipment_id');
            $table->foreign('shipment_id')->references('id')->on('shipments');
            $table->uuid('shipping_line_id');
            $table->foreign('shipping_line_id')->references('id')->on('shipping_lines');
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->string('container_number');
            $table->string('bl_number');
            $table->date('do_date');
            $table->date('expiry_date');
            $table->date('free_days_end')->nullable();
            $table->integer('free_days_used')->default(0);
            $table->boolean('demurrage_accruing')->default(false);
            $table->decimal('demurrage_amount', 15, 2)->default(0);
            $table->string('currency', 10)->default('USD');
            $table->string('status')->default('pending'); // pending, obtained, used, expired
            $table->string('obtained_via')->nullable(); // odex, email, manual
            $table->date('obtained_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['shipment_id', 'status']);
            $table->index(['shipping_line_id', 'status']);
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_orders');
    }
};
