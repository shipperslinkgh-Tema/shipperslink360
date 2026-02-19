<?php

namespace App\Console\Commands;

use App\Models\Profile;
use App\Models\UserRole;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Usage:
 *   php artisan admin:bootstrap \
 *     --name="John Doe" \
 *     --email="admin@shipperslink.com" \
 *     --password="ChangeMe123!"
 */
class BootstrapAdminCommand extends Command
{
    protected $signature = 'admin:bootstrap
                            {--name=  : Full name of the super admin}
                            {--email= : Email address}
                            {--password= : Initial password (min 8 chars)}';

    protected $description = 'Bootstrap the first super_admin account. Only runs if no super_admin exists.';

    public function handle(): int
    {
        // ── Safety guard ──────────────────────────────────────
        $existingSuperAdmin = UserRole::where('role', 'super_admin')->exists();
        if ($existingSuperAdmin) {
            $this->error('A super_admin account already exists. Bootstrap aborted.');
            return self::FAILURE;
        }

        // ── Gather inputs ─────────────────────────────────────
        $name     = $this->option('name')     ?: $this->ask('Full name');
        $email    = $this->option('email')    ?: $this->ask('Email address');
        $password = $this->option('password') ?: $this->secret('Password (min 8 chars)');

        if (strlen($password) < 8) {
            $this->error('Password must be at least 8 characters.');
            return self::FAILURE;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');
            return self::FAILURE;
        }

        // ── Create records in a transaction ───────────────────
        DB::transaction(function () use ($name, $email, $password) {
            // 1. Create auth user
            $user = \App\Models\User::create([
                'name'     => $name,
                'email'    => $email,
                'password' => Hash::make($password),
            ]);

            // 2. Create profile
            Profile::create([
                'user_id'              => $user->id,
                'full_name'            => $name,
                'email'                => $email,
                'username'             => Str::slug(explode(' ', $name)[0] . '_' . Str::random(4), '_'),
                'staff_id'             => 'SA-' . strtoupper(Str::random(6)),
                'department'           => 'super_admin',
                'must_change_password' => false,
                'is_active'            => true,
                'is_locked'            => false,
                'failed_login_attempts'=> 0,
            ]);

            // 3. Assign role
            UserRole::create([
                'user_id' => $user->id,
                'role'    => 'super_admin',
            ]);

            $this->info('');
            $this->info('✅  Super Admin created successfully!');
            $this->table(
                ['Field', 'Value'],
                [
                    ['Name',     $name],
                    ['Email',    $email],
                    ['Password', $password],
                    ['User ID',  $user->id],
                ]
            );
            $this->warn('⚠️  Store these credentials securely. They are shown only once.');
        });

        return self::SUCCESS;
    }
}
