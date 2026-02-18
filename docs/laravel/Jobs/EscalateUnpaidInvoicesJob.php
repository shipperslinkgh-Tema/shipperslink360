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
 * Runs daily at 09:30.
 * Escalates invoices overdue by 7+ days to management department.
 */
class EscalateUnpaidInvoicesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function handle(): void
    {
        $escalationDate = now()->subDays(7)->toDateString();

        $criticalInvoices = FinanceInvoice::whereDate('due_date', '<=', $escalationDate)
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->get();

        if ($criticalInvoices->isEmpty()) {
            Log::info('[EscalateUnpaidInvoicesJob] No critical overdue invoices.');
            return;
        }

        $count       = $criticalInvoices->count();
        $totalAmount = $criticalInvoices->sum('total_amount');

        AppNotification::create([
            'title'                => "⚠️ Escalation: {$count} Invoices Overdue 7+ Days",
            'message'              => "{$count} invoice(s) have been unpaid for more than 7 days. " .
                                     "Total outstanding: GHS " . number_format($totalAmount, 2) .
                                     ". Immediate management review required.",
            'type'                 => 'invoice_overdue_escalation',
            'category'             => 'finance',
            'priority'             => 'high',
            'recipient_department' => 'management',
            'action_url'           => '/finance?tab=invoices&filter=overdue',
            'metadata'             => [
                'critical_count'   => $count,
                'total_outstanding'=> $totalAmount,
                'escalation_date'  => $escalationDate,
            ],
        ]);

        Log::info("[EscalateUnpaidInvoicesJob] Escalated {$count} invoice(s) to management.");
    }
}
