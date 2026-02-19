<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class FinanceJobCost extends Model
{
    use HasUuids;

    protected $fillable = [
        'job_ref',
        'job_type',
        'customer',
        'customer_id',
        'description',
        'vendor',
        'cost_category',
        'currency',
        'exchange_rate',
        'amount',
        'ghs_equivalent',
        'payment_status',
        'paid_amount',
        'paid_date',
        'due_date',
        'is_reimbursable',
        'approval_status',
        'approved_by',
        'shipment_ref',
        'consolidation_ref',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'exchange_rate'   => 'decimal:4',
            'amount'          => 'decimal:2',
            'ghs_equivalent'  => 'decimal:2',
            'paid_amount'     => 'decimal:2',
            'is_reimbursable' => 'boolean',
            'paid_date'       => 'date',
            'due_date'        => 'date',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', 'unpaid');
    }

    // ── Helpers ───────────────────────────────────────────────

    public function computeGhsEquivalent(): void
    {
        $this->ghs_equivalent = $this->amount * $this->exchange_rate;
        $this->save();
    }

    public function approve(string $approverName): void
    {
        $this->update([
            'approval_status' => 'approved',
            'approved_by'     => $approverName,
        ]);
    }

    public function reject(string $approverName): void
    {
        $this->update([
            'approval_status' => 'rejected',
            'approved_by'     => $approverName,
        ]);
    }

    public function recordPayment(float $amount, string $date): void
    {
        $this->paid_amount += $amount;
        $this->paid_date    = $date;

        if ($this->paid_amount >= $this->amount) {
            $this->payment_status = 'paid';
        } elseif ($this->paid_amount > 0) {
            $this->payment_status = 'partial';
        }

        $this->save();
    }
}
