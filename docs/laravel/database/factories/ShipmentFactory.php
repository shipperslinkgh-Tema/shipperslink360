<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ShipmentFactory extends Factory
{
    public function definition(): array
    {
        $types = ['fcl_sea', 'lcl_sea', 'air', 'road'];
        $statuses = ['booked', 'in_transit', 'at_port', 'customs', 'released', 'delivered'];

        return [
            'shipment_ref'      => 'SHP-' . date('Y') . '-' . fake()->unique()->numerify('####'),
            'type'              => fake()->randomElement($types),
            'bl_number'         => 'BL' . fake()->numerify('##########'),
            'origin_country'    => fake()->country(),
            'origin_port'       => fake()->city(),
            'destination_port'  => 'Tema',
            'cargo_description' => fake()->sentence(),
            'weight_kg'         => fake()->randomFloat(2, 100, 20000),
            'status'            => fake()->randomElement($statuses),
            'eta'               => fake()->dateTimeBetween('now', '+60 days'),
        ];
    }
}
