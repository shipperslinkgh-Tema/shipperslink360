<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreExpenseRequest;
use App\Models\AuditLog;
use App\Models\FinanceExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * List expenses with filters.
     * GET /api/v1/finance/expenses
     */
    public function index(Request $request): JsonResponse
    {
        $query = FinanceExpense::query()
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->category, fn ($q) => $q->where('category', $request->category))
            ->when($request->from_date, fn ($q) => $q->whereDate('expense_date', '>=', $request->from_date))
            ->when($request->to_date, fn ($q) => $q->whereDate('expense_date', '<=', $request->to_date))
            ->orderByDesc('expense_date');

        $expenses = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $expenses->items(),
            'meta' => [
                'current_page' => $expenses->currentPage(),
                'last_page'    => $expenses->lastPage(),
                'per_page'     => $expenses->perPage(),
                'total'        => $expenses->total(),
            ],
        ]);
    }

    /**
     * Submit a new expense.
     * POST /api/v1/finance/expenses
     */
    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $data = $request->validated();

        $data['expense_ref']    = $this->generateExpenseRef();
        $data['ghs_equivalent'] = $data['amount'] * ($data['exchange_rate'] ?? 1);
        $data['requested_by']   = auth()->user()->profile?->full_name ?? auth()->user()->name;
        $data['status']         = 'pending';

        $expense = FinanceExpense::create($data);

        AuditLog::log(
            userId: auth()->id(),
            action: 'create_expense',
            resourceType: 'expense',
            resourceId: $expense->id,
            details: ['expense_ref' => $expense->expense_ref, 'amount' => $expense->amount],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $expense], 201);
    }

    /**
     * Show a single expense.
     * GET /api/v1/finance/expenses/{id}
     */
    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => FinanceExpense::findOrFail($id)]);
    }

    /**
     * Approve an expense. Manager/Admin only.
     * POST /api/v1/finance/expenses/{id}/approve
     */
    public function approve(string $id): JsonResponse
    {
        $expense = FinanceExpense::findOrFail($id);

        abort_if($expense->status !== 'pending', 422, 'Only pending expenses can be approved.');

        $expense->approve(auth()->id());

        AuditLog::log(
            userId: auth()->id(),
            action: 'approve_expense',
            resourceType: 'expense',
            resourceId: $expense->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $expense->fresh()]);
    }

    /**
     * Reject an expense. Manager/Admin only.
     * POST /api/v1/finance/expenses/{id}/reject
     */
    public function reject(string $id): JsonResponse
    {
        $expense = FinanceExpense::findOrFail($id);

        abort_if($expense->status !== 'pending', 422, 'Only pending expenses can be rejected.');

        $expense->update(['status' => 'rejected']);

        AuditLog::log(
            userId: auth()->id(),
            action: 'reject_expense',
            resourceType: 'expense',
            resourceId: $expense->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $expense->fresh()]);
    }

    /**
     * Mark an approved expense as paid.
     * POST /api/v1/finance/expenses/{id}/pay
     */
    public function markPaid(Request $request, string $id): JsonResponse
    {
        $expense = FinanceExpense::findOrFail($id);

        abort_if($expense->status !== 'approved', 422, 'Expense must be approved before marking as paid.');

        $expense->update([
            'status'    => 'paid',
            'paid_date' => $request->input('paid_date', now()->toDateString()),
        ]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'pay_expense',
            resourceType: 'expense',
            resourceId: $expense->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $expense->fresh()]);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function generateExpenseRef(): string
    {
        $year  = now()->year;
        $count = FinanceExpense::whereYear('created_at', $year)->count();

        return sprintf('EXP-%d-%06d', $year, $count + 1);
    }
}
