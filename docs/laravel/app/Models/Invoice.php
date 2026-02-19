<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'invoice_number', 'invoice_type', 'customer_id', 'shipment_id',
        'job_ref', 'consolidation_ref', 'description', 'service_type',
        'subtotal', 'tax_amount', 'total_amount', 'currency', 'exchange_rate',
        'ghs_equivalent', 'status', 'issue_date', 'due_date', 'paid_date',
        'paid_amount', 'payment_method', 'notes', 'created_by',
        'approved_by', 'approval_date',
    ];

    protected $casts = [
        'subtotal'      => 'decimal:2',
        'tax_amount'    => 'decimal:2',
        'total_amount'  => 'decimal:2',
        'ghs_equivalent'=> 'decimal:2',
        'exchange_rate' => 'decimal:4',
        'paid_amount'   => 'decimal:2',
        'issue_date'    => 'date',
        'due_date'      => 'date',
        'paid_date'     => 'date',
        'approval_date' => 'date',
    ];

    // ── Relationships ─────────────────────────────────────────

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function shipment()
    {
        return $this->belongsTo(Shipment::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now())
                     ->whereNotIn('status', ['paid', 'cancelled']);
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeOutstanding($query)
    {
        return $query->whereIn('status', ['sent', 'partially_paid', 'overdue']);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function getOutstandingAmountAttribute(): float
    {
        return $this->total_amount - $this->paid_amount;
    }

    public function isOverdue(): bool
    {
        return $this->due_date->isPast() && !in_array($this->status, ['paid', 'cancelled']);
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($invoice) {
            if (!$invoice->invoice_number) {
                $count = static::whereYear('created_at', now()->year)->count() + 1;
                $invoice->invoice_number = 'INV-' . now()->year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}
