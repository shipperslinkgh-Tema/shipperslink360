<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Note: table named 'app_notifications' to avoid conflict with
        // Laravel's built-in 'notifications' table used by the Notifiable trait.
        // If you do NOT use Laravel's built-in notification system, name it 'notifications'.
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->foreignId('recipient_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('recipient_department', 50)->nullable();
            $table->foreignId('sender_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('message');
            $table->string('type', 50)->default('info');
            $table->string('category', 50)->default('system');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->boolean('is_read')->default(false);
            $table->boolean('is_resolved')->default(false);
            $table->string('reference_type', 100)->nullable();
            $table->string('reference_id')->nullable();
            $table->string('action_url', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('recipient_id');
            $table->index('recipient_department');
            $table->index('is_read');
            $table->index('priority');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
    }
};
