<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('consolidation_lots', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('lot_ref')->unique();
            $table->string('type'); // lcl_sea, lcl_air
            $table->string('origin_country');
            $table->string('origin_port');
            $table->string('destination_port');
            $table->string('vessel_name')->nullable();
            $table->string('voyage_number')->nullable();
            $table->string('master_bl')->nullable();
            $table->string('container_number')->nullable();
            $table->string('container_type')->nullable();
            $table->date('etd')->nullable();
            $table->date('eta')->nullable();
            $table->date('ata')->nullable();
            $table->decimal('total_weight_kg', 10, 2)->default(0);
            $table->decimal('total_volume_cbm', 10, 2)->default(0);
            $table->integer('shipper_count')->default(0);
            $table->string('status')->default('open'); // open, loading, in_transit, at_port, customs, delivered, closed
            $table->string('assigned_officer')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'status']);
            $table->index('eta');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consolidation_lots');
    }
};
