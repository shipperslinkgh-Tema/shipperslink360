<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ConsolidationLot extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'lot_ref', 'type', 'origin_country', 'origin_port', 'destination_port',
        'vessel_name', 'voyage_number', 'master_bl', 'container_number',
        'container_type', 'etd', 'eta', 'ata', 'total_weight_kg',
        'total_volume_cbm', 'shipper_count', 'status', 'assigned_officer', 'notes',
    ];

    protected $casts = [
        'etd'             => 'date',
        'eta'             => 'date',
        'ata'             => 'date',
        'total_weight_kg' => 'decimal:2',
        'total_volume_cbm'=> 'decimal:2',
    ];

    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeLcl($query)
    {
        return $query->where('type', 'lcl_sea');
    }

    public function scopeAir($query)
    {
        return $query->where('type', 'lcl_air');
    }
}
