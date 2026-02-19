<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipment extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'shipment_ref', 'customer_id', 'type', 'bl_number', 'awb_number',
        'vessel_name', 'voyage_number', 'flight_number', 'container_number',
        'container_type', 'container_count', 'origin_country', 'origin_port',
        'destination_port', 'cargo_description', 'weight_kg', 'volume_cbm',
        'status', 'clearance_status', 'etd', 'eta', 'ata', 'delivery_date',
        'is_consolidated', 'consolidation_lot_id', 'incoterms',
        'assigned_officer', 'notes',
    ];

    protected $casts = [
        'etd'             => 'date',
        'eta'             => 'date',
        'ata'             => 'date',
        'delivery_date'   => 'date',
        'weight_kg'       => 'decimal:2',
        'volume_cbm'      => 'decimal:2',
        'is_consolidated' => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────────

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function icumsDeclarations()
    {
        return $this->hasMany(IcumsDeclaration::class);
    }

    public function deliveryOrders()
    {
        return $this->hasMany(DeliveryOrder::class);
    }

    public function truckingJobs()
    {
        return $this->hasMany(TruckingJob::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function jobCostings()
    {
        return $this->hasMany(JobCosting::class);
    }

    public function consolidationLot()
    {
        return $this->belongsTo(ConsolidationLot::class);
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeSea($query)      { return $query->where('type', 'sea'); }
    public function scopeAir($query)      { return $query->where('type', 'air'); }
    public function scopeRoad($query)     { return $query->where('type', 'road'); }
    public function scopeActive($query)   { return $query->whereNotIn('status', ['delivered', 'cancelled']); }
    public function scopeAtPort($query)   { return $query->where('status', 'at_port'); }
    public function scopeInCustoms($query){ return $query->where('status', 'customs'); }

    // ── Helpers ───────────────────────────────────────────────

    public function isOverdue(): bool
    {
        return $this->eta && $this->eta->isPast() && !in_array($this->status, ['delivered', 'cancelled']);
    }
}
