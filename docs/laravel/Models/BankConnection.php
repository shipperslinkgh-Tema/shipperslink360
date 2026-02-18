<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class BankConnection extends Model
{
    use HasUuids;

    protected $fillable = [
        'bank_name',
        'bank_display_name',
        'account_name',
        'account_number',
        'account_type',
        'currency',
        'balance',
        'available_balance',
        'api_endpoint',
        'is_active',
        'sync_status',
        'error_message',
        'last_sync_at',
    ];

    protected function casts(): array
    {
        return [
            'balance'           => 'decimal:2',
            'available_balance' => 'decimal:2',
            'is_active'         => 'boolean',
            'last_sync_at'      => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────

    public function transactions()
    {
        return $this->hasMany(BankTransaction::class);
    }

    public function reconciliations()
    {
        return $this->hasMany(BankReconciliation::class);
    }

    public function alerts()
    {
        return $this->hasMany(BankAlert::class);
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function markSyncing(): void
    {
        $this->update(['sync_status' => 'syncing']);
    }

    public function markSynced(float $balance, float $availableBalance): void
    {
        $this->update([
            'sync_status'       => 'synced',
            'balance'           => $balance,
            'available_balance' => $availableBalance,
            'last_sync_at'      => now(),
            'error_message'     => null,
        ]);
    }

    public function markSyncError(string $errorMessage): void
    {
        $this->update([
            'sync_status'   => 'error',
            'error_message' => $errorMessage,
            'last_sync_at'  => now(),
        ]);
    }
}
