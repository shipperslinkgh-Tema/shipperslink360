<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientDocument;
use App\Models\ClientProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientDocumentController extends Controller
{
    /**
     * List documents for the authenticated client.
     * GET /api/v1/client/documents
     */
    public function index(Request $request): JsonResponse
    {
        $customerId = $this->resolveCustomerId($request);

        $query = ClientDocument::where('customer_id', $customerId)
            ->when($request->document_type, fn ($q) => $q->where('document_type', $request->document_type))
            ->when($request->shipment_id, fn ($q) => $q->where('shipment_id', $request->shipment_id))
            ->orderByDesc('created_at');

        $documents = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $documents->items(),
            'meta' => [
                'current_page' => $documents->currentPage(),
                'last_page'    => $documents->lastPage(),
                'per_page'     => $documents->perPage(),
                'total'        => $documents->total(),
            ],
        ]);
    }

    /**
     * Generate a temporary signed download URL for a document.
     * Returns a 15-minute expiry URL — never the raw file path.
     * GET /api/v1/client/documents/{id}/download
     */
    public function download(Request $request, string $id): JsonResponse
    {
        $customerId = $this->resolveCustomerId($request);

        $document = ClientDocument::where('id', $id)
            ->where('customer_id', $customerId)
            ->firstOrFail();

        $url = $document->temporaryUrl(15);

        return response()->json(['data' => ['url' => $url, 'expires_in' => 900]]);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function resolveCustomerId(Request $request): string
    {
        $profile = ClientProfile::where('user_id', $request->user()->id)->firstOrFail();

        return $profile->customer_id;
    }
}
