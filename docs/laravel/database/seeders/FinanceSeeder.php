<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seed sample finance records: shipments, invoices, job costs, and expenses.
 *
 * Uses customer IDs from ClientProfileSeeder (CUST-001 → CUST-005).
 * Run after ClientProfileSeeder.
 */
class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        // Get the super admin's user ID to use as created_by
        $adminId = DB::table('user_roles')
            ->where('role', 'super_admin')
            ->value('user_id') ?? DB::table('users')->value('id');

        $this->seedShipments($adminId);
        $this->seedInvoices($adminId);
        $this->seedJobCosts($adminId);
        $this->seedExpenses($adminId);

        $this->command->info('✅ Finance records seeded.');
    }

    // ── Shipments ──────────────────────────────────────────────

    private function seedShipments(string $adminId): void
    {
        $shipments = [
            [
                'id'                => (string) Str::uuid(),
                'customer_id'       => 'CUST-001',
                'bl_number'         => 'HLCUACC240100001',
                'container_number'  => 'TCKU3210456',
                'vessel_name'       => 'MSC ACCRA',
                'voyage_number'     => 'VA240E',
                'origin'            => 'Shenzhen, China',
                'destination'       => 'Tema Port, Ghana',
                'status'            => 'customs',
                'eta'               => now()->addDays(3)->toDateString(),
                'ata'               => now()->subDays(2)->toDateString(),
                'cargo_description' => '1 x 40ft HC Container — Electronic Goods',
                'weight_kg'         => 18500,
                'notes'             => 'Awaiting ICUMS clearance — tariff classification pending.',
                'created_by'        => $adminId,
                'created_at'        => now()->subDays(30),
                'updated_at'        => now()->subDays(2),
            ],
            [
                'id'                => (string) Str::uuid(),
                'customer_id'       => 'CUST-002',
                'bl_number'         => 'EVERGC240200002',
                'container_number'  => 'MAGU2198765',
                'vessel_name'       => 'EVER GLORY',
                'voyage_number'     => 'GL2402',
                'origin'            => 'Guangzhou, China',
                'destination'       => 'Tema Port, Ghana',
                'status'            => 'in_transit',
                'eta'               => now()->addDays(12)->toDateString(),
                'ata'               => null,
                'cargo_description' => '2 x 20ft Containers — General Merchandise',
                'weight_kg'         => 28000,
                'notes'             => null,
                'created_by'        => $adminId,
                'created_at'        => now()->subDays(15),
                'updated_at'        => now()->subDays(5),
            ],
            [
                'id'                => (string) Str::uuid(),
                'customer_id'       => 'CUST-003',
                'bl_number'         => 'COSCOTEM240300001',
                'container_number'  => 'COSU8437210',
                'vessel_name'       => 'COSCO SHIPPING ARIES',
                'voyage_number'     => 'SA2406',
                'origin'            => 'Busan, South Korea',
                'destination'       => 'Tema Port, Ghana',
                'status'            => 'delivered',
                'eta'               => now()->subDays(10)->toDateString(),
                'ata'               => now()->subDays(14)->toDateString(),
                'cargo_description' => '1 x 20ft Container — Auto Parts',
                'weight_kg'         => 12000,
                'notes'             => 'Delivered to client warehouse on ' . now()->subDays(5)->toDateString(),
                'created_by'        => $adminId,
                'created_at'        => now()->subDays(45),
                'updated_at'        => now()->subDays(5),
            ],
            [
                'id'                => (string) Str::uuid(),
                'customer_id'       => 'CUST-004',
                'bl_number'         => 'MAERSK240400004',
                'container_number'  => 'MRKU4567891',
                'vessel_name'       => 'MAERSK EINDHOVEN',
                'voyage_number'     => 'ME2407',
                'origin'            => 'Felixstowe, UK',
                'destination'       => 'Tema Port, Ghana',
                'status'            => 'pending',
                'eta'               => now()->addDays(25)->toDateString(),
                'ata'               => null,
                'cargo_description' => '1 x 40ft Container — Industrial Equipment',
                'weight_kg'         => 24000,
                'notes'             => null,
                'created_by'        => $adminId,
                'created_at'        => now()->subDays(5),
                'updated_at'        => now()->subDays(5),
            ],
        ];

        foreach ($shipments as $shipment) {
            if (DB::table('client_shipments')->where('bl_number', $shipment['bl_number'])->exists()) {
                continue;
            }
            DB::table('client_shipments')->insert($shipment);
        }

        $this->command->info('  ✅ Seeded 4 client shipments.');
    }

    // ── Invoices ───────────────────────────────────────────────

    private function seedInvoices(string $adminId): void
    {
        $invoices = [
            [
                'customer'       => 'Accra Trade Imports Ltd',
                'customer_id'    => 'CUST-001',
                'invoice_number' => 'INV-2026-000001',
                'invoice_type'   => 'standard',
                'service_type'   => 'Customs Clearance',
                'currency'       => 'GHS',
                'exchange_rate'  => 1.00,
                'subtotal'       => 12500.00,
                'tax_amount'     => 1875.00,
                'total_amount'   => 14375.00,
                'ghs_equivalent' => 14375.00,
                'paid_amount'    => 14375.00,
                'status'         => 'paid',
                'issue_date'     => now()->subDays(30)->toDateString(),
                'due_date'       => now()->subDays(16)->toDateString(),
                'paid_date'      => now()->subDays(20)->toDateString(),
                'payment_method' => 'bank_transfer',
                'shipment_ref'   => 'HLCUACC240100001',
            ],
            [
                'customer'       => 'GoldCoast Logistics Co.',
                'customer_id'    => 'CUST-002',
                'invoice_number' => 'INV-2026-000002',
                'invoice_type'   => 'standard',
                'service_type'   => 'Freight Forwarding',
                'currency'       => 'USD',
                'exchange_rate'  => 15.40,
                'subtotal'       => 3200.00,
                'tax_amount'     => 480.00,
                'total_amount'   => 3680.00,
                'ghs_equivalent' => 56672.00,
                'paid_amount'    => 0,
                'status'         => 'sent',
                'issue_date'     => now()->subDays(15)->toDateString(),
                'due_date'       => now()->addDays(15)->toDateString(),
                'paid_date'      => null,
                'payment_method' => null,
                'shipment_ref'   => 'EVERGC240200002',
            ],
            [
                'customer'       => 'Tema Port Traders',
                'customer_id'    => 'CUST-003',
                'invoice_number' => 'INV-2026-000003',
                'invoice_type'   => 'standard',
                'service_type'   => 'Port Handling & Clearance',
                'currency'       => 'GHS',
                'exchange_rate'  => 1.00,
                'subtotal'       => 8500.00,
                'tax_amount'     => 1275.00,
                'total_amount'   => 9775.00,
                'ghs_equivalent' => 9775.00,
                'paid_amount'    => 0,
                'status'         => 'overdue',
                'issue_date'     => now()->subDays(45)->toDateString(),
                'due_date'       => now()->subDays(15)->toDateString(),
                'paid_date'      => null,
                'payment_method' => null,
                'shipment_ref'   => 'COSCOTEM240300001',
            ],
            [
                'customer'       => 'Kumasi Freight Solutions',
                'customer_id'    => 'CUST-004',
                'invoice_number' => 'INV-2026-000004',
                'invoice_type'   => 'proforma',
                'service_type'   => 'Freight Forwarding',
                'currency'       => 'GHS',
                'exchange_rate'  => 1.00,
                'subtotal'       => 18000.00,
                'tax_amount'     => 2700.00,
                'total_amount'   => 20700.00,
                'ghs_equivalent' => 20700.00,
                'paid_amount'    => 0,
                'status'         => 'draft',
                'issue_date'     => now()->toDateString(),
                'due_date'       => now()->addDays(30)->toDateString(),
                'paid_date'      => null,
                'payment_method' => null,
                'shipment_ref'   => 'MAERSK240400004',
            ],
        ];

        foreach ($invoices as $invoice) {
            if (DB::table('finance_invoices')->where('invoice_number', $invoice['invoice_number'])->exists()) {
                continue;
            }
            DB::table('finance_invoices')->insert(array_merge($invoice, [
                'id'                => (string) Str::uuid(),
                'created_by'        => $adminId,
                'approved_by'       => null,
                'approval_date'     => null,
                'consolidation_ref' => null,
                'job_ref'           => null,
                'notes'             => null,
                'description'       => null,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]));
        }

        $this->command->info('  ✅ Seeded 4 finance invoices.');
    }

    // ── Job Costs ──────────────────────────────────────────────

    private function seedJobCosts(string $adminId): void
    {
        $costs = [
            [
                'job_ref'         => 'JOB-2026-000001',
                'customer'        => 'Accra Trade Imports Ltd',
                'customer_id'     => 'CUST-001',
                'job_type'        => 'Import Clearance',
                'cost_category'   => 'Customs Duty',
                'description'     => 'Import customs duty and levies — TCKU3210456',
                'amount'          => 42000.00,
                'currency'        => 'GHS',
                'exchange_rate'   => 1.00,
                'ghs_equivalent'  => 42000.00,
                'vendor'          => 'Ghana Revenue Authority',
                'approval_status' => 'approved',
                'payment_status'  => 'paid',
                'paid_amount'     => 42000.00,
                'paid_date'       => now()->subDays(18)->toDateString(),
                'due_date'        => now()->subDays(20)->toDateString(),
                'shipment_ref'    => 'HLCUACC240100001',
                'is_reimbursable' => true,
            ],
            [
                'job_ref'         => 'JOB-2026-000002',
                'customer'        => 'GoldCoast Logistics Co.',
                'customer_id'     => 'CUST-002',
                'job_type'        => 'Port Handling',
                'cost_category'   => 'Port Charges',
                'description'     => 'Port handling, scanning, and inspection fees',
                'amount'          => 850.00,
                'currency'        => 'USD',
                'exchange_rate'   => 15.40,
                'ghs_equivalent'  => 13090.00,
                'vendor'          => 'Meridian Port Services',
                'approval_status' => 'pending',
                'payment_status'  => 'unpaid',
                'paid_amount'     => 0,
                'paid_date'       => null,
                'due_date'        => now()->addDays(10)->toDateString(),
                'shipment_ref'    => 'EVERGC240200002',
                'is_reimbursable' => true,
            ],
            [
                'job_ref'         => 'JOB-2026-000003',
                'customer'        => 'Tema Port Traders',
                'customer_id'     => 'CUST-003',
                'job_type'        => 'Trucking',
                'cost_category'   => 'Transportation',
                'description'     => 'Container haulage — Tema Port to Kumasi warehouse',
                'amount'          => 4800.00,
                'currency'        => 'GHS',
                'exchange_rate'   => 1.00,
                'ghs_equivalent'  => 4800.00,
                'vendor'          => 'SLAC Trucking Division',
                'approval_status' => 'approved',
                'payment_status'  => 'paid',
                'paid_amount'     => 4800.00,
                'paid_date'       => now()->subDays(8)->toDateString(),
                'due_date'        => now()->subDays(10)->toDateString(),
                'shipment_ref'    => 'COSCOTEM240300001',
                'is_reimbursable' => false,
            ],
        ];

        foreach ($costs as $cost) {
            if (DB::table('finance_job_costs')->where('job_ref', $cost['job_ref'])->exists()) {
                continue;
            }
            DB::table('finance_job_costs')->insert(array_merge($cost, [
                'id'                => (string) Str::uuid(),
                'created_by'        => $adminId,
                'approved_by'       => $cost['approval_status'] === 'approved' ? $adminId : null,
                'consolidation_ref' => null,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]));
        }

        $this->command->info('  ✅ Seeded 3 job costs.');
    }

    // ── Expenses ───────────────────────────────────────────────

    private function seedExpenses(string $adminId): void
    {
        $expenses = [
            [
                'expense_ref'    => 'EXP-2026-000001',
                'description'    => 'Monthly office electricity bill',
                'category'       => 'utilities',
                'amount'         => 3200.00,
                'currency'       => 'GHS',
                'exchange_rate'  => 1.00,
                'ghs_equivalent' => 3200.00,
                'requested_by'   => 'Kofi Boateng',
                'status'         => 'paid',
                'expense_date'   => now()->subDays(10)->toDateString(),
                'paid_date'      => now()->subDays(8)->toDateString(),
                'notes'          => null,
            ],
            [
                'expense_ref'    => 'EXP-2026-000002',
                'description'    => 'Vehicle fuel — operations fleet (February)',
                'category'       => 'fuel',
                'amount'         => 8500.00,
                'currency'       => 'GHS',
                'exchange_rate'  => 1.00,
                'ghs_equivalent' => 8500.00,
                'requested_by'   => 'Kwame Asante',
                'status'         => 'approved',
                'expense_date'   => now()->subDays(5)->toDateString(),
                'paid_date'      => null,
                'notes'          => 'Covers 8 trucks for February operations.',
            ],
            [
                'expense_ref'    => 'EXP-2026-000003',
                'description'    => 'Business travel — Accra to Takoradi client visit',
                'category'       => 'travel',
                'amount'         => 1200.00,
                'currency'       => 'GHS',
                'exchange_rate'  => 1.00,
                'ghs_equivalent' => 1200.00,
                'requested_by'   => 'Ama Owusu',
                'status'         => 'pending',
                'expense_date'   => now()->toDateString(),
                'paid_date'      => null,
                'notes'          => 'Client acquisition visit for Takoradi port expansion project.',
            ],
            [
                'expense_ref'    => 'EXP-2026-000004',
                'description'    => 'Office stationery and printing supplies',
                'category'       => 'office',
                'amount'         => 450.00,
                'currency'       => 'GHS',
                'exchange_rate'  => 1.00,
                'ghs_equivalent' => 450.00,
                'requested_by'   => 'Abena Mensah',
                'status'         => 'pending',
                'expense_date'   => now()->subDays(2)->toDateString(),
                'paid_date'      => null,
                'notes'          => null,
            ],
        ];

        foreach ($expenses as $expense) {
            if (DB::table('finance_expenses')->where('expense_ref', $expense['expense_ref'])->exists()) {
                continue;
            }
            DB::table('finance_expenses')->insert(array_merge($expense, [
                'id'          => (string) Str::uuid(),
                'approved_by' => in_array($expense['status'], ['approved', 'paid']) ? $adminId : null,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]));
        }

        $this->command->info('  ✅ Seeded 4 expenses.');
    }
}
