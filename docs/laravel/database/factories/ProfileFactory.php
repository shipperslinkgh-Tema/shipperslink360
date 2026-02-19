<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ProfileFactory extends Factory
{
    public function definition(): array
    {
        $departments = ['operations', 'documentation', 'accounts', 'marketing', 'customer_service', 'warehouse', 'management'];
        $roles       = ['staff', 'manager', 'admin'];

        return [
            'full_name'            => fake()->name(),
            'staff_id'             => 'SLAC-' . fake()->unique()->numerify('###'),
            'username'             => fake()->unique()->userName(),
            'email'                => fake()->unique()->safeEmail(),
            'phone'                => fake()->phoneNumber(),
            'department'           => fake()->randomElement($departments),
            'role'                 => fake()->randomElement($roles),
            'is_active'            => true,
            'is_locked'            => false,
            'failed_login_attempts' => 0,
            'must_change_password'  => false,
        ];
    }
}
