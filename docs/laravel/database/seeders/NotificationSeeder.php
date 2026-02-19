<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seed sample in-app notifications.
 *
 * Covers all notification categories used by the application:
 * shipment, finance, bank, system, and general alerts.
 *
 * Run after all other seeders so recipient user IDs exist.
 */
class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        // Resolve user IDs from seeded accounts
        $superAdminId = DB::table('user_roles')
            ->where('role', 'super_admin')
            ->value('user_id');

        $adminId = DB::table('user_roles')
            ->where('role', 'admin')
            ->value('user_id') ?? $superAdminId;

        $accountsManagerId = DB::table('profiles')
            ->where('department', 'accounts')
            ->value('user_id') ?? $superAdminId;

        $opsManagerId = DB::table('profiles')
            ->where('department', 'operations')
            ->value('user_id') ?? $superAdminId;

        if (! $superAdminId) {
            $this->command->warn('⚠  No users found — skipping NotificationSeeder.');
            return;
        }

        $notifications = [
            // ── Shipment notifications ──────────────────────────
            [
                'recipient_id'         => $opsManagerId,
                'recipient_department' => 'operations',
                'sender_id'            => null,
                'type'                 => 'info',
                'category'             => 'shipment',
                'priority'             => 'high',
                'title'                => 'Shipment Arrived at Tema Port',
                'message'              => 'Container TCKU3210456 (BL: HLCUACC240100001) for Accra Trade Imports Ltd has arrived at Tema Port and is awaiting customs examination.',
                'reference_type'       => 'shipment',
                'reference_id'         => null,
                'action_url'           => '/shipments?bl=HLCUACC240100001',
                'is_read'              => false,
                'is_resolved'          => false,
                'read_at'              => null,
                'resolved_at'          => null,
                'metadata'             => json_encode(['bl_number' => 'HLCUACC240100001', 'customer' => 'CUST-001']),
                'created_at'           => now()->subHours(3),
                'updated_at'           => now()->subHours(3),
            ],
            [
                'recipient_id'         => $opsManagerId,
                'recipient_department' => 'operations',
                'sender_id'            => null,
                'type'                 => 'success',
                'category'             => 'shipment',
                'priority'             => 'normal',
                'title'                => 'Shipment Delivered Successfully',
                'message'              => 'Shipment COSCOTEM240300001 for Tema Port Traders has been delivered to the client\'s warehouse. Delivery confirmation received.',
                'reference_type'       => 'shipment',
                'reference_id'         => null,
                'action_url'           => '/shipments?bl=COSCOTEM240300001',
                'is_read'              => true,
                'is_resolved'          => true,
                'read_at'              => now()->subDays(4),
                'resolved_at'          => now()->subDays(4),
                'metadata'             => json_encode(['bl_number' => 'COSCOTEM240300001', 'customer' => 'CUST-003']),
                'created_at'           => now()->subDays(5),
                'updated_at'           => now()->subDays(4),
            ],

            // ── Finance / Invoice notifications ─────────────────
            [
                'recipient_id'         => $accountsManagerId,
                'recipient_department' => 'accounts',
                'sender_id'            => null,
                'type'                 => 'warning',
                'category'             => 'finance',
                'priority'             => 'high',
                'title'                => 'Invoice Overdue — Tema Port Traders',
                'message'              => 'Invoice INV-2026-000003 for GHS 9,775.00 is 15 days overdue. Please follow up with Tema Port Traders immediately.',
                'reference_type'       => 'invoice',
                'reference_id'         => null,
                'action_url'           => '/finance/invoices?number=INV-2026-000003',
                'is_read'              => false,
                'is_resolved'          => false,
                'read_at'              => null,
                'resolved_at'          => null,
                'metadata'             => json_encode(['invoice_number' => 'INV-2026-000003', 'amount' => 9775, 'currency' => 'GHS', 'days_overdue' => 15]),
                'created_at'           => now()->subDays(1),
                'updated_at'           => now()->subDays(1),
            ],
            [
                'recipient_id'         => $accountsManagerId,
                'recipient_department' => 'accounts',
                'sender_id'            => $superAdminId,
                'type'                 => 'success',
                'category'             => 'finance',
                'priority'             => 'normal',
                'title'                => 'Payment Received — Accra Trade Imports',
                'message'              => 'Full payment of GHS 14,375.00 received for Invoice INV-2026-000001. Payment method: bank transfer.',
                'reference_type'       => 'invoice',
                'reference_id'         => null,
                'action_url'           => '/finance/invoices?number=INV-2026-000001',
                'is_read'              => true,
                'is_resolved'          => true,
                'read_at'              => now()->subDays(19),
                'resolved_at'          => now()->subDays(19),
                'metadata'             => json_encode(['invoice_number' => 'INV-2026-000001', 'amount' => 14375, 'currency' => 'GHS']),
                'created_at'           => now()->subDays(20),
                'updated_at'           => now()->subDays(19),
            ],

            // ── Expense approval notifications ───────────────────
            [
                'recipient_id'         => $adminId,
                'recipient_department' => 'management',
                'sender_id'            => $opsManagerId,
                'type'                 => 'info',
                'category'             => 'finance',
                'priority'             => 'normal',
                'title'                => 'Expense Approval Required',
                'message'              => 'Kwame Asante has submitted EXP-2026-000002 for GHS 8,500.00 (Vehicle fuel — operations fleet). Please review and approve.',
                'reference_type'       => 'expense',
                'reference_id'         => null,
                'action_url'           => '/finance/expenses?ref=EXP-2026-000002',
                'is_read'              => false,
                'is_resolved'          => false,
                'read_at'              => null,
                'resolved_at'          => null,
                'metadata'             => json_encode(['expense_ref' => 'EXP-2026-000002', 'amount' => 8500, 'currency' => 'GHS']),
                'created_at'           => now()->subDays(5),
                'updated_at'           => now()->subDays(5),
            ],

            // ── Bank / treasury notifications ────────────────────
            [
                'recipient_id'         => $accountsManagerId,
                'recipient_department' => 'accounts',
                'sender_id'            => null,
                'type'                 => 'error',
                'category'             => 'bank',
                'priority'             => 'high',
                'title'                => 'Bank Sync Failed — StanChart EUR Account',
                'message'              => 'Unable to sync Standard Chartered EUR account (0100023400003). API authentication error. Re-verify credentials in Banking Settings.',
                'reference_type'       => 'bank_connection',
                'reference_id'         => null,
                'action_url'           => '/finance/banking',
                'is_read'              => false,
                'is_resolved'          => false,
                'read_at'              => null,
                'resolved_at'          => null,
                'metadata'             => json_encode(['bank' => 'Standard Chartered Ghana', 'currency' => 'EUR', 'account_number' => '0100023400003']),
                'created_at'           => now()->subHours(2),
                'updated_at'           => now()->subHours(2),
            ],
            [
                'recipient_id'         => $accountsManagerId,
                'recipient_department' => 'accounts',
                'sender_id'            => null,
                'type'                 => 'info',
                'category'             => 'bank',
                'priority'             => 'normal',
                'title'                => 'Large Credit Received — GCB Main Account',
                'message'              => 'Credit of GHS 125,000.00 received from GoldCoast Logistics Co. on the GCB Main Operations account. Auto-match confidence: 62%.',
                'reference_type'       => 'bank_transaction',
                'reference_id'         => null,
                'action_url'           => '/finance/banking/reconciliation',
                'is_read'              => false,
                'is_resolved'          => false,
                'read_at'              => null,
                'resolved_at'          => null,
                'metadata'             => json_encode(['transaction_ref' => 'TXN-2026-003', 'amount' => 125000, 'currency' => 'GHS']),
                'created_at'           => now()->subDays(5),
                'updated_at'           => now()->subDays(5),
            ],

            // ── System / admin notifications ─────────────────────
            [
                'recipient_id'         => $superAdminId,
                'recipient_department' => 'super_admin',
                'sender_id'            => null,
                'type'                 => 'info',
                'category'             => 'system',
                'priority'             => 'low',
                'title'                => 'Database Seeding Completed',
                'message'              => 'All sample data has been seeded successfully. The system is ready for demonstration.',
                'reference_type'       => null,
                'reference_id'         => null,
                'action_url'           => '/dashboard',
                'is_read'              => false,
                'is_resolved'          => false,
                'read_at'              => null,
                'resolved_at'          => null,
                'metadata'             => null,
                'created_at'           => now(),
                'updated_at'           => now(),
            ],
        ];

        $inserted = 0;

        foreach ($notifications as $notification) {
            DB::table('notifications')->insert(array_merge($notification, [
                'id' => (string) Str::uuid(),
            ]));
            $inserted++;
        }

        $this->command->info("✅ Seeded {$inserted} sample notifications.");
    }
}
