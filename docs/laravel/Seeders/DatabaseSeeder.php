<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Run: php artisan db:seed
     *
     * Order matters — foreign key dependencies resolved top-down.
     */
    public function run(): void
    {
        $this->call([
            SuperAdminSeeder::class,        // 1. Bootstrap super admin
            DepartmentUsersSeeder::class,   // 2. One demo staff per department
            ClientProfileSeeder::class,     // 3. Sample client accounts
            BankConnectionSeeder::class,    // 4. Sample bank connections
            FinanceSeeder::class,           // 5. Sample invoices, expenses, job costs
            NotificationSeeder::class,      // 6. Sample notifications
        ]);

        $this->command->info('✅ All seeders completed successfully.');
    }
}
