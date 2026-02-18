<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class ClientInvoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'customer_id',
        'shipment_id',
        'invoice_number',
        'amount',
        'currency',
        'status',
        'description',
        'due_date',
        'paid_date',
        'paid_amount',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount'      => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'due_date'    => 'date',
            'paid_date'   => 'date',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function shipment()
    {
        return $this->belongsTo(ClientShipment::class, 'shipment_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Helpers ───────────────────────────────────────────────

    public function isOverdue(): bool
    {
        return !in_array($this->status, ['paid', 'cancelled'])
            && $this->due_date->isPast();
    }

    /**
     * Record a payment and update status accordingly.
     */
    public function recordPayment(float $paidAmount, string $paidDate): void
    {
        $this->paid_amount += $paidAmount;
        $this->paid_date    = $paidDate;

        if ($this->paid_amount >= $this->amount) {
            $this->status = 'paid';
        } else {
            $this->status = 'partially_paid';
        }

        $this->save();
    }
}
