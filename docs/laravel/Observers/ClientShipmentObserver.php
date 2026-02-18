<?php

namespace App\Observers;

use App\Models\ClientShipment;
use App\Models\ClientProfile;
use App\Models\AppNotification;
use App\Mail\ShipmentStatusChangedMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Request;

class ClientShipmentObserver
{
    public function updated(ClientShipment $shipment): void
    {
        $dirty = $shipment->getDirty();

        // ── Status change notification ────────────────────────
        if (isset($dirty['status'])) {
            $previousStatus = $shipment->getOriginal('status');
            $this->notifyClientOfStatusChange($shipment, $previousStatus);
        }
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function notifyClientOfStatusChange(ClientShipment $shipment, string $previousStatus): void
    {
        $clientProfile = ClientProfile::where('customer_id', $shipment->customer_id)
            ->where('is_active', true)
            ->first();

        if (! $clientProfile) {
            return;
        }

        $statusLabels = [
            'pending'    => 'Pending',
            'in_transit' => 'In Transit',
            'arrived'    => 'Arrived at Port',
            'customs'    => 'Under Customs Clearance',
            'cleared'    => 'Customs Cleared',
            'delivered'  => 'Delivered',
        ];

        $newLabel = $statusLabels[$shipment->status] ?? $shipment->status;

        // In-app notification for client
        AppNotification::create([
            'title'          => "Shipment Update — BL #{$shipment->bl_number}",
            'message'        => "Your shipment status has changed to: {$newLabel}.",
            'type'           => 'shipment_status',
            'category'       => 'shipment',
            'priority'       => 'medium',
            'recipient_id'   => $clientProfile->user_id,
            'reference_type' => 'shipment',
            'reference_id'   => $shipment->id,
            'action_url'     => "/client/shipments/{$shipment->id}",
            'metadata'       => [
                'previous_status' => $previousStatus,
                'new_status'      => $shipment->status,
                'bl_number'       => $shipment->bl_number,
            ],
        ]);

        // Email notification
        Mail::to($clientProfile->email)
            ->queue(new ShipmentStatusChangedMail($shipment, $previousStatus, $clientProfile));
    }
}
