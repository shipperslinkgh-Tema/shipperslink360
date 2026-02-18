<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_documents', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('customer_id', 100);
            $table->uuid('shipment_id')->nullable();
            $table->string('document_name');
            $table->string('document_type', 100);
            $table->text('file_url')->nullable();
            $table->string('file_size', 50)->nullable();
            $table->string('status', 50)->default('active');
            $table->text('notes')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->foreign('shipment_id')->references('id')->on('client_shipments')->nullOnDelete();
            $table->index('customer_id');
            $table->index('document_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_documents');
    }
};
