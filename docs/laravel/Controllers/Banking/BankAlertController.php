<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Models\BankAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankAlertController extends Controller
{
    /**
     * List bank alerts.
     * GET /api/v1/banking/alerts
     */
    public function index(Request $request): JsonResponse
    {
        $query = BankAlert::query()
            ->when($request->bank_connection_id, fn ($q) => $q->where('bank_connection_id', $request->bank_connection_id))
            ->when($request->priority, fn ($q) => $q->where('priority', $request->priority))
            ->when(isset($request->is_read), fn ($q) => $q->where('is_read', $request->boolean('is_read')))
            ->when(isset($request->is_dismissed), fn ($q) => $q->where('is_dismissed', $request->boolean('is_dismissed')))
            ->orderByDesc('created_at');

        $alerts = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $alerts->items(),
            'meta' => [
                'current_page' => $alerts->currentPage(),
                'last_page'    => $alerts->lastPage(),
                'per_page'     => $alerts->perPage(),
                'total'        => $alerts->total(),
            ],
        ]);
    }

    /**
     * Mark an alert as read.
     * POST /api/v1/banking/alerts/{id}/read
     */
    public function markRead(string $id): JsonResponse
    {
        $alert = BankAlert::findOrFail($id);

        $alert->update([
            'is_read' => true,
            'read_at' => now(),
            'read_by' => auth()->id(),
        ]);

        return response()->json(['data' => $alert->fresh()]);
    }

    /**
     * Dismiss an alert.
     * POST /api/v1/banking/alerts/{id}/dismiss
     */
    public function dismiss(string $id): JsonResponse
    {
        $alert = BankAlert::findOrFail($id);
        $alert->update(['is_dismissed' => true]);

        return response()->json(['data' => $alert->fresh()]);
    }
}
