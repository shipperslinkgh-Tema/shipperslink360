{{-- Dashboard Integration Status Partial --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-800">
        <h3 class="text-sm font-semibold text-white">Integration Status</h3>
    </div>
    <div class="divide-y divide-gray-800">
        @php
            $integrations = [
                ['name' => 'Bank Sync (GCB)',   'status' => $bankStatuses['gcb'] ?? 'unknown',   'synced' => $bankSyncTimes['gcb'] ?? null],
                ['name' => 'Bank Sync (Stanbic)','status' => $bankStatuses['stanbic'] ?? 'unknown','synced' => $bankSyncTimes['stanbic'] ?? null],
                ['name' => 'ICUMS Portal',       'status' => 'connected',                          'synced' => now()->format('H:i')],
                ['name' => 'GPHA Port Status',   'status' => 'connected',                          'synced' => now()->format('H:i')],
            ];
        @endphp
        @foreach($integrations as $int)
            <div class="flex items-center justify-between px-6 py-3">
                <span class="text-sm text-gray-300">{{ $int['name'] }}</span>
                <div class="flex items-center gap-2">
                    @if($int['synced'])
                        <span class="text-xs text-gray-500">{{ $int['synced'] }}</span>
                    @endif
                    <span class="flex items-center gap-1.5 text-xs font-medium
                        {{ $int['status'] === 'connected' ? 'text-emerald-400' : ($int['status'] === 'error' ? 'text-red-400' : 'text-yellow-400') }}">
                        <span class="w-1.5 h-1.5 rounded-full
                            {{ $int['status'] === 'connected' ? 'bg-emerald-400' : ($int['status'] === 'error' ? 'bg-red-400' : 'bg-yellow-400') }}"></span>
                        {{ ucfirst($int['status']) }}
                    </span>
                </div>
            </div>
        @endforeach
    </div>
</div>
