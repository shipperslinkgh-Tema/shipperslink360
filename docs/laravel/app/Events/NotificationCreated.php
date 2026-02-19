<?php

namespace App\Events;

use App\Models\AppNotification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly AppNotification $notification
    ) {}

    /**
     * Broadcast to:
     *  - private-user.{user_id}   if notification has a specific recipient
     *  - private-dept.{department} if notification is department-wide
     */
    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->notification->recipient_id) {
            $channels[] = new PrivateChannel("user.{$this->notification->recipient_id}");
        }

        if ($this->notification->recipient_department) {
            $channels[] = new PrivateChannel("dept.{$this->notification->recipient_department}");
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'NotificationCreated';
    }

    public function broadcastWith(): array
    {
        return [
            'id'                   => $this->notification->id,
            'title'                => $this->notification->title,
            'message'              => $this->notification->message,
            'type'                 => $this->notification->type,
            'priority'             => $this->notification->priority,
            'category'             => $this->notification->category,
            'action_url'           => $this->notification->action_url,
            'created_at'           => $this->notification->created_at->toISOString(),
            'recipient_department' => $this->notification->recipient_department,
            'recipient_id'         => $this->notification->recipient_id,
        ];
    }
}
