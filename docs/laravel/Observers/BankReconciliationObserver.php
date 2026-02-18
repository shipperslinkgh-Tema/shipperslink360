<?php

namespace App\Observers;

use App\Models\BankReconciliation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class BankReconciliationObserver
{
    public function created(BankReconciliation $reconciliation): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'create_reconciliation',
            'resource_type' => 'bank_reconciliation',
            'resource_id'   => $reconciliation->id,
            'details'       => [
                'period_start'    => $reconciliation->period_start,
                'period_end'      => $reconciliation->period_end,
                'status'          => $reconciliation->status,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }

    public function updated(BankReconciliation $reconciliation): void
    {
        $dirty = $reconciliation->getDirty();

        $action = match ($dirty['status'] ?? null) {
            'completed' => 'complete_reconciliation',
            'approved'  => 'approve_reconciliation',
            default     => 'update_reconciliation',
        };

        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => $action,
            'resource_type' => 'bank_reconciliation',
            'resource_id'   => $reconciliation->id,
            'details'       => [
                'changes' => $dirty,
                'before'  => array_intersect_key($reconciliation->getOriginal(), $dirty),
                'discrepancy_amount' => $reconciliation->discrepancy_amount,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }
}
