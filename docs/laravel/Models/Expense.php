<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Expense extends Model
{
    use HasUuids;

    protected $fillable = [
        'expense_ref',
        'category',
        'description',
        'currency',
        'amount',
        'exchange_rate',
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
            'amount'         => 'decimal:2',
            'exchange_rate'  => 'decimal:4',
            'ghs_equivalent' => 'decimal:2',
            'expense_date'   => 'date',
            'paid_date'      => 'date',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopePending($query)   { return $query->where('status', 'pending'); }
    public function scopeApproved($query)  { return $query->where('status', 'approved'); }
    public function scopePaid($query)      { return $query->where('status', 'paid'); }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function computeGhsEquivalent(): void
    {
        $this->ghs_equivalent = round($this->amount * $this->exchange_rate, 2);
        $this->save();
    }

    public function approve(string $approverName): void
    {
        $this->update(['status' => 'approved', 'approved_by' => $approverName]);
    }

    public function reject(string $approverName): void
    {
        $this->update(['status' => 'rejected', 'approved_by' => $approverName]);
    }

    public function markPaid(?string $paidDate = null): void
    {
        $this->update(['status' => 'paid', 'paid_date' => $paidDate ?? now()->toDateString()]);
    }

    public static function generateRef(): string
    {
        $year  = now()->year;
        $count = static::whereYear('created_at', $year)->count() + 1;
        return 'EXP-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
