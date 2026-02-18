<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seed sample notifications across departments.
 *
 * Covers all trigger types defined in business-logic.md §7:
 * - Invoice overdue
 * - Shipment status changed
 * - Bank sync failed
 * - Low bank balance
 * - Large transaction
 * - New client message
 * - Finance expense submitted
 * - Account locked
 */
class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $notifications = [
            // Invoice overdue — accounts department
            [
                'title'                => 'Invoice Overdue — Tema Port Traders',
                'message'              => 'Invoice INV-2026-000003 for GHS 9,775.00 is 15 days overdue. Customer: Tema Port Traders.',
                'type'                 => 'invoice_overdue',
                'category'             => 'finance',
                'priority'             => 'high',
                'recipient_department' => 'accounts',
                'recipient_id'         => null,
                'reference_type'       => 'invoice',
                'reference_id'         => null,
                'action_url'           => '/finance?tab=invoices',
                'is_read'              => false,
                'is_resolved'          => false,
                'created_at'           => now()->subDays(2),
            ],
            // Invoice overdue escalation — management
            [
                'title'                => 'Overdue Invoice Escalation — Tema Port Traders',
                'message'              => 'Invoice INV-2026-000003 remains unpaid after 15 days. Escalated to management for review.',
                'type'                 => 'invoice_overdue',
                'category'             => 'finance',
                'priority'             => 'high',
                'recipient_department' => 'management',
                'recipient_id'         => null,
                'reference_type'       => 'invoice',
                'reference_id'         => null,
                'action_url'           => '/finance?tab=invoices',
                'is_read'              => false,
                'is_resolved'          => false,
                'created_at'           => now()->subDays(1),
            ],
            // Bank sync error — accounts
            [
                'title'                => 'Bank Sync Failed — StanChart EUR Account',
                'message'              => 'Automatic sync failed for Standard Chartered EUR account. Error: API authentication failed. Manual sync required.',
                'type'                 => 'bank_sync_failed',
                'category'             => 'banking',
                'priority'             => 'high',
                'recipient_department' => 'accounts',
                'recipient_id'         => null,
                'reference_type'       => 'bank_connection',
                'reference_id'         => null,
                'action_url'           => '/bank-integration',
                'is_read'              => false,
                'is_resolved'          => false,
                'created_at'           => now()->subHours(2),
            ],
            // Bank sync error — management
            [
                'title'                => 'Bank Sync Failed — StanChart EUR Account',
                'message'              => 'Automatic sync failed for Standard Chartered EUR account. Error: API authentication failed.',
                'type'                 => 'bank_sync_failed',
                'category'             => 'banking',
                'priority'             => 'high',
                'recipient_department' => 'management',
                'recipient_id'         => null,
                'reference_type'       => 'bank_connection',
                'reference_id'         => null,
                'action_url'           => '/bank-integration',
                'is_read'              => true,
                'is_resolved'          => false,
                'read_at'              => now()->subHours(1),
                'created_at'           => now()->subHours(2),
            ],
            // Shipment status changed (for client — stored with recipient_id of client user)
            [
                'title'                => 'Shipment Update — TCKU3210456',
                'message'              => 'Your shipment TCKU3210456 has arrived at Tema Port and is currently undergoing customs clearance.',
                'type'                 => 'shipment_status',
                'category'             => 'operations',
                'priority'             => 'medium',
                'recipient_department' => null,
                'recipient_id'         => null, // Would be client user_id in production
                'reference_type'       => 'shipment',
                'reference_id'         => null,
                'action_url'           => '/client/shipments',
                'is_read'              => false,
                'is_resolved'          => false,
                'created_at'           => now()->subDays(2),
            ],
            // New client message — customer_service
            [
                'title'                => 'New Message from Accra Trade Imports Ltd',
                'message'              => 'Client CUST-001 has sent a new message regarding their shipment clearance timeline.',
                'type'                 => 'client_message',
                'category'             => 'customer_service',
                'priority'             => 'medium',
                'recipient_department' => 'customer_service',
                'recipient_id'         => null,
                'reference_type'       => 'message',
                'reference_id'         => null,
                'action_url'           => '/notifications',
                'is_read'              => false,
                'is_resolved'          => false,
                'created_at'           => now()->subHours(4),
            ],
            // Expense submitted — management
            [
                'title'                => 'New Expense Pending Approval',
                'message'              => 'Ama Owusu (Marketing) has submitted EXP-2026-000003 for GHS 1,200.00 — Business travel.',
                'type'                 => 'expense_submitted',
                'category'             => 'finance',
                'priority'             => 'medium',
                'recipient_department' => 'management',
                'recipient_id'         => null,
                'reference_type'       => 'expense',
                'reference_id'         => null,
                'action_url'           => '/finance?tab=expenses',
                'is_read'              => false,
                'is_resolved'          => false,
                'created_at'           => now()->subHours(1),
            ],
            // Large transaction — management & accounts
            [
                'title'                => 'Large Transaction Detected — GHS 125,000',
                'message'              => 'A credit of GHS 125,000.00 from GoldCoast Logistics Co. has been received on GCB Main Operations account. Reference: TXN-2026-003.',
                'type'                 => 'large_transaction',
                'category'             => 'banking',
                'priority'             => 'high',
                'recipient_department' => 'management',
                'recipient_id'         => null,
                'reference_type'       => 'bank_transaction',
                'reference_id'         => null,
                'action_url'           => '/bank-integration',
                'is_read'              => false,
                'is_resolved'          => false,
                'created_at'           => now()->subDays(5),
            ],
        ];

        foreach ($notifications as $notification) {
            DB::table('notifications')->insert(array_merge([
                'id'             => (string) Str::uuid(),
                'sender_id'      => null,
                'read_at'        => null,
                'resolved_at'    => null,
                'metadata'       => null,
                'is_resolved'    => false,
                'updated_at'     => now(),
            ], $notification));
        }

        $this->command->info('✅ Seeded ' . count($notifications) . ' sample notifications.');
    }
}
