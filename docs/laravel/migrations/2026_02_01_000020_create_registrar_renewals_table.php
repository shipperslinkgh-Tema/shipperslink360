<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('registrar_renewals', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('registration_type'); // Annual Returns, Business Registration, Tax Clearance, SSNIT Certificate, Fire Certificate, EPA Permit, Operating License
            $table->string('registrar_name');
            $table->text('description')->nullable();
            $table->date('expiry_date');
            $table->date('renewal_date')->nullable();
            $table->decimal('renewal_fee', 15, 2)->default(0);
            $table->string('currency', 10)->default('GHS');
            $table->string('certificate_number')->nullable();
            $table->string('status')->default('active'); // active, expiring_soon, expired, renewed
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['registration_type', 'status']);
            $table->index('expiry_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrar_renewals');
    }
};
