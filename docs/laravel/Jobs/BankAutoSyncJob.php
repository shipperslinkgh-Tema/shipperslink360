<?php

namespace App\Jobs;

use App\Models\BankConnection;
use App\Models\BankTransaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Runs every 30 minutes.
 * Syncs balances and transactions for all active bank connections.
 */
class BankAutoSyncJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries      = 2;
    public int $timeout    = 120;

    public function handle(): void
    {
        $connections = BankConnection::where('is_active', true)->get();

        foreach ($connections as $connection) {
            try {
                $this->syncConnection($connection);
            } catch (\Throwable $e) {
                Log::error("[BankAutoSyncJob] Failed to sync connection {$connection->id}: " . $e->getMessage());

                $connection->update([
                    'sync_status'   => 'error',
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        // After sync, dispatch transaction matching
        AutoMatchTransactionsJob::dispatch();

        Log::info("[BankAutoSyncJob] Synced {$connections->count()} connection(s).");
    }

    private function syncConnection(BankConnection $connection): void
    {
        if (! $connection->api_endpoint) {
            Log::warning("[BankAutoSyncJob] Connection {$connection->id} has no API endpoint. Skipping.");
            return;
        }

        // Call bank API — implementation depends on bank provider SDK/webhook
        $response = Http::timeout(30)
            ->withHeaders(['Authorization' => 'Bearer ' . $this->getApiToken($connection)])
            ->get($connection->api_endpoint . '/balance');

        if (! $response->successful()) {
            throw new \RuntimeException("Bank API returned HTTP {$response->status()}");
        }

        $data = $response->json();

        $connection->update([
            'balance'           => $data['available_balance'] ?? $connection->balance,
            'available_balance' => $data['available_balance'] ?? $connection->available_balance,
            'sync_status'       => 'synced',
            'last_sync_at'      => now(),
            'error_message'     => null,
        ]);

        // Fetch recent transactions
        $txResponse = Http::timeout(30)
            ->withHeaders(['Authorization' => 'Bearer ' . $this->getApiToken($connection)])
            ->get($connection->api_endpoint . '/transactions', [
                'from' => $connection->last_sync_at?->toDateString() ?? now()->subDay()->toDateString(),
                'to'   => now()->toDateString(),
            ]);

        if ($txResponse->successful()) {
            foreach ($txResponse->json('transactions', []) as $tx) {
                BankTransaction::firstOrCreate(
                    ['transaction_ref' => $tx['ref']],
                    [
                        'bank_connection_id' => $connection->id,
                        'transaction_date'   => $tx['date'],
                        'transaction_type'   => $tx['type'],
                        'amount'             => $tx['amount'],
                        'currency'           => $connection->currency,
                        'description'        => $tx['description'] ?? null,
                        'counterparty_name'  => $tx['counterparty'] ?? null,
                        'balance_after'      => $tx['balance_after'] ?? null,
                        'raw_data'           => $tx,
                        'match_status'       => 'unmatched',
                    ]
                );
            }
        }
    }

    private function getApiToken(BankConnection $connection): string
    {
        // Resolve API token from vault/config per bank
        // In production: decrypt from encrypted field on bank_connections
        return config("banking.tokens.{$connection->bank_name}", '');
    }
}
