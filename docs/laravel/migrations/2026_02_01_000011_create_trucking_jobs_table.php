<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trucking_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('job_ref')->unique();
            $table->uuid('shipment_id')->nullable();
            $table->foreign('shipment_id')->references('id')->on('shipments')->nullOnDelete();
            $table->uuid('truck_id');
            $table->foreign('truck_id')->references('id')->on('trucks');
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->string('origin');
            $table->string('destination');
            $table->string('cargo_type')->nullable();
            $table->decimal('weight_tons', 10, 2)->nullable();
            $table->string('status')->default('scheduled'); // scheduled, in_progress, completed, cancelled
            $table->datetime('departure_time')->nullable();
            $table->datetime('arrival_time')->nullable();
            $table->datetime('estimated_arrival')->nullable();
            $table->string('driver_name');
            $table->string('driver_phone');
            $table->decimal('rate', 15, 2)->default(0);
            $table->string('currency', 10)->default('GHS');
            $table->decimal('fuel_cost', 15, 2)->default(0);
            $table->decimal('toll_cost', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['truck_id', 'status']);
            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trucking_jobs');
    }
};
