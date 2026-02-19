{{-- Dashboard Clearance Status Partial --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-800">
        <h3 class="text-sm font-semibold text-white">Clearance Status</h3>
        <p class="text-xs text-gray-500 mt-0.5">Customs & port clearance pipeline</p>
    </div>
    <div class="p-6 space-y-4">
        @php
            $stages = [
                ['label' => 'Awaiting Documents', 'count' => $clearance['awaiting_docs'] ?? 0, 'color' => 'bg-yellow-500'],
                ['label' => 'ICUMS Filed',         'count' => $clearance['icums_filed'] ?? 0,    'color' => 'bg-blue-500'],
                ['label' => 'Under Examination',   'count' => $clearance['examining'] ?? 0,      'color' => 'bg-orange-500'],
                ['label' => 'Duty Assessed',       'count' => $clearance['duty_assessed'] ?? 0,  'color' => 'bg-purple-500'],
                ['label' => 'Released / Cleared',  'count' => $clearance['cleared'] ?? 0,        'color' => 'bg-emerald-500'],
            ];
            $total = collect($stages)->sum('count');
        @endphp
        @foreach($stages as $stage)
            <div>
                <div class="flex justify-between text-xs mb-1">
                    <span class="text-gray-400">{{ $stage['label'] }}</span>
                    <span class="text-white font-semibold">{{ $stage['count'] }}</span>
                </div>
                <div class="w-full bg-gray-800 rounded-full h-1.5">
                    <div class="{{ $stage['color'] }} h-1.5 rounded-full transition-all" style="width: {{ $total > 0 ? round(($stage['count']/$total)*100) : 0 }}%"></div>
                </div>
            </div>
        @endforeach
        <p class="text-xs text-gray-600 pt-1">{{ $total }} shipments in clearance pipeline</p>
    </div>
</div>
