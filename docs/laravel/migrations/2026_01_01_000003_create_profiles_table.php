<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('full_name');
            $table->string('staff_id', 50)->unique();
            $table->string('username', 100)->unique();
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->enum('department', [
                'operations',
                'documentation',
                'accounts',
                'marketing',
                'customer_service',
                'warehouse',
                'management',
                'super_admin',
            ]);
            $table->string('avatar_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_locked')->default(false);
            $table->integer('failed_login_attempts')->default(0);
            $table->timestamp('locked_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->boolean('must_change_password')->default(true);
            $table->timestamps();

            $table->index('department');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
