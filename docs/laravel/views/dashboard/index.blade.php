@extends('layouts.app')

@section('title', 'Dashboard')
@section('page-title', 'Dashboard')

@section('content')
@php
    $dept = Auth::user()?->getDepartment();
@endphp

{{-- Greeting --}}
<div class="mb-6">
    <h1 class="text-2xl font-bold text-white">
        Good {{ now()->hour < 12 ? 'morning' : (now()->hour < 17 ? 'afternoon' : 'evening') }},
        {{ explode(' ', Auth::user()?->profile?->full_name)[0] }} 👋
    </h1>
    <p class="text-sm text-gray-400 mt-1">{{ now()->format('l, F j, Y') }} · {{ strtoupper(str_replace('_', ' ', $dept)) }} Department</p>
</div>

{{-- KPI Cards --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    @include('components.stat-card', [
        'label'  => 'Active Shipments',
        'value'  => $stats['active_shipments'] ?? 0,
        'badge'  => 'operations',
        'trend'  => '+3 this week',
        'positive' => true,
    ])
    @include('components.stat-card', [
        'label'  => 'Outstanding Invoices',
        'value'  => 'GHS ' . number_format($stats['outstanding_invoices'] ?? 0, 0),
        'badge'  => 'finance',
        'trend'  => ($stats['overdue_count'] ?? 0) . ' overdue',
        'positive' => false,
    ])
    @include('components.stat-card', [
        'label'  => 'Bank Balance (GHS)',
        'value'  => 'GHS ' . number_format($stats['total_bank_balance'] ?? 0, 0),
        'badge'  => 'banking',
        'trend'  => 'Updated ' . ($stats['last_sync'] ?? 'recently'),
        'positive' => true,
    ])
    @include('components.stat-card', [
        'label'  => 'Unread Notifications',
        'value'  => $stats['unread_notifications'] ?? 0,
        'badge'  => 'system',
        'trend'  => 'Across all priorities',
        'positive' => true,
    ])
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    {{-- Recent Shipments --}}
    <div class="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h3 class="text-sm font-semibold text-white">Recent Shipments</h3>
            <a href="{{ route('shipments.index') }}" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</a>
        </div>
        <div class="divide-y divide-gray-800">
            @forelse($recentShipments ?? [] as $shipment)
                <div class="flex items-center justify-between px-6 py-3.5">
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-white truncate font-mono">{{ $shipment->bl_number }}</p>
                        <p class="text-xs text-gray-400 mt-0.5">{{ $shipment->container_number }} · {{ $shipment->origin }} → {{ $shipment->destination }}</p>
                    </div>
                    @include('components.badge', ['status' => $shipment->status, 'type' => 'shipment'])
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No recent shipments'])
            @endforelse
        </div>
    </div>

    {{-- Recent Notifications --}}
    <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h3 class="text-sm font-semibold text-white">Notifications</h3>
            <a href="{{ route('notifications.index') }}" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">View all →</a>
        </div>
        <div class="divide-y divide-gray-800">
            @forelse($recentNotifications ?? [] as $n)
                <div class="px-6 py-3.5 {{ $n->is_read ? 'opacity-60' : '' }}">
                    <div class="flex items-start gap-2.5">
                        <span class="mt-1.5 w-2 h-2 rounded-full flex-shrink-0
                            {{ $n->priority === 'critical' ? 'bg-red-500' : ($n->priority === 'high' ? 'bg-orange-500' : 'bg-blue-500') }}">
                        </span>
                        <div class="min-w-0">
                            <p class="text-xs font-semibold text-white line-clamp-1">{{ $n->title }}</p>
                            <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ $n->message }}</p>
                            <p class="text-xs text-gray-600 mt-1">{{ $n->created_at->diffForHumans() }}</p>
                        </div>
                    </div>
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No notifications'])
            @endforelse
        </div>
    </div>
</div>
@endsection
