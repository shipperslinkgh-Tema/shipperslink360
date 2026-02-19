<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seed one demo staff member per department.
 *
 * All demo accounts start with must_change_password = true.
 * Default password: Demo@12345!
 */
class DepartmentUsersSeeder extends Seeder
{
    private array $staff = [
        [
            'full_name'  => 'Kwame Asante',
            'email'      => 'kwame.asante@shipperslink.com',
            'username'   => 'kwame.asante',
            'staff_id'   => 'OPS-001',
            'department' => 'operations',
            'role'       => 'manager',
            'phone'      => '+233201111001',
        ],
        [
            'full_name'  => 'Abena Mensah',
            'email'      => 'abena.mensah@shipperslink.com',
            'username'   => 'abena.mensah',
            'staff_id'   => 'DOC-001',
            'department' => 'documentation',
            'role'       => 'staff',
            'phone'      => '+233201111002',
        ],
        [
            'full_name'  => 'Kofi Boateng',
            'email'      => 'kofi.boateng@shipperslink.com',
            'username'   => 'kofi.boateng',
            'staff_id'   => 'ACC-001',
            'department' => 'accounts',
            'role'       => 'manager',
            'phone'      => '+233201111003',
        ],
        [
            'full_name'  => 'Ama Owusu',
            'email'      => 'ama.owusu@shipperslink.com',
            'username'   => 'ama.owusu',
            'staff_id'   => 'MKT-001',
            'department' => 'marketing',
            'role'       => 'staff',
            'phone'      => '+233201111004',
        ],
        [
            'full_name'  => 'Yaw Darko',
            'email'      => 'yaw.darko@shipperslink.com',
            'username'   => 'yaw.darko',
            'staff_id'   => 'CS-001',
            'department' => 'customer_service',
            'role'       => 'staff',
            'phone'      => '+233201111005',
        ],
        [
            'full_name'  => 'Efua Ampofo',
            'email'      => 'efua.ampofo@shipperslink.com',
            'username'   => 'efua.ampofo',
            'staff_id'   => 'WH-001',
            'department' => 'warehouse',
            'role'       => 'staff',
            'phone'      => '+233201111006',
        ],
        [
            'full_name'  => 'Nana Agyei',
            'email'      => 'nana.agyei@shipperslink.com',
            'username'   => 'nana.agyei',
            'staff_id'   => 'MGT-001',
            'department' => 'management',
            'role'       => 'admin',
            'phone'      => '+233201111007',
        ],
    ];

    public function run(): void
    {
        $password = Hash::make('Demo@12345!');

        foreach ($this->staff as $data) {
            // Skip if email already exists
            if (User::where('email', $data['email'])->exists()) {
                $this->command->warn("  ⚠  {$data['email']} already exists — skipping.");
                continue;
            }

            $user = User::create([
                'name'     => $data['full_name'],
                'email'    => $data['email'],
                'password' => $password,
            ]);

            DB::table('profiles')->insert([
                'id'                    => (string) Str::uuid(),
                'user_id'               => $user->id,
                'full_name'             => $data['full_name'],
                'email'                 => $data['email'],
                'username'              => $data['username'],
                'staff_id'              => $data['staff_id'],
                'department'            => $data['department'],
                'phone'                 => $data['phone'],
                'avatar_url'            => null,
                'is_active'             => true,
                'is_locked'             => false,
                'must_change_password'  => true,
                'failed_login_attempts' => 0,
                'last_login_at'         => null,
                'locked_at'             => null,
                'created_at'            => now(),
                'updated_at'            => now(),
            ]);

            DB::table('user_roles')->insert([
                'id'      => (string) Str::uuid(),
                'user_id' => $user->id,
                'role'    => $data['role'],
            ]);

            $this->command->info("  ✅ Created {$data['department']} user: {$data['email']}");
        }

        $this->command->info('✅ Department users seeded. Default password: Demo@12345!');
    }
}
