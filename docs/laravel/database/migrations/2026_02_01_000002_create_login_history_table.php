<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('login_history', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->boolean('success')->default(true);
            $table->string('failure_reason')->nullable();
            $table->timestamp('login_at')->useCurrent();

            $table->index(['user_id', 'login_at']);
            $table->index('success');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_history');
    }
};
