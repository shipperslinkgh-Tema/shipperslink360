<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Events\NewChatMessage;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    /**
     * Return recent messages for a channel.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'channel' => ['required', 'string', 'in:' . implode(',', ChatMessage::allowedChannels())],
            'before'  => ['nullable', 'uuid'],
            'limit'   => ['nullable', 'integer', 'min:10', 'max:100'],
        ]);

        $limit    = $request->integer('limit', 50);
        $query    = ChatMessage::channel($request->channel)->latest()->limit($limit);

        if ($request->filled('before')) {
            $pivot = ChatMessage::find($request->before);
            if ($pivot) {
                $query->where('created_at', '<', $pivot->created_at);
            }
        }

        $messages = $query->get()->reverse()->values();

        return response()->json(['data' => $messages]);
    }

    /**
     * Broadcast a new chat message.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'channel'      => ['required', 'string', 'in:' . implode(',', ChatMessage::allowedChannels())],
            'message'      => ['required', 'string', 'max:5000'],
            'message_type' => ['nullable', 'string', 'in:text,file,image'],
            'file_url'     => ['nullable', 'url'],
            'file_name'    => ['nullable', 'string', 'max:255'],
        ]);

        $user    = $request->user();
        $profile = $user->profile;

        $msg = ChatMessage::create([
            'channel'           => $request->channel,
            'sender_id'         => $user->id,
            'sender_name'       => $profile?->full_name ?? $user->email,
            'sender_department' => $profile?->department,
            'message'           => $request->message,
            'message_type'      => $request->input('message_type', 'text'),
            'file_url'          => $request->file_url,
            'file_name'         => $request->file_name,
        ]);

        broadcast(new NewChatMessage($msg))->toOthers();

        return response()->json(['data' => $msg], 201);
    }

    /**
     * Edit own message.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $msg = ChatMessage::findOrFail($id);

        if ((string) $msg->sender_id !== (string) $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate(['message' => ['required', 'string', 'max:5000']]);
        $msg->editMessage($request->message);

        return response()->json(['data' => $msg->fresh()]);
    }

    /**
     * Delete own message (or admin).
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $msg  = ChatMessage::findOrFail($id);
        $user = $request->user();

        if ((string) $msg->sender_id !== (string) $user->id && ! $user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $msg->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
