<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Banking\StoreReconciliationRequest;
use App\Models\AuditLog;
use App\Models\BankReconciliation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankReconciliationController extends Controller
{
    /**
     * List reconciliations.
     * GET /api/v1/banking/reconciliations
     */
    public function index(Request $request): JsonResponse
    {
        $query = BankReconciliation::query()
            ->when($request->bank_connection_id, fn ($q) => $q->where('bank_connection_id', $request->bank_connection_id))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at');

        $records = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $records->items(),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
                'per_page'     => $records->perPage(),
                'total'        => $records->total(),
            ],
        ]);
    }

    /**
     * Create a new reconciliation period.
     * POST /api/v1/banking/reconciliations
     */
    public function store(StoreReconciliationRequest $request): JsonResponse
    {
        $reconciliation = BankReconciliation::create(array_merge(
            $request->validated(),
            ['status' => 'draft']
        ));

        return response()->json(['data' => $reconciliation], 201);
    }

    /**
     * Show a single reconciliation.
     * GET /api/v1/banking/reconciliations/{id}
     */
    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => BankReconciliation::findOrFail($id)]);
    }

    /**
     * Mark a reconciliation as complete.
     * POST /api/v1/banking/reconciliations/{id}/complete
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $reconciliation = BankReconciliation::findOrFail($id);

        abort_if(
            ! in_array($reconciliation->status, ['draft', 'in_progress']),
            422,
            'Reconciliation cannot be completed from its current status.'
        );

        $reconciliation->update([
            'status'       => 'completed',
            'completed_at' => now(),
            'completed_by' => auth()->id(),
            'notes'        => $request->notes,
        ]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'complete_reconciliation',
            resourceType: 'bank_reconciliation',
            resourceId: $reconciliation->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $reconciliation->fresh()]);
    }

    /**
     * Approve a completed reconciliation (Admin only).
     * POST /api/v1/banking/reconciliations/{id}/approve
     */
    public function approve(string $id): JsonResponse
    {
        $reconciliation = BankReconciliation::findOrFail($id);

        abort_if($reconciliation->status !== 'completed', 422, 'Only completed reconciliations can be approved.');

        $reconciliation->update([
            'status'      => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id(),
        ]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'approve_reconciliation',
            resourceType: 'bank_reconciliation',
            resourceId: $reconciliation->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $reconciliation->fresh()]);
    }
}
