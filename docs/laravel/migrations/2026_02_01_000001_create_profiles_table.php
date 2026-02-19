<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('full_name');
            $table->string('staff_id')->unique();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('avatar_url')->nullable();
            $table->string('department'); // operations, documentation, accounts, marketing, customer_service, warehouse, management, super_admin
            $table->string('role'); // super_admin, admin, manager, staff
            $table->boolean('is_active')->default(true);
            $table->boolean('is_locked')->default(false);
            $table->boolean('must_change_password')->default(true);
            $table->tinyInteger('failed_login_attempts')->default(0);
            $table->timestamp('locked_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['department', 'role']);
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
