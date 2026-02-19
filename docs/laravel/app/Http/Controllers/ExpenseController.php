<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use App\Models\AuditLog;
use App\Http\Requests\StoreExpenseRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ExpenseController extends Controller
{
    /**
     * List expenses with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::query();

        $query->when($request->filled('status'), fn($q) => $q->where('status', $request->status));
        $query->when($request->filled('category'), fn($q) => $q->where('category', $request->category));
        $query->when($request->filled('from_date'), fn($q) => $q->where('expense_date', '>=', $request->from_date));
        $query->when($request->filled('to_date'), fn($q) => $q->where('expense_date', '<=', $request->to_date));
        $query->when($request->filled('search'), fn($q) => $q->where('description', 'like', '%' . $request->search . '%')
                                                              ->orWhere('expense_ref', 'like', '%' . $request->search . '%'));

        $expenses = $query->orderByDesc('expense_date')->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => $expenses->items(),
            'meta' => [
                'total'        => $expenses->total(),
                'current_page' => $expenses->currentPage(),
                'last_page'    => $expenses->lastPage(),
            ],
        ]);
    }

    /**
     * Create a new expense.
     */
    public function store(StoreExpenseRequest $request): JsonResponse
    {
        $data                   = $request->validated();
        $data['expense_ref']    = Expense::generateRef();
        $data['ghs_equivalent'] = round($data['amount'] * $data['exchange_rate'], 2);
        $data['requested_by']   = Auth::user()->profile?->full_name ?? Auth::user()->email;
        $data['status']         = 'pending';

        $expense = Expense::create($data);

        AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'create_expense',
            'resource_type' => 'expense',
            'resource_id'   => $expense->id,
            'details'       => ['expense_ref' => $expense->expense_ref, 'amount' => $expense->ghs_equivalent],
        ]);

        return response()->json(['data' => $expense], 201);
    }

    /**
     * Show a single expense.
     */
    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => Expense::findOrFail($id)]);
    }

    /**
     * Approve a pending expense.
     */
    public function approve(string $id): JsonResponse
    {
        $expense = Expense::findOrFail($id);

        if ($expense->status !== 'pending') {
            return response()->json(['message' => 'Only pending expenses can be approved.'], 422);
        }

        $approver = Auth::user()->profile?->full_name ?? Auth::user()->email;
        $expense->approve($approver);

        AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'approve_expense',
            'resource_type' => 'expense',
            'resource_id'   => $expense->id,
            'details'       => ['expense_ref' => $expense->expense_ref],
        ]);

        return response()->json(['data' => $expense->fresh()]);
    }

    /**
     * Reject a pending expense.
     */
    public function reject(string $id): JsonResponse
    {
        $expense = Expense::findOrFail($id);

        if ($expense->status !== 'pending') {
            return response()->json(['message' => 'Only pending expenses can be rejected.'], 422);
        }

        $approver = Auth::user()->profile?->full_name ?? Auth::user()->email;
        $expense->reject($approver);

        AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'reject_expense',
            'resource_type' => 'expense',
            'resource_id'   => $expense->id,
        ]);

        return response()->json(['data' => $expense->fresh()]);
    }

    /**
     * Mark an approved expense as paid.
     */
    public function markPaid(Request $request, string $id): JsonResponse
    {
        $expense = Expense::findOrFail($id);

        if ($expense->status !== 'approved') {
            return response()->json(['message' => 'Only approved expenses can be marked paid.'], 422);
        }

        $request->validate(['paid_date' => ['nullable', 'date']]);
        $expense->markPaid($request->paid_date);

        AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'pay_expense',
            'resource_type' => 'expense',
            'resource_id'   => $expense->id,
        ]);

        return response()->json(['data' => $expense->fresh()]);
    }
}
