<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\ClientProfile;
use App\Models\ClientShipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientShipmentController extends Controller
{
    /**
     * List shipments for the authenticated client.
     * GET /api/v1/client/shipments
     *
     * customer_id is always resolved server-side — never trusted from the request.
     */
    public function index(Request $request): JsonResponse
    {
        $customerId = $this->resolveCustomerId($request);

        $query = ClientShipment::where('customer_id', $customerId)
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->search, fn ($q) => $q->where(function ($q) use ($request) {
                $q->where('bl_number', 'like', "%{$request->search}%")
                  ->orWhere('container_number', 'like', "%{$request->search}%");
            }))
            ->orderByDesc('created_at');

        $shipments = $query->paginate($request->per_page ?? 20);

        return response()->json([
            'data' => $shipments->items(),
            'meta' => [
                'current_page' => $shipments->currentPage(),
                'last_page'    => $shipments->lastPage(),
                'per_page'     => $shipments->perPage(),
                'total'        => $shipments->total(),
            ],
        ]);
    }

    /**
     * Show a single shipment — must belong to the client.
     * GET /api/v1/client/shipments/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $customerId = $this->resolveCustomerId($request);

        $shipment = ClientShipment::where('id', $id)
            ->where('customer_id', $customerId)
            ->firstOrFail();

        return response()->json(['data' => $shipment]);
    }

    // ── Private helpers ───────────────────────────────────────────

    /**
     * Resolve customer_id from the authenticated user's client profile.
     * This is the ONLY acceptable source — never from request body.
     */
    private function resolveCustomerId(Request $request): string
    {
        $profile = ClientProfile::where('user_id', $request->user()->id)->firstOrFail();

        return $profile->customer_id;
    }
}
