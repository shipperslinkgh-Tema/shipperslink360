<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Truck extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'registration_number', 'make', 'model', 'year', 'type',
        'payload_capacity_tons', 'status', 'driver_name', 'driver_phone',
        'driver_license', 'insurance_expiry', 'roadworthy_expiry',
        'last_service_date', 'next_service_date', 'notes',
    ];

    protected $casts = [
        'insurance_expiry'   => 'date',
        'roadworthy_expiry'  => 'date',
        'last_service_date'  => 'date',
        'next_service_date'  => 'date',
        'payload_capacity_tons' => 'decimal:2',
    ];

    public function truckingJobs()
    {
        return $this->hasMany(TruckingJob::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeOnTrip($query)
    {
        return $query->where('status', 'on_trip');
    }

    public function needsService(): bool
    {
        return $this->next_service_date && $this->next_service_date->isPast();
    }
}
