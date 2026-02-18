<?php

namespace App\Events;

use App\Models\ClientMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ClientMessage $message
    ) {}

    /**
     * Broadcast to both the client channel and the staff user channel.
     * - private-client.{customer_id} → client sees reply from staff
     * - private-user.{user_id}       → assigned staff sees new client message
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel("client.{$this->message->customer_id}"),
        ];

        // Also notify assigned staff if message is from client
        if ($this->message->sender_type === 'client') {
            // Broadcast to customer_service department channel
            $channels[] = new PrivateChannel('dept.customer_service');
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'NewMessage';
    }

    public function broadcastWith(): array
    {
        return [
            'id'          => $this->message->id,
            'customer_id' => $this->message->customer_id,
            'sender_id'   => $this->message->sender_id,
            'sender_type' => $this->message->sender_type,
            'subject'     => $this->message->subject,
            'message'     => $this->message->message,
            'is_read'     => $this->message->is_read,
            'created_at'  => $this->message->created_at->toISOString(),
        ];
    }
}
