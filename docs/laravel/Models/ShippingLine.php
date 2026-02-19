<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingLine extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'code', 'name', 'contact_name', 'contact_email', 'contact_phone',
        'website', 'odex_portal_url', 'is_active', 'standard_free_days',
        'demurrage_rate_per_day', 'currency', 'notes',
    ];

    protected $casts = [
        'is_active'              => 'boolean',
        'demurrage_rate_per_day' => 'decimal:2',
        'standard_free_days'     => 'integer',
    ];

    public function deliveryOrders()
    {
        return $this->hasMany(DeliveryOrder::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
