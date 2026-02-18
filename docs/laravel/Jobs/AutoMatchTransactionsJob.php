<?php

namespace App\Jobs;

use App\Models\BankTransaction;
use App\Models\FinanceInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Runs after each BankAutoSyncJob.
 * Attempts to auto-match unmatched credit transactions to unpaid invoices.
 *
 * Matching algorithm:
 *  1. Score based on: amount match (50pts), reference match (30pts), date proximity (20pts).
 *  2. Confidence >= 80  → status = 'matched'
 *  3. Confidence 40–79  → status = 'partial'
 *  4. Confidence < 40   → remain 'unmatched'
 */
class AutoMatchTransactionsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 180;

    public function handle(): void
    {
        $unmatched = BankTransaction::where('match_status', 'unmatched')
            ->where('transaction_type', 'credit')
            ->where('is_reconciled', false)
            ->get();

        $unpaidInvoices = FinanceInvoice::whereNotIn('status', ['paid', 'cancelled'])
            ->get()
            ->keyBy('id');

        $matched = 0;
        $partial = 0;

        foreach ($unmatched as $transaction) {
            $bestScore   = 0;
            $bestInvoice = null;

            foreach ($unpaidInvoices as $invoice) {
                $score = $this->calculateMatchScore($transaction, $invoice);
                if ($score > $bestScore) {
                    $bestScore   = $score;
                    $bestInvoice = $invoice;
                }
            }

            if ($bestScore >= 80 && $bestInvoice) {
                $transaction->update([
                    'match_status'       => 'matched',
                    'matched_invoice_id' => $bestInvoice->id,
                    'match_confidence'   => $bestScore,
                ]);
                $matched++;
            } elseif ($bestScore >= 40 && $bestInvoice) {
                $transaction->update([
                    'match_status'       => 'partial',
                    'matched_invoice_id' => $bestInvoice->id,
                    'match_confidence'   => $bestScore,
                ]);
                $partial++;
            }
        }

        Log::info("[AutoMatchTransactionsJob] Matched: {$matched}, Partial: {$partial} of {$unmatched->count()} transactions.");
    }

    private function calculateMatchScore(BankTransaction $transaction, FinanceInvoice $invoice): int
    {
        $score = 0;

        // Amount match (50 points)
        $outstanding = $invoice->total_amount - $invoice->paid_amount;
        if (abs($transaction->amount - $outstanding) < 0.01) {
            $score += 50;
        } elseif (abs($transaction->amount - $outstanding) / max($outstanding, 1) < 0.05) {
            $score += 30; // within 5%
        }

        // Reference number in description (30 points)
        $description = strtolower($transaction->description ?? '');
        $invoiceNum  = strtolower($invoice->invoice_number);
        if (str_contains($description, $invoiceNum)) {
            $score += 30;
        } elseif ($invoice->job_ref && str_contains($description, strtolower($invoice->job_ref))) {
            $score += 20;
        }

        // Date proximity (20 points)
        $daysDiff = abs(
            \Carbon\Carbon::parse($transaction->transaction_date)
                ->diffInDays(\Carbon\Carbon::parse($invoice->due_date))
        );
        if ($daysDiff <= 3) {
            $score += 20;
        } elseif ($daysDiff <= 7) {
            $score += 10;
        } elseif ($daysDiff <= 30) {
            $score += 5;
        }

        return min($score, 100);
    }
}
