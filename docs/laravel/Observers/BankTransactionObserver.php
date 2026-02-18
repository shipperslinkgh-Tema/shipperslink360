<?php

namespace App\Observers;

use App\Models\BankTransaction;
use App\Models\AppNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class BankTransactionObserver
{
    public function created(BankTransaction $transaction): void
    {
        $threshold = (float) config('banking.large_transaction_threshold', 50000);

        // ── Large transaction alert ───────────────────────────
        if (abs($transaction->amount) >= $threshold) {
            $type  = $transaction->transaction_type === 'credit' ? 'Credit' : 'Debit';
            $emoji = $transaction->transaction_type === 'credit' ? '📥' : '📤';

            foreach (['management', 'accounts'] as $dept) {
                AppNotification::create([
                    'title'                => "{$emoji} Large {$type} — {$transaction->currency} " .
                                             number_format(abs($transaction->amount), 2),
                    'message'              => "A large {$type} of {$transaction->currency} " .
                                             number_format(abs($transaction->amount), 2) .
                                             " was detected. Ref: {$transaction->transaction_ref}. " .
                                             "Counterparty: " . ($transaction->counterparty_name ?? 'Unknown'),
                    'type'                 => 'large_transaction',
                    'category'             => 'banking',
                    'priority'             => 'high',
                    'recipient_department' => $dept,
                    'reference_type'       => 'bank_transaction',
                    'reference_id'         => $transaction->id,
                    'action_url'           => '/banking',
                    'metadata'             => [
                        'amount'           => $transaction->amount,
                        'currency'         => $transaction->currency,
                        'transaction_type' => $transaction->transaction_type,
                        'transaction_ref'  => $transaction->transaction_ref,
                        'threshold'        => $threshold,
                    ],
                ]);
            }
        }
    }

    public function updated(BankTransaction $transaction): void
    {
        $dirty = $transaction->getDirty();

        // Audit log for reconciliation and manual match
        $action = 'update_transaction';
        if (isset($dirty['is_reconciled']) && $dirty['is_reconciled'] === true) {
            $action = 'reconcile_transaction';
        } elseif (isset($dirty['match_status']) && $dirty['match_status'] === 'manual') {
            $action = 'manual_match_transaction';
        }

        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => $action,
            'resource_type' => 'bank_transaction',
            'resource_id'   => $transaction->id,
            'details'       => [
                'changes' => $dirty,
                'before'  => array_intersect_key($transaction->getOriginal(), $dirty),
            ],
            'ip_address'    => Request::ip(),
        ]);
    }
}
