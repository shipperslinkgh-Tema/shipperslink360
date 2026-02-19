<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeliveryOrder extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'do_number', 'shipment_id', 'shipping_line_id', 'customer_id',
        'container_number', 'bl_number', 'do_date', 'expiry_date',
        'free_days_end', 'free_days_used', 'demurrage_accruing',
        'demurrage_amount', 'currency', 'status', 'obtained_via',
        'obtained_date', 'notes',
    ];

    protected $casts = [
        'do_date'            => 'date',
        'expiry_date'        => 'date',
        'free_days_end'      => 'date',
        'obtained_date'      => 'date',
        'demurrage_accruing' => 'boolean',
        'demurrage_amount'   => 'decimal:2',
    ];

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function shippingLine()
    {
        return $this->belongsTo(ShippingLine::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopeExpiringSoon($query, int $days = 7)
    {
        return $query->where('expiry_date', '<=', now()->addDays($days))
                     ->where('status', '!=', 'used');
    }

    public function scopeAccruingDemurrage($query)
    {
        return $query->where('demurrage_accruing', true);
    }
}
