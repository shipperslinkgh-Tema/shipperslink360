<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientInvoice;
use App\Models\ClientProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientInvoiceController extends Controller
{
    /**
     * List invoices for the authenticated client (read-only).
     * GET /api/v1/client/invoices
     */
    public function index(Request $request): JsonResponse
    {
        $customerId = $this->resolveCustomerId($request);

        $query = ClientInvoice::where('customer_id', $customerId)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at');

        $invoices = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $invoices->items(),
            'meta' => [
                'current_page' => $invoices->currentPage(),
                'last_page'    => $invoices->lastPage(),
                'per_page'     => $invoices->perPage(),
                'total'        => $invoices->total(),
            ],
        ]);
    }

    /**
     * Show a single invoice — must belong to the client.
     * GET /api/v1/client/invoices/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $customerId = $this->resolveCustomerId($request);

        $invoice = ClientInvoice::where('id', $id)
            ->where('customer_id', $customerId)
            ->firstOrFail();

        return response()->json(['data' => $invoice]);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function resolveCustomerId(Request $request): string
    {
        $profile = ClientProfile::where('user_id', $request->user()->id)->firstOrFail();

        return $profile->customer_id;
    }
}
