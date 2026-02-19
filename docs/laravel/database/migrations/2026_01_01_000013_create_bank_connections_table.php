<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bank_connections', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('bank_name', 100);
            $table->string('bank_display_name');
            $table->string('account_name');
            $table->string('account_number', 50);
            $table->enum('account_type', ['current', 'savings', 'fixed'])->default('current');
            $table->string('currency', 10)->default('GHS');
            $table->decimal('balance', 18, 2)->default(0);
            $table->decimal('available_balance', 18, 2)->default(0);
            $table->string('api_endpoint', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->enum('sync_status', ['pending', 'syncing', 'synced', 'error'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();

            $table->index('bank_name');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bank_connections');
    }
};
