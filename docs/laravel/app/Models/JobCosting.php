<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class JobCosting extends Model
{
    use HasUuids;

    protected $fillable = [
        'job_ref',
        'job_type',
        'customer_name',
        'customer_id',
        'shipment_ref',
        'consolidation_ref',
        'cost_category',
        'description',
        'vendor',
        'currency',
        'amount',
        'exchange_rate',
        'ghs_equivalent',
        'amount_billed',
        'profit_loss',
        'is_reimbursable',
        'payment_status',
        'paid_amount',
        'paid_date',
        'due_date',
        'approval_status',
        'approved_by',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount'         => 'decimal:2',
            'exchange_rate'  => 'decimal:4',
            'ghs_equivalent' => 'decimal:2',
            'amount_billed'  => 'decimal:2',
            'profit_loss'    => 'decimal:2',
            'paid_amount'    => 'decimal:2',
            'is_reimbursable'=> 'boolean',
            'paid_date'      => 'date',
            'due_date'       => 'date',
        ];
    }

    // ── Scopes ────────────────────────────────────────────────

    public function scopeUnpaid($query)
    {
        return $query->where('payment_status', 'unpaid');
    }

    public function scopePendingApproval($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeByJobType($query, string $type)
    {
        return $query->where('job_type', $type);
    }

    // ── Helpers ───────────────────────────────────────────────

    public function approve(string $approverName): void
    {
        $this->update(['approval_status' => 'approved', 'approved_by' => $approverName]);
    }

    public function reject(string $approverName): void
    {
        $this->update(['approval_status' => 'rejected', 'approved_by' => $approverName]);
    }

    public function recordPayment(float $amount, ?string $date = null): void
    {
        $newPaid = $this->paid_amount + $amount;
        $status  = $newPaid >= $this->ghs_equivalent ? 'paid' : 'partially_paid';
        $this->update([
            'paid_amount'    => $newPaid,
            'paid_date'      => $date ?? now()->toDateString(),
            'payment_status' => $status,
        ]);
    }

    public function computeGhsEquivalent(): void
    {
        $this->ghs_equivalent = round($this->amount * $this->exchange_rate, 2);
        $this->profit_loss    = round($this->amount_billed - $this->ghs_equivalent, 2);
        $this->save();
    }

    public static function generateRef(): string
    {
        $year  = now()->year;
        $count = static::whereYear('created_at', $year)->count() + 1;
        return 'JC-' . $year . '-' . str_pad($count, 5, '0', STR_PAD_LEFT);
    }
}
