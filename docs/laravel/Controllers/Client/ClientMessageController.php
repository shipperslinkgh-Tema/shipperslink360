<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\SendMessageRequest;
use App\Models\ClientMessage;
use App\Models\ClientProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientMessageController extends Controller
{
    /**
     * List messages for the authenticated client.
     * GET /api/v1/client/messages
     */
    public function index(Request $request): JsonResponse
    {
        $customerId = $this->resolveCustomerId($request);

        $messages = ClientMessage::where('customer_id', $customerId)
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 30);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page'    => $messages->lastPage(),
                'per_page'     => $messages->perPage(),
                'total'        => $messages->total(),
            ],
        ]);
    }

    /**
     * Send a message from the client.
     * POST /api/v1/client/messages
     */
    public function store(SendMessageRequest $request): JsonResponse
    {
        $customerId = $this->resolveCustomerId($request);

        $message = ClientMessage::create([
            'customer_id' => $customerId,
            'sender_id'   => $request->user()->id,
            'sender_type' => 'client',   // always 'client' for this endpoint
            'subject'     => $request->subject,
            'message'     => $request->message,
            'is_read'     => false,
        ]);

        // Notification to customer_service department is triggered by model observer

        return response()->json(['data' => $message], 201);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function resolveCustomerId(Request $request): string
    {
        $profile = ClientProfile::where('user_id', $request->user()->id)->firstOrFail();

        return $profile->customer_id;
    }
}
