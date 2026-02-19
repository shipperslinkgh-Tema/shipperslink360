<?php

namespace App\Events;

use App\Models\BankAlert;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BankAlertCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly BankAlert $alert
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('banking'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'BankAlertCreated';
    }

    public function broadcastWith(): array
    {
        return [
            'id'                 => $this->alert->id,
            'bank_connection_id' => $this->alert->bank_connection_id,
            'alert_type'         => $this->alert->alert_type,
            'title'              => $this->alert->title,
            'message'            => $this->alert->message,
            'priority'           => $this->alert->priority,
            'amount'             => $this->alert->amount,
            'currency'           => $this->alert->currency,
            'created_at'         => $this->alert->created_at->toISOString(),
        ];
    }
}
