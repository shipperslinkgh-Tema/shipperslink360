<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BankAlert extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'bank_connection_id',
        'transaction_id',
        'title',
        'message',
        'alert_type',
        'priority',
        'amount',
        'currency',
        'is_read',
        'is_dismissed',
        'read_by',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'amount'       => 'decimal:2',
            'is_read'      => 'boolean',
            'is_dismissed' => 'boolean',
            'read_at'      => 'datetime',
            'created_at'   => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function bankConnection()
    {
        return $this->belongsTo(BankConnection::class);
    }

    public function transaction()
    {
        return $this->belongsTo(BankTransaction::class, 'transaction_id');
    }

    public function readByUser()
    {
        return $this->belongsTo(User::class, 'read_by');
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_dismissed', false);
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function markRead(int $userId): void
    {
        $this->update([
            'is_read' => true,
            'read_by' => $userId,
            'read_at' => now(),
        ]);
    }

    public function dismiss(): void
    {
        $this->update(['is_dismissed' => true]);
    }
}
