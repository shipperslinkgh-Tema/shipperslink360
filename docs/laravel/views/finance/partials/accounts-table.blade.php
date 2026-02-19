{{-- finance/partials/accounts-table.blade.php --}}
<div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @foreach($accounts ?? [] as $account)
        <div class="metric-card">
            <div class="flex items-start justify-between">
                <div>
                    <p class="text-xs text-muted-foreground uppercase tracking-wider">{{ $account->accountName ?? $account['accountName'] ?? '' }}</p>
                    <p class="text-2xl font-bold text-foreground mt-2">{{ $account->currency ?? 'GHS' }} {{ number_format($account->balance ?? 0, 2) }}</p>
                    <p class="text-xs text-muted-foreground mt-1">Available: {{ number_format($account->availableBalance ?? 0, 2) }}</p>
                </div>
                <span class="status-badge {{ ($account->status ?? '') === 'active' ? 'status-success' : 'status-danger' }}">{{ ucfirst($account->status ?? 'active') }}</span>
            </div>
            <p class="text-xs text-muted-foreground mt-3 font-mono">{{ $account->accountNumber ?? '' }} · {{ $account->bankName ?? '' }}</p>
        </div>
        @endforeach
    </div>
</div>
