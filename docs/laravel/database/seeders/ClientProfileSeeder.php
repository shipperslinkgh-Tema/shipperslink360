<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seed sample client portal accounts.
 *
 * Each client gets:
 *  - A users row (for auth)
 *  - A client_profiles row (for portal access)
 *  - Sample shipments seeded in FinanceSeeder
 *
 * Default client password: ClientDemo@2026!
 */
class ClientProfileSeeder extends Seeder
{
    private array $clients = [
        [
            'customer_id'  => 'CUST-001',
            'company_name' => 'Accra Trade Imports Ltd',
            'contact_name' => 'John Mensah',
            'email'        => 'john.mensah@accratrade.com',
            'phone'        => '+233244100001',
        ],
        [
            'customer_id'  => 'CUST-002',
            'company_name' => 'GoldCoast Logistics Co.',
            'contact_name' => 'Adwoa Amponsah',
            'email'        => 'adwoa@goldcoastlogistics.com',
            'phone'        => '+233244100002',
        ],
        [
            'customer_id'  => 'CUST-003',
            'company_name' => 'Tema Port Traders',
            'contact_name' => 'Kojo Asare',
            'email'        => 'kojo.asare@tematraders.com',
            'phone'        => '+233244100003',
        ],
        [
            'customer_id'  => 'CUST-004',
            'company_name' => 'Kumasi Freight Solutions',
            'contact_name' => 'Akosua Boateng',
            'email'        => 'akosua@kumasi-freight.com',
            'phone'        => '+233244100004',
        ],
        [
            'customer_id'  => 'CUST-005',
            'company_name' => 'West Africa Clearing Agents',
            'contact_name' => 'Emmanuel Ofori',
            'email'        => 'e.ofori@waca.com.gh',
            'phone'        => '+233244100005',
        ],
    ];

    public function run(): void
    {
        $password = Hash::make('ClientDemo@2026!');

        foreach ($this->clients as $client) {
            if (User::where('email', $client['email'])->exists()) {
                $this->command->warn("  ⚠  {$client['email']} already exists — skipping.");
                continue;
            }

            $user = User::create([
                'name'     => $client['contact_name'],
                'email'    => $client['email'],
                'password' => $password,
            ]);

            DB::table('client_profiles')->insert([
                'id'            => (string) Str::uuid(),
                'user_id'       => $user->id,
                'customer_id'   => $client['customer_id'],
                'company_name'  => $client['company_name'],
                'contact_name'  => $client['contact_name'],
                'email'         => $client['email'],
                'phone'         => $client['phone'],
                'is_active'     => true,
                'last_login_at' => null,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);

            $this->command->info("  ✅ Created client: {$client['company_name']} ({$client['customer_id']})");
        }

        $this->command->info('✅ Client profiles seeded. Default password: ClientDemo@2026!');
    }
}
