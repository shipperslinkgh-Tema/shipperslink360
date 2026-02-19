{{-- Dashboard Shipment Chart Partial (Alpine.js + CSS bar chart) --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h3 class="text-sm font-semibold text-white">Shipment Status Breakdown</h3>
        <span class="text-xs text-gray-500">Last 30 days</span>
    </div>
    <div class="p-6">
        @php
            $chartData = [
                ['label' => 'In Transit',         'count' => $shipmentChart['in_transit'] ?? 0,         'color' => 'bg-blue-500'],
                ['label' => 'At Port',            'count' => $shipmentChart['at_port'] ?? 0,            'color' => 'bg-yellow-500'],
                ['label' => 'Customs Clearance',  'count' => $shipmentChart['customs_clearance'] ?? 0,  'color' => 'bg-orange-500'],
                ['label' => 'Cleared',            'count' => $shipmentChart['cleared'] ?? 0,            'color' => 'bg-emerald-500'],
                ['label' => 'Delivered',          'count' => $shipmentChart['delivered'] ?? 0,          'color' => 'bg-teal-500'],
                ['label' => 'On Hold',            'count' => $shipmentChart['on_hold'] ?? 0,            'color' => 'bg-red-500'],
            ];
            $max = max(collect($chartData)->max('count'), 1);
        @endphp
        <div class="space-y-3">
            @foreach($chartData as $bar)
                <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-400 w-32 shrink-0 truncate">{{ $bar['label'] }}</span>
                    <div class="flex-1 bg-gray-800 rounded-full h-2">
                        <div class="{{ $bar['color'] }} h-2 rounded-full transition-all duration-700"
                             style="width: {{ round(($bar['count']/$max)*100) }}%"></div>
                    </div>
                    <span class="text-xs text-white font-semibold w-6 text-right">{{ $bar['count'] }}</span>
                </div>
            @endforeach
        </div>
    </div>
</div>
