<?php

namespace App\Jobs;

use App\Mail\DailyDigestMail;
use App\Models\Profile;
use App\Models\FinanceInvoice;
use App\Models\FinanceExpense;
use App\Models\ClientShipment;
use App\Models\BankAlert;
use App\Models\ClientMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Runs daily at 08:00.
 * Sends a finance/ops summary digest to department heads.
 */
class SendDailyDigestJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function handle(): void
    {
        $today    = now()->toDateString();
        $managers = Profile::whereIn('department', ['management', 'accounts'])
            ->where('is_active', true)
            ->get();

        if ($managers->isEmpty()) {
            Log::info('[SendDailyDigestJob] No managers found to send digest to.');
            return;
        }

        // Compute shared digest data once
        $digestData = [
            'overdueInvoices'  => FinanceInvoice::whereDate('due_date', '<', $today)
                                      ->whereNotIn('status', ['paid', 'cancelled'])->count(),
            'pendingExpenses'  => FinanceExpense::where('status', 'pending')->count(),
            'newShipments'     => ClientShipment::whereDate('created_at', $today)->count(),
            'bankAlerts'       => BankAlert::where('is_dismissed', false)->where('is_read', false)->count(),
            'pendingMessages'  => ClientMessage::where('is_read', false)
                                      ->where('sender_type', 'client')->count(),
            'totalReceivables' => FinanceInvoice::whereNotIn('status', ['paid', 'cancelled'])
                                      ->sum('total_amount'),
            'currency'         => 'GHS',
        ];

        foreach ($managers as $profile) {
            Mail::to($profile->email)
                ->queue(new DailyDigestMail(
                    $profile->full_name,
                    $profile->department,
                    $digestData
                ));
        }

        Log::info("[SendDailyDigestJob] Dispatched digest to {$managers->count()} manager(s).");
    }
}
