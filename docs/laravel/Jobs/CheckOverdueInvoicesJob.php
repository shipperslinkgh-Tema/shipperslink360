<?php

namespace App\Jobs;

use App\Models\FinanceInvoice;
use App\Models\AppNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Runs daily at 09:00.
 * Scans finance_invoices for overdue records and creates notifications.
 */
class CheckOverdueInvoicesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function handle(): void
    {
        $today = now()->toDateString();

        $overdueInvoices = FinanceInvoice::whereDate('due_date', '<', $today)
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->get();

        if ($overdueInvoices->isEmpty()) {
            Log::info('[CheckOverdueInvoicesJob] No overdue invoices found.');
            return;
        }

        $count = $overdueInvoices->count();

        // Notify accounts department once with a summary
        AppNotification::create([
            'title'                => "Overdue Invoices Alert ({$count} unpaid)",
            'message'              => "{$count} invoice(s) are overdue as of today. Please review and follow up with clients.",
            'type'                 => 'invoice_overdue',
            'category'             => 'finance',
            'priority'             => 'high',
            'recipient_department' => 'accounts',
            'action_url'           => '/finance?tab=invoices&filter=overdue',
            'metadata'             => ['overdue_count' => $count, 'date' => $today],
        ]);

        Log::info("[CheckOverdueInvoicesJob] Notified accounts of {$count} overdue invoice(s).");
    }
}
