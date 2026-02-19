<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_interactions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('department', 100);
            $table->string('module', 100);
            $table->text('prompt');
            $table->longText('response')->nullable();
            $table->string('model', 100)->default('google/gemini-2.5-flash');
            $table->integer('tokens_used')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('department');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_interactions');
    }
};
