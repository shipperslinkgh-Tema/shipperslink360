<?php

namespace App\Jobs;

use App\Mail\WeeklyReportMail;
use App\Models\Profile;
use App\Models\FinanceInvoice;
use App\Models\FinanceExpense;
use App\Models\BankReconciliation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Runs weekly on Friday.
 * Compiles and emails a finance summary to management.
 */
class SendWeeklyReportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function handle(): void
    {
        $startOfWeek = now()->startOfWeek()->toDateString();
        $endOfWeek   = now()->endOfWeek()->toDateString();

        $invoicesThisWeek = FinanceInvoice::whereBetween('issue_date', [$startOfWeek, $endOfWeek]);

        $expensesThisWeek = FinanceExpense::whereBetween('expense_date', [$startOfWeek, $endOfWeek]);

        $topExpenseCategory = FinanceExpense::whereBetween('expense_date', [$startOfWeek, $endOfWeek])
            ->selectRaw('category, SUM(ghs_equivalent) as total')
            ->groupBy('category')
            ->orderByDesc('total')
            ->value('category');

        $reportData = [
            'totalRevenue'        => (clone $invoicesThisWeek)->where('status', 'paid')->sum('ghs_equivalent'),
            'totalExpenses'       => (clone $expensesThisWeek)->where('status', 'paid')->sum('ghs_equivalent'),
            'netProfit'           => 0, // computed below
            'invoicesIssued'      => (clone $invoicesThisWeek)->count(),
            'invoicesPaid'        => (clone $invoicesThisWeek)->where('status', 'paid')->count(),
            'invoicesOverdue'     => FinanceInvoice::whereDate('due_date', '<', now()->toDateString())
                                         ->whereNotIn('status', ['paid', 'cancelled'])->count(),
            'expensesApproved'    => (clone $expensesThisWeek)->where('status', 'approved')->count(),
            'expensesPending'     => FinanceExpense::where('status', 'pending')->count(),
            'bankReconciled'      => BankReconciliation::whereBetween('period_end', [$startOfWeek, $endOfWeek])
                                         ->where('status', 'approved')->exists(),
            'topExpenseCategory'  => $topExpenseCategory ?? 'N/A',
            'weekStart'           => $startOfWeek,
            'weekEnd'             => $endOfWeek,
        ];

        $reportData['netProfit'] = $reportData['totalRevenue'] - $reportData['totalExpenses'];

        $managers = Profile::whereIn('department', ['management', 'super_admin'])
            ->where('is_active', true)
            ->get();

        foreach ($managers as $profile) {
            Mail::to($profile->email)
                ->queue(new WeeklyReportMail($profile->full_name, $reportData));
        }

        Log::info("[SendWeeklyReportJob] Sent weekly report to {$managers->count()} manager(s).");
    }
}
