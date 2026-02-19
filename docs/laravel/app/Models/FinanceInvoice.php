<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class FinanceInvoice extends Model
{
    use HasUuids;

    protected $fillable = [
        'invoice_number',
        'invoice_type',
        'customer',
        'customer_id',
        'service_type',
        'currency',
        'exchange_rate',
        'subtotal',
        'tax_amount',
        'total_amount',
        'ghs_equivalent',
        'status',
        'issue_date',
        'due_date',
        'paid_date',
        'paid_amount',
        'payment_method',
        'shipment_ref',
        'job_ref',
        'consolidation_ref',
        'description',
        'notes',
        'created_by',
        'approved_by',
        'approval_date',
    ];

    protected function casts(): array
    {
        return [
            'exchange_rate'   => 'decimal:4',
            'subtotal'        => 'decimal:2',
            'tax_amount'      => 'decimal:2',
            'total_amount'    => 'decimal:2',
            'ghs_equivalent'  => 'decimal:2',
            'paid_amount'     => 'decimal:2',
            'issue_date'      => 'date',
            'due_date'        => 'date',
            'paid_date'       => 'date',
            'approval_date'   => 'date',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeOverdue($query)
    {
        return $query
            ->whereNotIn('status', ['paid', 'cancelled'])
            ->where('due_date', '<', now()->toDateString());
    }

    public function scopeByCustomer($query, string $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    // ── Helpers ───────────────────────────────────────────────

    /**
     * Auto-compute ghs_equivalent when amount and rate are set.
     */
    public function computeGhsEquivalent(): void
    {
        $this->ghs_equivalent = $this->total_amount * $this->exchange_rate;
        $this->save();
    }

    public function approve(string $approverName): void
    {
        $this->update([
            'approved_by'   => $approverName,
            'approval_date' => now()->toDateString(),
            'status'        => 'sent',
        ]);
    }

    /**
     * Record a payment and update status accordingly.
     */
    public function recordPayment(float $amount, string $date, string $method): void
    {
        $this->paid_amount     += $amount;
        $this->paid_date        = $date;
        $this->payment_method   = $method;

        if ($this->paid_amount >= $this->total_amount) {
            $this->status = 'paid';
        } elseif ($this->paid_amount > 0) {
            $this->status = 'partially_paid';
        }

        $this->save();
    }

    public function isOverdue(): bool
    {
        return !in_array($this->status, ['paid', 'cancelled'])
            && $this->due_date->isPast();
    }
}
