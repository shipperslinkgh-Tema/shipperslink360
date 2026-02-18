<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_shipments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('customer_id', 100);
            $table->string('bl_number', 100);
            $table->string('container_number', 100)->nullable();
            $table->string('vessel_name')->nullable();
            $table->string('voyage_number', 100)->nullable();
            $table->string('origin');
            $table->string('destination');
            $table->text('cargo_description')->nullable();
            $table->decimal('weight_kg', 12, 2)->nullable();
            $table->string('status', 50)->default('pending');
            $table->timestamp('eta')->nullable();
            $table->timestamp('ata')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('customer_id');
            $table->index('status');
            $table->index('bl_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_shipments');
    }
};
