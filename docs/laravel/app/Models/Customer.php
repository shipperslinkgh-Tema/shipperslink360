<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'customer_code', 'company_name', 'contact_name', 'email', 'phone',
        'alt_phone', 'address', 'city', 'country', 'tin_number', 'industry',
        'credit_status', 'credit_limit', 'is_active', 'assigned_officer', 'notes',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'is_active'    => 'boolean',
    ];

    // ── Relationships ─────────────────────────────────────────

    public function documents()
    {
        return $this->hasMany(CustomerDocument::class);
    }

    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function jobCostings()
    {
        return $this->hasMany(JobCosting::class);
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOnHold($query)
    {
        return $query->whereIn('credit_status', ['hold', 'suspend']);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function getOutstandingBalanceAttribute(): float
    {
        return $this->invoices()
            ->whereIn('status', ['sent', 'partially_paid', 'overdue'])
            ->sum('total_amount')
            - $this->invoices()->whereIn('status', ['sent', 'partially_paid', 'overdue'])->sum('paid_amount');
    }
}
