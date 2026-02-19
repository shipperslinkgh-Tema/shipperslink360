<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('shipments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('shipment_ref')->unique();
            $table->uuid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->string('type'); // sea, air, road
            $table->string('bl_number')->nullable()->unique();
            $table->string('awb_number')->nullable()->unique();
            $table->string('vessel_name')->nullable();
            $table->string('voyage_number')->nullable();
            $table->string('flight_number')->nullable();
            $table->string('container_number')->nullable();
            $table->string('container_type')->nullable(); // 20ft, 40ft, 40hc, lcl
            $table->integer('container_count')->nullable();
            $table->string('origin_country');
            $table->string('origin_port');
            $table->string('destination_port');
            $table->string('cargo_description')->nullable();
            $table->decimal('weight_kg', 10, 2)->nullable();
            $table->decimal('volume_cbm', 10, 2)->nullable();
            $table->string('status')->default('pending'); // pending, in_transit, at_port, customs, delivered, cancelled
            $table->string('clearance_status')->default('pending'); // pending, icums_cleared, do_obtained, gpha_cleared, released
            $table->date('etd')->nullable(); // Estimated Time of Departure
            $table->date('eta')->nullable(); // Estimated Time of Arrival
            $table->date('ata')->nullable(); // Actual Time of Arrival
            $table->date('delivery_date')->nullable();
            $table->boolean('is_consolidated')->default(false);
            $table->uuid('consolidation_lot_id')->nullable();
            $table->string('incoterms')->nullable(); // FOB, CIF, EXW, DDP
            $table->string('assigned_officer')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['customer_id', 'status']);
            $table->index(['type', 'status']);
            $table->index('eta');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipments');
    }
};
