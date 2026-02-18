<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Bootstrap the super admin account.
 *
 * This seeder is idempotent — it skips creation if a super_admin already exists.
 * Mirrors the logic of: php artisan admin:bootstrap
 *
 * Credentials (change immediately after first login):
 *   Email:    superadmin@shipperslink.com
 *   Password: ChangeMe@2026!
 */
class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        // Safety guard — only create if no super_admin exists
        $exists = DB::table('user_roles')->where('role', 'super_admin')->exists();

        if ($exists) {
            $this->command->warn('⚠  Super admin already exists — skipping SuperAdminSeeder.');
            return;
        }

        $user = User::create([
            'name'     => 'Super Administrator',
            'email'    => 'superadmin@shipperslink.com',
            'password' => Hash::make('ChangeMe@2026!'),
        ]);

        DB::table('profiles')->insert([
            'id'                    => (string) Str::uuid(),
            'user_id'               => $user->id,
            'full_name'             => 'Super Administrator',
            'email'                 => 'superadmin@shipperslink.com',
            'username'              => 'superadmin',
            'staff_id'              => 'SA-001',
            'department'            => 'super_admin',
            'phone'                 => null,
            'avatar_url'            => null,
            'is_active'             => true,
            'is_locked'             => false,
            'must_change_password'  => false,   // Super admin can log in directly
            'failed_login_attempts' => 0,
            'last_login_at'         => null,
            'locked_at'             => null,
            'created_at'            => now(),
            'updated_at'            => now(),
        ]);

        DB::table('user_roles')->insert([
            'id'      => (string) Str::uuid(),
            'user_id' => $user->id,
            'role'    => 'super_admin',
        ]);

        $this->command->info('✅ Super admin created: superadmin@shipperslink.com / ChangeMe@2026!');
    }
}
