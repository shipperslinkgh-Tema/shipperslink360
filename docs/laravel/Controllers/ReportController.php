<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\FinanceExpense;
use App\Models\FinanceInvoice;
use App\Models\FinanceJobCost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Finance summary report.
     * GET /api/v1/reports/finance-summary
     *
     * Access: accounts, management, admin, super_admin
     */
    public function financeSummary(Request $request): JsonResponse
    {
        $from = $request->input('from_date', now()->startOfMonth()->toDateString());
        $to   = $request->input('to_date', now()->toDateString());

        $invoices = FinanceInvoice::whereBetween('issue_date', [$from, $to]);
        $expenses = FinanceExpense::whereBetween('expense_date', [$from, $to]);
        $jobCosts = FinanceJobCost::whereBetween('created_at', [$from, $to]);

        $totalRevenue    = (clone $invoices)->where('status', 'paid')->sum('ghs_equivalent');
        $outstandingRevenue = (clone $invoices)->whereNotIn('status', ['paid', 'cancelled'])->sum('ghs_equivalent');
        $overdueRevenue  = (clone $invoices)->where('status', '!=', 'paid')
                                            ->where('due_date', '<', now())->sum('ghs_equivalent');
        $totalExpenses   = (clone $expenses)->where('status', 'paid')->sum('ghs_equivalent');
        $pendingExpenses = (clone $expenses)->where('status', 'pending')->sum('ghs_equivalent');
        $totalJobCosts   = (clone $jobCosts)->where('payment_status', 'paid')->sum('ghs_equivalent');

        $invoicesByStatus = (clone $invoices)
            ->selectRaw('status, COUNT(*) as count, SUM(ghs_equivalent) as total')
            ->groupBy('status')
            ->get();

        $expensesByCategory = (clone $expenses)
            ->selectRaw('category, COUNT(*) as count, SUM(ghs_equivalent) as total')
            ->groupBy('category')
            ->get();

        return response()->json([
            'data' => [
                'period'              => ['from' => $from, 'to' => $to],
                'revenue' => [
                    'total_collected'  => $totalRevenue,
                    'outstanding'      => $outstandingRevenue,
                    'overdue'          => $overdueRevenue,
                ],
                'expenses' => [
                    'total_paid'       => $totalExpenses,
                    'pending_approval' => $pendingExpenses,
                    'total_job_costs'  => $totalJobCosts,
                ],
                'net_profit'          => $totalRevenue - $totalExpenses - $totalJobCosts,
                'invoices_by_status'  => $invoicesByStatus,
                'expenses_by_category' => $expensesByCategory,
            ],
        ]);
    }

    /**
     * Audit log report (admin/super_admin only).
     * GET /api/v1/reports/audit-logs
     */
    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::query()
            ->when($request->user_id, fn ($q) => $q->where('user_id', $request->user_id))
            ->when($request->resource_type, fn ($q) => $q->where('resource_type', $request->resource_type))
            ->when($request->action, fn ($q) => $q->where('action', 'like', "%{$request->action}%"))
            ->when($request->from_date, fn ($q) => $q->whereDate('created_at', '>=', $request->from_date))
            ->when($request->to_date, fn ($q) => $q->whereDate('created_at', '<=', $request->to_date))
            ->orderByDesc('created_at');

        $logs = $query->paginate($request->per_page ?? 50);

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
                'per_page'     => $logs->perPage(),
                'total'        => $logs->total(),
            ],
        ]);
    }
}
