<?php

namespace App\Console;

use App\Jobs\CheckOverdueInvoicesJob;
use App\Jobs\EscalateUnpaidInvoicesJob;
use App\Jobs\SendDailyDigestJob;
use App\Jobs\BankAutoSyncJob;
use App\Jobs\CheckRegistrarRenewalJob;
use App\Jobs\SendWeeklyReportJob;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * | Job                         | Schedule                  |
     * |-----------------------------|---------------------------|
     * | SendDailyDigestJob          | Daily @ 08:00             |
     * | CheckOverdueInvoicesJob     | Daily @ 09:00             |
     * | EscalateUnpaidInvoicesJob   | Daily @ 09:30             |
     * | BankAutoSyncJob             | Every 30 min              |
     * | CheckRegistrarRenewalJob    | Weekly (Monday) @ 07:00   |
     * | SendWeeklyReportJob         | Weekly (Friday) @ 17:00   |
     */
    protected function schedule(Schedule $schedule): void
    {
        // ── Daily digest (08:00) ──────────────────────────────
        $schedule->job(new SendDailyDigestJob)
            ->dailyAt('08:00')
            ->name('send-daily-digest')
            ->withoutOverlapping();

        // ── Overdue invoice check (09:00) ─────────────────────
        $schedule->job(new CheckOverdueInvoicesJob)
            ->dailyAt('09:00')
            ->name('check-overdue-invoices')
            ->withoutOverlapping();

        // ── Overdue invoice escalation (09:30) ────────────────
        $schedule->job(new EscalateUnpaidInvoicesJob)
            ->dailyAt('09:30')
            ->name('escalate-unpaid-invoices')
            ->withoutOverlapping();

        // ── Bank auto-sync every 30 minutes ───────────────────
        $schedule->job(new BankAutoSyncJob)
            ->everyThirtyMinutes()
            ->name('bank-auto-sync')
            ->withoutOverlapping(120); // allow 2 min overlap window

        // ── Registrar renewal check (Monday 07:00) ────────────
        $schedule->job(new CheckRegistrarRenewalJob)
            ->weeklyOn(1, '07:00') // 1 = Monday
            ->name('check-registrar-renewal')
            ->withoutOverlapping();

        // ── Weekly finance report (Friday 17:00) ─────────────
        $schedule->job(new SendWeeklyReportJob)
            ->weeklyOn(5, '17:00') // 5 = Friday
            ->name('send-weekly-report')
            ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
