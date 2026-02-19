<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BankReconciliation extends Model
{
    use HasUuids;

    protected $fillable = [
        'bank_connection_id',
        'period_start',
        'period_end',
        'bank_opening_balance',
        'bank_closing_balance',
        'book_opening_balance',
        'book_closing_balance',
        'total_credits',
        'total_debits',
        'matched_count',
        'unmatched_count',
        'discrepancy_amount',
        'status',
        'notes',
        'completed_by',
        'completed_at',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'period_start'          => 'date',
            'period_end'            => 'date',
            'bank_opening_balance'  => 'decimal:2',
            'bank_closing_balance'  => 'decimal:2',
            'book_opening_balance'  => 'decimal:2',
            'book_closing_balance'  => 'decimal:2',
            'total_credits'         => 'decimal:2',
            'total_debits'          => 'decimal:2',
            'discrepancy_amount'    => 'decimal:2',
            'completed_at'          => 'datetime',
            'approved_at'           => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function bankConnection()
    {
        return $this->belongsTo(BankConnection::class);
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    // ── Helpers ───────────────────────────────────────────────

    public function complete(int $userId): void
    {
        $this->update([
            'status'       => 'completed',
            'completed_by' => $userId,
            'completed_at' => now(),
        ]);
    }

    public function approve(int $userId): void
    {
        $this->update([
            'status'      => 'approved',
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }
}
