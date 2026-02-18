<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BankTransaction extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'bank_connection_id',
        'transaction_ref',
        'transaction_type',
        'amount',
        'currency',
        'description',
        'counterparty_name',
        'counterparty_account',
        'transaction_date',
        'value_date',
        'balance_after',
        'match_status',
        'match_confidence',
        'matched_invoice_id',
        'matched_receivable_id',
        'is_reconciled',
        'reconciled_by',
        'reconciled_at',
        'notes',
        'raw_data',
    ];

    protected function casts(): array
    {
        return [
            'amount'           => 'decimal:2',
            'balance_after'    => 'decimal:2',
            'match_confidence' => 'decimal:2',
            'is_reconciled'    => 'boolean',
            'transaction_date' => 'datetime',
            'value_date'       => 'datetime',
            'reconciled_at'    => 'datetime',
            'created_at'       => 'datetime',
            'raw_data'         => 'array',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function bankConnection()
    {
        return $this->belongsTo(BankConnection::class);
    }

    public function reconciledBy()
    {
        return $this->belongsTo(User::class, 'reconciled_by');
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeUnmatched($query)
    {
        return $query->where('match_status', 'unmatched');
    }

    public function scopeUnreconciled($query)
    {
        return $query->where('is_reconciled', false);
    }

    public function scopeCredits($query)
    {
        return $query->where('transaction_type', 'credit');
    }

    public function scopeDebits($query)
    {
        return $query->where('transaction_type', 'debit');
    }

    // ── Helpers ───────────────────────────────────────────────

    public function reconcile(int $userId, ?string $matchedInvoiceId = null, ?string $notes = null): void
    {
        $this->update([
            'is_reconciled'     => true,
            'reconciled_by'     => $userId,
            'reconciled_at'     => now(),
            'match_status'      => 'manual',
            'matched_invoice_id' => $matchedInvoiceId ?? $this->matched_invoice_id,
            'notes'             => $notes ?? $this->notes,
        ]);
    }
}
