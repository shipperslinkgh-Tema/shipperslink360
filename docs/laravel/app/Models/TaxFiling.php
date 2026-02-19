<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class TaxFiling extends Model
{
    use HasUuids;

    protected $fillable = [
        'filing_ref',
        'tax_type',
        'period',
        'period_type',
        'gross_amount',
        'taxable_amount',
        'tax_rate',
        'tax_due',
        'tax_paid',
        'penalty',
        'status',
        'due_date',
        'filed_date',
        'paid_date',
        'filed_by',
        'reference_number',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'gross_amount'   => 'decimal:2',
            'taxable_amount' => 'decimal:2',
            'tax_rate'       => 'decimal:4',
            'tax_due'        => 'decimal:2',
            'tax_paid'       => 'decimal:2',
            'penalty'        => 'decimal:2',
            'due_date'       => 'date',
            'filed_date'     => 'date',
            'paid_date'      => 'date',
        ];
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', '!=', 'paid')
                     ->where('due_date', '<', now()->toDateString());
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('tax_type', $type);
    }

    public function markFiled(string $filedBy, string $refNumber): void
    {
        $this->update([
            'status'           => 'filed',
            'filed_date'       => now()->toDateString(),
            'filed_by'         => $filedBy,
            'reference_number' => $refNumber,
        ]);
    }

    public function markPaid(): void
    {
        $this->update(['status' => 'paid', 'paid_date' => now()->toDateString()]);
    }

    public function getBalanceDue(): float
    {
        return max(0, ($this->tax_due + $this->penalty) - $this->tax_paid);
    }

    public static function generateRef(): string
    {
        $year  = now()->year;
        $count = static::whereYear('created_at', $year)->count() + 1;
        return 'TAX-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
