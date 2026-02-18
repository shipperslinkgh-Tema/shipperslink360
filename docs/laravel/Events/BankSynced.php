<?php

namespace App\Events;

use App\Models\BankConnection;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BankSynced implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly BankConnection $connection
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('banking'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'BankSynced';
    }

    public function broadcastWith(): array
    {
        return [
            'id'                => $this->connection->id,
            'bank_display_name' => $this->connection->bank_display_name,
            'account_name'      => $this->connection->account_name,
            'balance'           => $this->connection->balance,
            'available_balance' => $this->connection->available_balance,
            'currency'          => $this->connection->currency,
            'sync_status'       => $this->connection->sync_status,
            'last_sync_at'      => $this->connection->last_sync_at?->toISOString(),
        ];
    }
}
