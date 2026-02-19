<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('registrar_renewals', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('renewal_ref')->unique();
            $table->string('registration_type'); // business_registration, tax_certificate, import_license, customs_broker_license, logistics_license
            $table->string('entity_name');
            $table->string('registration_number')->nullable();
            $table->date('issue_date')->nullable();
            $table->date('expiry_date');
            $table->integer('days_until_expiry')->storedAs('DATEDIFF(expiry_date, CURDATE())');
            $table->string('status')->default('active'); // active, due_soon, overdue, renewed, expired
            $table->decimal('renewal_fee', 15, 2)->default(0);
            $table->decimal('fee_paid', 15, 2)->default(0);
            $table->date('renewal_date')->nullable();
            $table->string('renewed_by')->nullable();
            $table->string('document_url')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('auto_renew')->default(false);
            $table->timestamps();

            $table->index('expiry_date');
            $table->index('status');
            $table->index('registration_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrar_renewals');
    }
};
