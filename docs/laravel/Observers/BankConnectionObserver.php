<?php

namespace App\Observers;

use App\Models\BankConnection;
use App\Models\AppNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class BankConnectionObserver
{
    public function created(BankConnection $connection): void
    {
        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => 'add_bank_connection',
            'resource_type' => 'bank_connection',
            'resource_id'   => $connection->id,
            'details'       => [
                'bank_name'      => $connection->bank_display_name,
                'account_number' => substr($connection->account_number, -4), // mask
                'account_type'   => $connection->account_type,
            ],
            'ip_address'    => Request::ip(),
        ]);
    }

    public function updated(BankConnection $connection): void
    {
        $dirty = $connection->getDirty();

        $action = 'update_bank_connection';
        if (isset($dirty['is_active']) && $dirty['is_active'] === false) {
            $action = 'deactivate_bank_connection';
        }

        \App\Models\AuditLog::create([
            'user_id'       => Auth::id(),
            'action'        => $action,
            'resource_type' => 'bank_connection',
            'resource_id'   => $connection->id,
            'details'       => [
                'changes' => $dirty,
                'before'  => array_intersect_key($connection->getOriginal(), $dirty),
            ],
            'ip_address'    => Request::ip(),
        ]);

        // ── Sync error notification ───────────────────────────
        if (isset($dirty['sync_status']) && $dirty['sync_status'] === 'error') {
            foreach (['accounts', 'management'] as $dept) {
                AppNotification::create([
                    'title'                => "Bank Sync Failed — {$connection->bank_display_name}",
                    'message'              => "Bank connection sync failed for {$connection->bank_display_name} " .
                                             "(****" . substr($connection->account_number, -4) . "). " .
                                             "Error: " . ($connection->error_message ?? 'Unknown error'),
                    'type'                 => 'bank_sync_error',
                    'category'             => 'banking',
                    'priority'             => 'high',
                    'recipient_department' => $dept,
                    'reference_type'       => 'bank_connection',
                    'reference_id'         => $connection->id,
                    'action_url'           => '/banking',
                ]);
            }
        }

        // ── Low balance notification ──────────────────────────
        $threshold = (float) config('banking.low_balance_threshold', 10000);
        if (
            isset($dirty['balance']) &&
            $connection->balance < $threshold &&
            $connection->is_active &&
            $connection->sync_status !== 'error'
        ) {
            foreach (['accounts', 'management'] as $dept) {
                AppNotification::create([
                    'title'                => "Low Balance Alert — {$connection->bank_display_name}",
                    'message'              => "Account balance for {$connection->bank_display_name} " .
                                             "has dropped below GHS " . number_format($threshold, 2) .
                                             ". Current balance: GHS " . number_format($connection->balance, 2),
                    'type'                 => 'low_balance',
                    'category'             => 'banking',
                    'priority'             => 'critical',
                    'recipient_department' => $dept,
                    'reference_type'       => 'bank_connection',
                    'reference_id'         => $connection->id,
                    'action_url'           => '/banking',
                    'metadata'             => [
                        'balance'   => $connection->balance,
                        'threshold' => $threshold,
                        'currency'  => $connection->currency,
                    ],
                ]);
            }
        }
    }
}
