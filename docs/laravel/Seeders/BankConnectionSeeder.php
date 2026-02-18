<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seed sample bank connections and transactions.
 *
 * Represents the typical Ghanaian banking setup for a freight forwarder:
 * GHS operational, USD settlement, and EUR trade accounts.
 */
class BankConnectionSeeder extends Seeder
{
    public function run(): void
    {
        $connections = [
            [
                'id'               => (string) Str::uuid(),
                'bank_name'        => 'GCB Bank',
                'bank_display_name'=> 'GCB Bank — Main Operations',
                'account_name'     => 'SLAC Freight Link Ltd',
                'account_number'   => '1021200100001',
                'account_type'     => 'current',
                'currency'         => 'GHS',
                'balance'          => 485200.00,
                'available_balance'=> 480000.00,
                'is_active'        => true,
                'sync_status'      => 'success',
                'last_sync_at'     => now()->subMinutes(28),
                'api_endpoint'     => null,
                'error_message'    => null,
                'created_at'       => now()->subMonths(6),
                'updated_at'       => now()->subMinutes(28),
            ],
            [
                'id'               => (string) Str::uuid(),
                'bank_name'        => 'Ecobank Ghana',
                'bank_display_name'=> 'Ecobank — USD Settlement',
                'account_name'     => 'SLAC Freight Link Ltd',
                'account_number'   => '0088104200002',
                'account_type'     => 'current',
                'currency'         => 'USD',
                'balance'          => 32500.00,
                'available_balance'=> 30000.00,
                'is_active'        => true,
                'sync_status'      => 'success',
                'last_sync_at'     => now()->subMinutes(29),
                'api_endpoint'     => null,
                'error_message'    => null,
                'created_at'       => now()->subMonths(4),
                'updated_at'       => now()->subMinutes(29),
            ],
            [
                'id'               => (string) Str::uuid(),
                'bank_name'        => 'Standard Chartered Ghana',
                'bank_display_name'=> 'StanChart — EUR Trade Account',
                'account_name'     => 'SLAC Freight Link Ltd',
                'account_number'   => '0100023400003',
                'account_type'     => 'current',
                'currency'         => 'EUR',
                'balance'          => 8750.00,
                'available_balance'=> 8750.00,
                'is_active'        => true,
                'sync_status'      => 'error',
                'last_sync_at'     => now()->subHours(2),
                'api_endpoint'     => null,
                'error_message'    => 'API authentication failed. Please re-verify credentials.',
                'created_at'       => now()->subMonths(2),
                'updated_at'       => now()->subHours(2),
            ],
            [
                'id'               => (string) Str::uuid(),
                'bank_name'        => 'Absa Bank Ghana',
                'bank_display_name'=> 'Absa — Payroll Account',
                'account_name'     => 'SLAC Freight Link Ltd',
                'account_number'   => '2090145600004',
                'account_type'     => 'current',
                'currency'         => 'GHS',
                'balance'          => 98400.00,
                'available_balance'=> 98400.00,
                'is_active'        => false, // Deactivated
                'sync_status'      => 'idle',
                'last_sync_at'     => null,
                'api_endpoint'     => null,
                'error_message'    => null,
                'created_at'       => now()->subMonths(12),
                'updated_at'       => now()->subMonths(3),
            ],
        ];

        foreach ($connections as $connection) {
            // Idempotent — skip if account_number already exists
            $exists = DB::table('bank_connections')
                ->where('account_number', $connection['account_number'])
                ->exists();

            if ($exists) {
                $this->command->warn("  ⚠  Account {$connection['account_number']} already exists — skipping.");
                continue;
            }

            DB::table('bank_connections')->insert($connection);
            $this->command->info("  ✅ {$connection['bank_display_name']} ({$connection['currency']} {$connection['account_number']})");
        }

        // Seed sample transactions for the first (GCB) connection
        $gcbId = DB::table('bank_connections')
            ->where('account_number', '1021200100001')
            ->value('id');

        if ($gcbId) {
            $this->seedTransactions($gcbId);
        }

        // Seed a low-balance alert for the EUR account
        $stanChartId = DB::table('bank_connections')
            ->where('account_number', '0100023400003')
            ->value('id');

        if ($stanChartId) {
            DB::table('bank_alerts')->insert([
                'id'                 => (string) Str::uuid(),
                'bank_connection_id' => $stanChartId,
                'alert_type'         => 'sync_error',
                'title'              => 'Bank Sync Failed — StanChart EUR Account',
                'message'            => 'API authentication failed for StanChart EUR account. Please re-verify API credentials in the banking settings.',
                'priority'           => 'high',
                'amount'             => null,
                'currency'           => 'EUR',
                'is_read'            => false,
                'is_dismissed'       => false,
                'read_at'            => null,
                'read_by'            => null,
                'transaction_id'     => null,
                'created_at'         => now()->subHours(2),
            ]);
        }

        $this->command->info('✅ Bank connections seeded.');
    }

