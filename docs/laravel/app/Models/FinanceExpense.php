<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class FinanceExpense extends Model
{
    use HasUuids;

    protected $fillable = [
        'expense_ref',
        'description',
        'category',
        'currency',
        'exchange_rate',
        'amount',
        'ghs_equivalent',
        'status',
        'expense_date',
        'paid_date',
        'requested_by',
        'approved_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'exchange_rate'  => 'decimal:4',
            'amount'         => 'decimal:2',
            'ghs_equivalent' => 'decimal:2',
            'expense_date'   => 'date',
            'paid_date'      => 'date',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
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
            'status'      => 'approved',
            'approved_by' => $approverName,
        ]);
    }

    public function reject(string $approverName): void
    {
        $this->update([
            'status'      => 'rejected',
            'approved_by' => $approverName,
        ]);
    }

    public function markPaid(string $paidDate): void
    {
        $this->update([
            'status'    => 'paid',
            'paid_date' => $paidDate,
        ]);
    }
}
