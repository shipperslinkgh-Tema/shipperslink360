<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BankTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankTransactionController extends Controller
{
    /**
     * List bank transactions with filters.
     * GET /api/v1/banking/transactions
     */
    public function index(Request $request): JsonResponse
    {
        $query = BankTransaction::query()
            ->when($request->bank_connection_id, fn ($q) => $q->where('bank_connection_id', $request->bank_connection_id))
            ->when($request->match_status, fn ($q) => $q->where('match_status', $request->match_status))
            ->when($request->transaction_type, fn ($q) => $q->where('transaction_type', $request->transaction_type))
            ->when($request->from_date, fn ($q) => $q->whereDate('transaction_date', '>=', $request->from_date))
            ->when($request->to_date, fn ($q) => $q->whereDate('transaction_date', '<=', $request->to_date))
            ->when(isset($request->is_reconciled), fn ($q) => $q->where('is_reconciled', $request->boolean('is_reconciled')))
            ->orderByDesc('transaction_date');

        $transactions = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page'    => $transactions->lastPage(),
                'per_page'     => $transactions->perPage(),
                'total'        => $transactions->total(),
            ],
        ]);
    }

    /**
     * Show a single transaction.
     * GET /api/v1/banking/transactions/{id}
     */
    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => BankTransaction::findOrFail($id)]);
    }

    /**
     * Manually match a transaction to an invoice.
     * POST /api/v1/banking/transactions/{id}/match
     */
    public function match(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'invoice_id' => ['required', 'string'],
            'notes'      => ['nullable', 'string', 'max:500'],
        ]);

        $transaction = BankTransaction::findOrFail($id);

        abort_if($transaction->is_reconciled, 422, 'Reconciled transactions cannot be modified.');

        $transaction->update([
            'match_status'       => 'manual',
            'matched_invoice_id' => $request->invoice_id,
            'match_confidence'   => 100,
            'notes'              => $request->notes,
        ]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'manual_match_transaction',
            resourceType: 'bank_transaction',
            resourceId: $transaction->id,
            details: ['invoice_id' => $request->invoice_id],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $transaction->fresh()]);
    }

    /**
     * Mark a transaction as reconciled.
     * POST /api/v1/banking/transactions/{id}/reconcile
     */
    public function reconcile(string $id): JsonResponse
    {
        $transaction = BankTransaction::findOrFail($id);

        abort_if($transaction->is_reconciled, 422, 'Transaction is already reconciled.');

        $transaction->update([
            'is_reconciled'  => true,
            'reconciled_at'  => now(),
            'reconciled_by'  => auth()->id(),
        ]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'reconcile_transaction',
            resourceType: 'bank_transaction',
            resourceId: $transaction->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $transaction->fresh()]);
    }
}
