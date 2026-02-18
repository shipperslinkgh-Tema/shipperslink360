<?php

namespace App\Providers;

use App\Models\Profile;
use App\Models\UserRole;
use App\Models\ClientProfile;
use App\Models\FinanceInvoice;
use App\Models\FinanceExpense;
use App\Models\FinanceJobCost;
use App\Models\BankConnection;
use App\Models\BankTransaction;
use App\Models\BankReconciliation;
use App\Models\ClientShipment;
use App\Observers\ProfileObserver;
use App\Observers\UserRoleObserver;
use App\Observers\ClientProfileObserver;
use App\Observers\FinanceInvoiceObserver;
use App\Observers\FinanceExpenseObserver;
use App\Observers\FinanceJobCostObserver;
use App\Observers\BankConnectionObserver;
use App\Observers\BankTransactionObserver;
use App\Observers\BankReconciliationObserver;
use App\Observers\ClientShipmentObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerObservers();
        $this->configureRateLimiters();
    }

    // ── Observer registrations ────────────────────────────────────────────────

    private function registerObservers(): void
    {
        Profile::observe(ProfileObserver::class);
        UserRole::observe(UserRoleObserver::class);
        ClientProfile::observe(ClientProfileObserver::class);
        FinanceInvoice::observe(FinanceInvoiceObserver::class);
        FinanceExpense::observe(FinanceExpenseObserver::class);
        FinanceJobCost::observe(FinanceJobCostObserver::class);
        BankConnection::observe(BankConnectionObserver::class);
        BankTransaction::observe(BankTransactionObserver::class);
        BankReconciliation::observe(BankReconciliationObserver::class);
        ClientShipment::observe(ClientShipmentObserver::class);
    }

    // ── Rate limiter configuration ────────────────────────────────────────────

    private function configureRateLimiters(): void
    {
        // Auth login: 5 attempts per minute per IP
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // AI assistant: 10 requests per minute per user
        RateLimiter::for('ai', function (Request $request) {
            return Limit::perMinute(
                (int) config('app.ai_rate_limit', 10)
            )->by(optional($request->user())->id ?: $request->ip());
        });

        // API general: 120 requests per minute per user/IP
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by(
                optional($request->user())->id ?: $request->ip()
            );
        });
    }
}
