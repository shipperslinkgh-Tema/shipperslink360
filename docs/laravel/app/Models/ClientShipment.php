<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClientShipment extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id',
        'bl_number',
        'container_number',
        'vessel_name',
        'voyage_number',
        'origin',
        'destination',
        'cargo_description',
        'weight_kg',
        'status',
        'eta',
        'ata',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'eta'       => 'datetime',
            'ata'       => 'datetime',
            'weight_kg' => 'decimal:2',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invoices()
    {
        return $this->hasMany(ClientInvoice::class, 'shipment_id');
    }

    public function documents()
    {
        return $this->hasMany(ClientDocument::class, 'shipment_id');
    }

    // ── Status transitions ────────────────────────────────────

    public const STATUSES = [
        'pending',
        'in_transit',
        'arrived',
        'customs',
        'cleared',
        'delivered',
    ];

    public function updateStatus(string $status, ?string $notes = null): void
    {
        $this->update(array_filter([
            'status' => $status,
            'notes'  => $notes,
        ]));
    }
}
