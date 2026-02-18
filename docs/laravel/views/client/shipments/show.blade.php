@extends('layouts.client')

@section('title', 'Shipment — ' . $shipment->bl_number)

@section('content')
<div class="mb-6">
    <a href="{{ route('client.shipments.index') }}" class="text-sm text-gray-400 hover:text-white transition-colors">← Back to Shipments</a>
</div>

<div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
    <div class="flex items-start justify-between mb-6">
        <div>
            <div class="flex items-center gap-3 mb-1">
                <h1 class="text-xl font-bold font-mono text-white">{{ $shipment->bl_number }}</h1>
                @include('components.badge', ['status' => $shipment->status, 'type' => 'shipment'])
            </div>
            @if($shipment->container_number)
                <p class="text-sm text-gray-400 font-mono">Container: {{ $shipment->container_number }}</p>
            @endif
        </div>
    </div>

    {{-- Journey progress --}}
    @php
        $stages = ['pending','in_transit','arrived','customs','cleared','delivered'];
        $currentIdx = array_search($shipment->status, $stages);
    @endphp
    <div class="mb-8">
        <div class="flex items-center gap-0">
            @foreach($stages as $i => $stage)
                <div class="flex items-center flex-1 last:flex-none">
                    <div class="w-3 h-3 rounded-full flex-shrink-0 ring-2 {{ $i <= $currentIdx ? 'bg-blue-500 ring-blue-500/30' : 'bg-gray-700 ring-gray-700' }}"></div>
                    @if(!$loop->last)
                        <div class="h-0.5 flex-1 {{ $i < $currentIdx ? 'bg-blue-500' : 'bg-gray-700' }}"></div>
                    @endif
                </div>
            @endforeach
        </div>
        <div class="flex justify-between mt-2">
            @foreach($stages as $stage)
                <span class="text-xs {{ $stage === $shipment->status ? 'text-blue-400 font-semibold' : 'text-gray-600' }} capitalize">
                    {{ str_replace('_',' ',$stage) }}
                </span>
            @endforeach
        </div>
    </div>

    {{-- Details grid --}}
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
        @php
            $details = [
                'Origin'       => $shipment->origin,
                'Destination'  => $shipment->destination,
                'Vessel'       => $shipment->vessel_name ?? '—',
                'Voyage'       => $shipment->voyage_number ?? '—',
                'ETA'          => $shipment->eta ? \Carbon\Carbon::parse($shipment->eta)->format('d M Y') : '—',
                'ATA'          => $shipment->ata ? \Carbon\Carbon::parse($shipment->ata)->format('d M Y') : '—',
                'Weight'       => $shipment->weight_kg ? number_format($shipment->weight_kg) . ' kg' : '—',
                'Cargo'        => $shipment->cargo_description ?? '—',
            ];
        @endphp
        @foreach($details as $label => $value)
            <div>
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">{{ $label }}</p>
                <p class="text-sm text-white">{{ $value }}</p>
            </div>
        @endforeach
    </div>

    @if($shipment->notes)
        <div class="mt-6 pt-6 border-t border-gray-800">
            <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
            <p class="text-sm text-gray-300">{{ $shipment->notes }}</p>
        </div>
    @endif
</div>

{{-- Related documents --}}
@if(isset($documents) && $documents->isNotEmpty())
    <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-800">
            <h3 class="text-sm font-semibold text-white">Related Documents</h3>
        </div>
        <div class="divide-y divide-gray-800">
            @foreach($documents as $doc)
                <div class="flex items-center justify-between px-6 py-3.5">
                    <div>
                        <p class="text-sm text-white">{{ $doc->document_name }}</p>
                        <p class="text-xs text-gray-400">{{ $doc->document_type }} @if($doc->file_size)· {{ $doc->file_size }}@endif</p>
                    </div>
                    <a href="{{ route('client.documents.download', $doc) }}"
                       class="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        Download ↓
                    </a>
                </div>
            @endforeach
        </div>
    </div>
@endif
@endsection
