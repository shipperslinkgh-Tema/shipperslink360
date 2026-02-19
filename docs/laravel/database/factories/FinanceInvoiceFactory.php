<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class FinanceInvoiceFactory extends Factory
{
    public function definition(): array
    {
        $subtotal  = fake()->randomFloat(2, 500, 50000);
        $taxAmount = $subtotal * 0.15;
        $total     = $subtotal + $taxAmount;

        return [
            'invoice_number' => 'INV-' . date('Ym') . '-' . fake()->unique()->numerify('####'),
            'invoice_type'   => fake()->randomElement(['customs_clearance', 'freight', 'trucking']),
            'customer'       => fake()->company(),
            'customer_id'    => fake()->uuid(),
            'service_type'   => 'customs_clearance',
            'currency'       => 'GHS',
            'exchange_rate'  => 1.0,
            'subtotal'       => $subtotal,
            'tax_amount'     => $taxAmount,
            'total_amount'   => $total,
            'ghs_equivalent' => $total,
            'paid_amount'    => 0,
            'status'         => fake()->randomElement(['draft', 'sent', 'paid', 'overdue']),
            'issue_date'     => fake()->dateTimeBetween('-60 days', 'now'),
            'due_date'       => fake()->dateTimeBetween('now', '+30 days'),
            'created_by'     => 'System',
        ];
    }
}
