{{-- Dashboard Recent Shipments Partial --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h3 class="text-sm font-semibold text-white">Recent Shipments</h3>
        <a href="{{ route('shipments.index') }}" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</a>
    </div>
    <div class="divide-y divide-gray-800">
        @forelse($recentShipments ?? [] as $shipment)
            <div class="flex items-center justify-between px-6 py-3.5 hover:bg-gray-800/40 transition-colors">
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-white truncate font-mono">{{ $shipment->bl_number }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">
                        {{ $shipment->container_number ?? 'N/A' }} · {{ $shipment->origin }} → {{ $shipment->destination }}
                    </p>
                </div>
                <div class="flex items-center gap-3 ml-4">
                    @if($shipment->eta)
                        <span class="text-xs text-gray-500 hidden sm:block">ETA {{ \Carbon\Carbon::parse($shipment->eta)->format('d M') }}</span>
                    @endif
                    @include('components.badge', ['status' => $shipment->status, 'type' => 'shipment'])
                </div>
            </div>
        @empty
            @include('components.empty-state', ['message' => 'No recent shipments'])
        @endforelse
    </div>
</div>
