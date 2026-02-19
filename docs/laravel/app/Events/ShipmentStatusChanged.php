<?php

namespace App\Events;

use App\Models\ClientShipment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShipmentStatusChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly ClientShipment $shipment,
        public readonly string         $previousStatus
    ) {}

    /**
     * Broadcast on private-client.{customer_id}
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("client.{$this->shipment->customer_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ShipmentStatusChanged';
    }

    public function broadcastWith(): array
    {
        return [
            'id'               => $this->shipment->id,
            'bl_number'        => $this->shipment->bl_number,
            'container_number' => $this->shipment->container_number,
            'status'           => $this->shipment->status,
            'previous_status'  => $this->previousStatus,
            'origin'           => $this->shipment->origin,
            'destination'      => $this->shipment->destination,
            'eta'              => $this->shipment->eta,
            'updated_at'       => $this->shipment->updated_at->toISOString(),
        ];
    }
}
