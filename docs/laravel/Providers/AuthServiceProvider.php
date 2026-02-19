<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

// Models & Policies
use App\Models\Shipment;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Expense;
use App\Models\Customer;
use App\Models\User;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     * Add Policy classes as you build them out.
     */
    protected $policies = [
        // Shipment::class => ShipmentPolicy::class,
        // Invoice::class  => InvoicePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // ── Super admin gate ─────────────────────────────────────────────────
        // Super admins bypass all policy checks.
        Gate::before(function (User $user) {
            if ($user->isSuperAdmin()) {
                return true;
            }
        });

        // ── Admin gate ───────────────────────────────────────────────────────
        Gate::define('admin', fn (User $user) => $user->isAdmin());

        // ── Finance gates ────────────────────────────────────────────────────
        Gate::define('view-finance', function (User $user) {
            return in_array($user->getDepartment(), ['accounts', 'management', 'super_admin'])
                || $user->isAdmin();
        });

        Gate::define('approve-invoice', function (User $user) {
            return in_array($user->getDepartment(), ['accounts', 'management', 'super_admin'])
                || $user->hasRole('manager')
                || $user->isAdmin();
        });

        Gate::define('approve-expense', function (User $user) {
            return $user->hasRole('manager') || $user->isAdmin();
        });

        // ── Shipment gates ───────────────────────────────────────────────────
        Gate::define('create-shipment', function (User $user) {
            return in_array($user->getDepartment(), ['operations', 'documentation', 'management', 'super_admin'])
                || $user->isAdmin();
        });

        // ── User management gates ────────────────────────────────────────────
        Gate::define('manage-users', fn (User $user) => $user->isAdmin());
    }
}
