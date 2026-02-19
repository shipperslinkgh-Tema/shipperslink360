<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->uuid('bank_connection_id');
            $table->uuid('transaction_id')->nullable();
            $table->string('title');
            $table->text('message');
            $table->string('alert_type', 100);
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->decimal('amount', 18, 2)->nullable();
            $table->string('currency', 10)->default('GHS');
            $table->boolean('is_read')->default(false);
            $table->boolean('is_dismissed')->default(false);
            $table->foreignId('read_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('bank_connection_id')->references('id')->on('bank_connections')->cascadeOnDelete();
            $table->foreign('transaction_id')->references('id')->on('bank_transactions')->nullOnDelete();
            $table->index('is_read');
            $table->index('is_dismissed');
            $table->index('priority');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_alerts');
    }
};
