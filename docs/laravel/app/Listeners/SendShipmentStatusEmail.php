<?php

namespace App\Listeners;

use App\Events\ShipmentStatusChanged;
use App\Mail\ShipmentStatusChangedMail;
use App\Models\ClientProfile;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendShipmentStatusEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public int $tries = 3;

    public function handle(ShipmentStatusChanged $event): void
    {
        $clientProfile = ClientProfile::where('customer_id', $event->shipment->customer_id)
            ->where('is_active', true)
            ->first();

        if (! $clientProfile) {
            Log::warning("[SendShipmentStatusEmail] No active client profile for customer_id {$event->shipment->customer_id}");
            return;
        }

        Mail::to($clientProfile->email)
            ->send(new ShipmentStatusChangedMail(
                $event->shipment,
                $event->previousStatus,
                $clientProfile
            ));

        Log::info("[SendShipmentStatusEmail] Email sent to {$clientProfile->email} for shipment {$event->shipment->id}");
    }
}
