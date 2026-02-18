<?php

namespace App\Mail;

use App\Models\ClientShipment;
use App\Models\ClientProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ShipmentStatusChangedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly ClientShipment $shipment,
        public readonly string $previousStatus,
        public readonly ClientProfile $clientProfile
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Shipment Update — BL #{$this->shipment->bl_number}",
        );
    }

    public function content(): Content
    {
        $statusLabels = [
            'pending'    => 'Pending',
            'in_transit' => 'In Transit',
            'arrived'    => 'Arrived at Port',
            'customs'    => 'Under Customs Clearance',
            'cleared'    => 'Customs Cleared',
            'delivered'  => 'Delivered',
        ];

        return new Content(
            view: 'emails.shipment-status-changed',
            with: [
                'shipment'         => $this->shipment,
                'clientProfile'    => $this->clientProfile,
                'previousStatus'   => $statusLabels[$this->previousStatus] ?? $this->previousStatus,
                'newStatus'        => $statusLabels[$this->shipment->status] ?? $this->shipment->status,
                'blNumber'         => $this->shipment->bl_number,
                'containerNumber'  => $this->shipment->container_number,
                'origin'           => $this->shipment->origin,
                'destination'      => $this->shipment->destination,
                'eta'              => $this->shipment->eta,
                'contactName'      => $this->clientProfile->contact_name,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
