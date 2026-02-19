<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('trucks', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('registration_number')->unique();
            $table->string('make');
            $table->string('model');
            $table->year('year')->nullable();
            $table->string('type'); // flatbed, tipper, container, tanker, van
            $table->decimal('payload_capacity_tons', 8, 2)->nullable();
            $table->string('status')->default('available'); // available, on_trip, maintenance, retired
            $table->string('driver_name')->nullable();
            $table->string('driver_phone')->nullable();
            $table->string('driver_license')->nullable();
            $table->date('insurance_expiry')->nullable();
            $table->date('roadworthy_expiry')->nullable();
            $table->date('last_service_date')->nullable();
            $table->date('next_service_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trucks');
    }
};