    private function seedTransactions(string $connectionId): void
    {
        $transactions = [
            [
                'transaction_ref'  => 'TXN-2026-001',
                'transaction_type' => 'credit',
                'amount'           => 85000.00,
                'currency'         => 'GHS',
                'description'      => 'Payment received — CUST-001 INV-2026-000012',
                'counterparty_name'=> 'Accra Trade Imports Ltd',
                'transaction_date' => now()->subDays(2)->toDateString(),
                'match_status'     => 'matched',
                'match_confidence' => 95,
                'is_reconciled'    => false,
                'balance_after'    => 485200.00,
            ],
            [
                'transaction_ref'  => 'TXN-2026-002',
                'transaction_type' => 'debit',
                'amount'           => 12500.00,
                'currency'         => 'GHS',
                'description'      => 'GPA Port Charges — Container ABCD1234567',
                'counterparty_name'=> 'Ghana Ports Authority',
                'transaction_date' => now()->subDays(3)->toDateString(),
                'match_status'     => 'manual',
                'match_confidence' => 100,
                'is_reconciled'    => false,
                'balance_after'    => 400200.00,
            ],
            [
                'transaction_ref'  => 'TXN-2026-003',
                'transaction_type' => 'credit',
                'amount'           => 125000.00,
                'currency'         => 'GHS',
                'description'      => 'Wire transfer received',
                'counterparty_name'=> 'GoldCoast Logistics Co.',
                'transaction_date' => now()->subDays(5)->toDateString(),
                'match_status'     => 'partial',
                'match_confidence' => 62,
                'is_reconciled'    => false,
                'balance_after'    => 412700.00,
            ],
            [
                'transaction_ref'  => 'TXN-2026-004',
                'transaction_type' => 'debit',
                'amount'           => 8200.00,
                'currency'         => 'GHS',
                'description'      => 'Utility bills — office complex',
                'counterparty_name'=> 'ECG Ghana',
                'transaction_date' => now()->subDays(7)->toDateString(),
                'match_status'     => 'unmatched',
                'match_confidence' => null,
                'is_reconciled'    => true,
                'balance_after'    => 287700.00,
            ],
        ];

        foreach ($transactions as $txn) {
            DB::table('bank_transactions')->insert(array_merge($txn, [
                'id'                 => (string) Str::uuid(),
                'bank_connection_id' => $connectionId,
                'matched_invoice_id' => null,
                'matched_receivable_id' => null,
                'value_date'         => $txn['transaction_date'],
                'notes'              => null,
                'raw_data'           => null,
                'reconciled_at'      => $txn['is_reconciled'] ? now()->subDays(1) : null,
                'reconciled_by'      => null,
                'created_at'         => now(),
            ]));
        }

        $this->command->info('  ✅ Seeded 4 sample transactions for GCB account.');
    }
}
