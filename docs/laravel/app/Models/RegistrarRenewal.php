<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RegistrarRenewal extends Model
{
    use HasUuids;

    protected $fillable = [
        'renewal_ref',
        'registration_type',
        'entity_name',
        'registration_number',
        'issue_date',
        'expiry_date',
        'status',
        'renewal_fee',
        'fee_paid',
        'renewal_date',
        'renewed_by',
        'document_url',
        'notes',
        'auto_renew',
    ];

    protected function casts(): array
    {
        return [
            'issue_date'   => 'date',
            'expiry_date'  => 'date',
            'renewal_date' => 'date',
            'renewal_fee'  => 'decimal:2',
            'fee_paid'     => 'decimal:2',
            'auto_renew'   => 'boolean',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->whereBetween('expiry_date', [now()->toDateString(), now()->addDays($days)->toDateString()]);
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now()->toDateString())
                     ->where('status', '!=', 'renewed');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // ── Helpers ───────────────────────────────────────────────

    public function getDaysUntilExpiry(): int
    {
        return now()->diffInDays($this->expiry_date, false);
    }

    public function markRenewed(string $renewedBy, ?float $feePaid = null): void
    {
        $this->update([
            'status'       => 'renewed',
            'renewal_date' => now()->toDateString(),
            'renewed_by'   => $renewedBy,
            'fee_paid'     => $feePaid ?? $this->renewal_fee,
        ]);
    }

    public function computeStatus(): string
    {
        $days = $this->getDaysUntilExpiry();
        if ($days < 0)   return 'expired';
        if ($days <= 30) return 'due_soon';
        return 'active';
    }

    public static function generateRef(): string
    {
        $year  = now()->year;
        $count = static::whereYear('created_at', $year)->count() + 1;
        return 'REG-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }
}
