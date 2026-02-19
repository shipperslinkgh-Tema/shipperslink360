<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'customer_code' => 'CUST-' . fake()->unique()->numerify('####'),
            'company_name'  => fake()->company(),
            'contact_name'  => fake()->name(),
            'email'         => fake()->companyEmail(),
            'phone'         => fake()->phoneNumber(),
            'address'       => fake()->streetAddress(),
            'city'          => fake()->randomElement(['Accra', 'Kumasi', 'Tema', 'Takoradi']),
            'country'       => 'Ghana',
            'credit_status' => 'good',
            'credit_limit'  => fake()->randomFloat(2, 5000, 100000),
            'is_active'     => true,
        ];
    }
}
