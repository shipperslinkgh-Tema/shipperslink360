<?php

namespace App\Http\Controllers\Banking;

use App\Http\Controllers\Controller;
use App\Http\Requests\Banking\StoreBankConnectionRequest;
use App\Http\Requests\Banking\UpdateBankConnectionRequest;
use App\Models\AuditLog;
use App\Models\BankConnection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BankConnectionController extends Controller
{
    /**
     * List all bank connections.
     * GET /api/v1/banking/connections
     */
    public function index(Request $request): JsonResponse
    {
        $connections = BankConnection::query()
            ->when(isset($request->is_active), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('bank_display_name')
            ->get();

        return response()->json(['data' => $connections]);
    }

    /**
     * Add a new bank connection.
     * POST /api/v1/banking/connections
     */
    public function store(StoreBankConnectionRequest $request): JsonResponse
    {
        $connection = BankConnection::create($request->validated());

        AuditLog::log(
            userId: auth()->id(),
            action: 'add_bank_connection',
            resourceType: 'bank_connection',
            resourceId: $connection->id,
            details: ['bank_name' => $connection->bank_name, 'account_number' => $connection->account_number],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $connection], 201);
    }

    /**
     * Show a single bank connection.
     * GET /api/v1/banking/connections/{id}
     */
    public function show(string $id): JsonResponse
    {
        return response()->json(['data' => BankConnection::findOrFail($id)]);
    }

    /**
     * Update a bank connection.
     * PUT /api/v1/banking/connections/{id}
     */
    public function update(UpdateBankConnectionRequest $request, string $id): JsonResponse
    {
        $connection = BankConnection::findOrFail($id);
        $connection->update($request->validated());

        AuditLog::log(
            userId: auth()->id(),
            action: 'edit_bank_connection',
            resourceType: 'bank_connection',
            resourceId: $connection->id,
            details: $request->validated(),
            ipAddress: request()->ip()
        );

        return response()->json(['data' => $connection->fresh()]);
    }

    /**
     * Deactivate a bank connection.
     * POST /api/v1/banking/connections/{id}/deactivate
     */
    public function deactivate(string $id): JsonResponse
    {
        $connection = BankConnection::findOrFail($id);
        $connection->update(['is_active' => false]);

        AuditLog::log(
            userId: auth()->id(),
            action: 'deactivate_bank_connection',
            resourceType: 'bank_connection',
            resourceId: $connection->id,
            details: [],
            ipAddress: request()->ip()
        );

        return response()->json(['data' => ['message' => 'Bank connection deactivated.']]);
    }

    /**
     * Trigger a manual sync for a connection.
     * POST /api/v1/banking/connections/{id}/sync
     */
    public function sync(string $id): JsonResponse
    {
        $connection = BankConnection::findOrFail($id);

        abort_if(! $connection->is_active, 422, 'Cannot sync an inactive connection.');

        // Dispatch the sync job
        \App\Jobs\BankSyncJob::dispatch($connection);

        return response()->json(['data' => ['message' => 'Sync queued successfully.']]);
    }
}
