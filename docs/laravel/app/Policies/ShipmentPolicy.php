<?php

namespace App\Policies;

use App\Models\Shipment;
use App\Models\User;

class ShipmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Shipment $shipment): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return in_array($user->getDepartment(), ['operations', 'documentation', 'management', 'super_admin'])
            || $user->isAdmin();
    }

    public function update(User $user, Shipment $shipment): bool
    {
        return in_array($user->getDepartment(), ['operations', 'documentation', 'management', 'super_admin'])
            || $user->isAdmin();
    }

    public function delete(User $user, Shipment $shipment): bool
    {
        return $user->isAdmin();
    }
}
