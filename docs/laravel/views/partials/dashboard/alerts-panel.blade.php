{{-- Dashboard Alerts Panel Partial --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h3 class="text-sm font-semibold text-white">Active Alerts</h3>
        @if(isset($alertCount) && $alertCount > 0)
            <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{{ $alertCount }} alerts</span>
        @endif
    </div>
    <div class="divide-y divide-gray-800 max-h-72 overflow-y-auto">
        @forelse($alerts ?? [] as $alert)
            <div class="px-6 py-3.5">
                <div class="flex items-start gap-3">
                    <span class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0
                        {{ $alert->priority === 'critical' ? 'bg-red-500 animate-pulse' : ($alert->priority === 'high' ? 'bg-orange-500' : 'bg-blue-500') }}">
                    </span>
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-semibold text-white line-clamp-1">{{ $alert->title }}</p>
                        <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ $alert->message }}</p>
                        <p class="text-xs text-gray-600 mt-1">{{ $alert->created_at->diffForHumans() }}</p>
                    </div>
                </div>
            </div>
        @empty
            @include('components.empty-state', ['message' => 'No active alerts', 'icon' => 'check'])
        @endforelse
    </div>
</div>
