<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->getDepartment(), ['accounts', 'finance', 'management', 'super_admin'])
            || $user->isAdmin();
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return in_array($user->getDepartment(), ['accounts', 'finance', 'management', 'super_admin'])
            || $user->isAdmin();
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $this->create($user) && in_array($invoice->status, ['draft', 'sent']);
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->isAdmin() && $invoice->status === 'draft';
    }

    public function approve(User $user, Invoice $invoice): bool
    {
        return in_array($user->getDepartment(), ['management', 'super_admin'])
            || $user->hasRole('manager')
            || $user->isAdmin();
    }
}
