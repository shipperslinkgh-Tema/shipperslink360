<?php

namespace App\Observers;

use App\Models\AuditLog;
use App\Models\Shipment;

class ShipmentObserver
{
    public function creating(Shipment $shipment): void
    {
        if (empty($shipment->shipment_ref)) {
            $year   = date('Y');
            $prefix = match ($shipment->shipment_type ?? 'fcl_sea') {
                'fcl_sea', 'lcl_sea' => 'SEA',
                'air'                => 'AIR',
                'road'               => 'RD',
                default              => 'SHP',
            };
            $count              = Shipment::whereYear('created_at', $year)->count() + 1;
            $shipment->shipment_ref = sprintf('%s-%s-%04d', $prefix, $year, $count);
        }
    }

    public function created(Shipment $shipment): void
    {
        AuditLog::record('shipment_created', 'shipment', $shipment->id, [
            'ref'    => $shipment->shipment_ref,
            'type'   => $shipment->shipment_type,
            'status' => $shipment->status,
        ]);
    }

    public function updated(Shipment $shipment): void
    {
        $dirty = $shipment->getDirty();
        if (isset($dirty['status'])) {
            AuditLog::record('shipment_status_changed', 'shipment', $shipment->id, [
                'from' => $shipment->getOriginal('status'),
                'to'   => $dirty['status'],
            ]);
        }

        if (count($dirty) > 0) {
            AuditLog::record('shipment_updated', 'shipment', $shipment->id, $dirty);
        }
    }

    public function deleted(Shipment $shipment): void
    {
        AuditLog::record('shipment_deleted', 'shipment', $shipment->id, [
            'ref' => $shipment->shipment_ref,
        ]);
    }
}
