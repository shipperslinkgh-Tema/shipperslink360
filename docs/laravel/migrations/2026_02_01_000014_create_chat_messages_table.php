<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('channel')->default('general'); // general, operations, finance, management
            $table->uuid('sender_id');
            $table->string('sender_name');
            $table->string('sender_department')->nullable();
            $table->text('message');
            $table->string('message_type')->default('text'); // text, file, image
            $table->string('file_url')->nullable();
            $table->string('file_name')->nullable();
            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();
            $table->timestamps();

            $table->index(['channel', 'created_at']);
            $table->index('sender_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
