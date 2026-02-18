@extends('layouts.client')

@section('title', 'My Shipments')

@section('content')
<div class="mb-6">
    <h1 class="text-xl font-bold text-white">My Shipments</h1>
    <p class="text-sm text-gray-400 mt-1">Track your cargo in real time</p>
</div>

{{-- Filters --}}
<form method="GET" class="flex flex-wrap gap-3 mb-6">
    <input type="text" name="search" value="{{ request('search') }}"
           placeholder="Search by B/L or container number…"
           class="flex-1 min-w-48 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
    <select name="status" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Statuses</option>
        @foreach(['pending','in_transit','arrived','customs','cleared','delivered'] as $s)
            <option value="{{ $s }}" {{ request('status') === $s ? 'selected' : '' }}>{{ ucwords(str_replace('_',' ',$s)) }}</option>
        @endforeach
    </select>
    <button type="submit" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">Filter</button>
</form>

{{-- Shipment cards --}}
<div class="space-y-4">
    @forelse($shipments as $s)
        <a href="{{ route('client.shipments.show', $s) }}"
           class="block bg-gray-900 border border-gray-800 hover:border-blue-600/50 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-blue-600/5">
            <div class="flex items-start justify-between">
                <div>
                    <div class="flex items-center gap-3 mb-2">
                        <p class="text-base font-bold font-mono text-white">{{ $s->bl_number }}</p>
                        @include('components.badge', ['status' => $s->status, 'type' => 'shipment'])
                    </div>
                    @if($s->container_number)
                        <p class="text-xs text-gray-400 font-mono mb-2">{{ $s->container_number }}</p>
                    @endif
                    <div class="flex items-center gap-2 text-sm text-gray-300">
                        <span>{{ $s->origin }}</span>
                        <span class="text-gray-600">→</span>
                        <span>{{ $s->destination }}</span>
                    </div>
                </div>
                <div class="text-right text-xs text-gray-400 space-y-1">
                    @if($s->vessel_name) <p>🚢 {{ $s->vessel_name }}</p> @endif
                    @if($s->eta) <p>ETA: {{ \Carbon\Carbon::parse($s->eta)->format('d M Y') }}</p> @endif
                    @if($s->ata) <p>ATA: {{ \Carbon\Carbon::parse($s->ata)->format('d M Y') }}</p> @endif
                </div>
            </div>

            {{-- Status progress --}}
            @php
                $stages = ['pending','in_transit','arrived','customs','cleared','delivered'];
                $currentIdx = array_search($s->status, $stages);
            @endphp
            <div class="mt-5">
                <div class="flex items-center gap-0">
                    @foreach($stages as $i => $stage)
                        <div class="flex items-center flex-1 last:flex-none">
                            <div class="w-2.5 h-2.5 rounded-full flex-shrink-0 {{ $i <= $currentIdx ? 'bg-blue-500' : 'bg-gray-700' }}"></div>
                            @if(!$loop->last)
                                <div class="h-0.5 flex-1 {{ $i < $currentIdx ? 'bg-blue-500' : 'bg-gray-700' }}"></div>
                            @endif
                        </div>
                    @endforeach
                </div>
                <div class="flex justify-between mt-1.5">
                    @foreach($stages as $stage)
                        <span class="text-xs {{ $stage === $s->status ? 'text-blue-400 font-semibold' : 'text-gray-600' }} capitalize">{{ str_replace('_',' ',$stage) }}</span>
                    @endforeach
                </div>
            </div>
        </a>
    @empty
        @include('components.empty-state', ['message' => 'No shipments found', 'icon' => '🚢'])
    @endforelse
</div>

<div class="mt-6">{{ $shipments->withQueryString()->links('components.pagination') }}</div>
@endsection
