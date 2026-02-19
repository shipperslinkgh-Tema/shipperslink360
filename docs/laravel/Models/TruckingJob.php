<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TruckingJob extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'job_ref', 'shipment_id', 'truck_id', 'customer_id',
        'origin', 'destination', 'cargo_type', 'weight_tons',
        'status', 'departure_time', 'arrival_time', 'estimated_arrival',
        'driver_name', 'driver_phone', 'rate', 'currency',
        'fuel_cost', 'toll_cost', 'notes',
    ];

    protected $casts = [
        'departure_time'   => 'datetime',
        'arrival_time'     => 'datetime',
        'estimated_arrival'=> 'datetime',
        'weight_tons'      => 'decimal:2',
        'rate'             => 'decimal:2',
        'fuel_cost'        => 'decimal:2',
        'toll_cost'        => 'decimal:2',
    ];

    public function truck()
    {
        return $this->belongsTo(Truck::class);
    }

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function getTotalCostAttribute(): float
    {
        return $this->rate + $this->fuel_cost + $this->toll_cost;
    }
}
