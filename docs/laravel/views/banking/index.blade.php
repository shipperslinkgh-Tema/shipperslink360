@extends('layouts.app')

@section('title', 'Banking')
@section('page-title', 'Banking & Reconciliation')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-xl font-bold text-white">Banking</h1>
        <p class="text-sm text-gray-400 mt-1">Bank connections, transactions, and reconciliations</p>
    </div>
</div>

{{-- Summary cards --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    @foreach($connections ?? [] as $conn)
        @if($conn->is_active)
            <div class="bg-gray-900 border {{ $conn->sync_status === 'error' ? 'border-red-800' : 'border-gray-800' }} rounded-xl p-5">
                <div class="flex items-start justify-between mb-3">
                    <div class="text-xs text-gray-500 font-medium truncate max-w-[70%]">{{ $conn->bank_display_name }}</div>
                    <span class="text-xs px-1.5 py-0.5 rounded-full {{ $conn->sync_status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : ($conn->sync_status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-gray-700 text-gray-400') }}">
                        {{ $conn->sync_status }}
                    </span>
                </div>
                <p class="text-lg font-bold text-white">{{ $conn->currency }} {{ number_format($conn->balance ?? 0, 2) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ $conn->account_number }}</p>
                @if($conn->last_sync_at)
                    <p class="text-xs text-gray-600 mt-1">Synced {{ \Carbon\Carbon::parse($conn->last_sync_at)->diffForHumans() }}</p>
                @endif
            </div>
        @endif
    @endforeach
</div>

{{-- Tabs --}}
<div x-data="{ tab: 'transactions' }">
    <div class="border-b border-gray-800 mb-6">
        <nav class="flex gap-1">
            @foreach(['transactions' => 'Transactions', 'reconciliations' => 'Reconciliations', 'alerts' => 'Alerts', 'connections' => 'Connections'] as $key => $label)
                <button @click="tab = '{{ $key }}'"
                        :class="tab === '{{ $key }}' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500 hover:text-gray-300'"
                        class="px-4 py-3 text-sm font-medium transition-colors">
                    {{ $label }}
                    @if($key === 'alerts' && isset($unreadAlerts) && $unreadAlerts > 0)
                        <span class="ml-1.5 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{{ $unreadAlerts }}</span>
                    @endif
                </button>
            @endforeach
        </nav>
    </div>

    {{-- Transactions --}}
    <div x-show="tab === 'transactions'">
        <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table class="w-full text-sm">
                <thead>
                    <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                        <th class="px-6 py-3 text-left font-medium">Date</th>
                        <th class="px-6 py-3 text-left font-medium">Description</th>
                        <th class="px-6 py-3 text-left font-medium">Reference</th>
                        <th class="px-6 py-3 text-right font-medium">Amount</th>
                        <th class="px-6 py-3 text-left font-medium">Match</th>
                        <th class="px-6 py-3 text-left font-medium">Reconciled</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse($transactions ?? [] as $txn)
                        <tr class="hover:bg-gray-800/40 transition-colors">
                            <td class="px-6 py-4 text-gray-300 text-xs">{{ \Carbon\Carbon::parse($txn->transaction_date)->format('d M Y') }}</td>
                            <td class="px-6 py-4">
                                <p class="text-white text-sm">{{ Str::limit($txn->description, 40) }}</p>
                                <p class="text-xs text-gray-400">{{ $txn->counterparty_name }}</p>
                            </td>
                            <td class="px-6 py-4 font-mono text-xs text-gray-400">{{ $txn->transaction_ref }}</td>
                            <td class="px-6 py-4 text-right font-semibold {{ $txn->transaction_type === 'credit' ? 'text-emerald-400' : 'text-red-400' }}">
                                {{ $txn->transaction_type === 'credit' ? '+' : '-' }}{{ $txn->currency }} {{ number_format($txn->amount, 2) }}
                            </td>
                            <td class="px-6 py-4">
                                @include('components.badge', ['status' => $txn->match_status, 'type' => 'match'])
                            </td>
                            <td class="px-6 py-4">
                                @if($txn->is_reconciled)
                                    <span class="text-xs text-emerald-400">✓ Yes</span>
                                @else
                                    <span class="text-xs text-gray-500">No</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="6">@include('components.empty-state', ['message' => 'No transactions'])</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    {{-- Alerts --}}
    <div x-show="tab === 'alerts'" class="space-y-3">
        @forelse($alerts ?? [] as $alert)
            <div class="flex items-start gap-4 px-6 py-4 bg-gray-900 border {{ $alert->priority === 'critical' ? 'border-red-800' : ($alert->priority === 'high' ? 'border-orange-800' : 'border-gray-800') }} rounded-xl {{ $alert->is_read ? 'opacity-60' : '' }}">
                <div class="flex-shrink-0 mt-0.5">
                    <span class="w-2 h-2 rounded-full block {{ $alert->priority === 'critical' ? 'bg-red-500' : ($alert->priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500') }}"></span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-white">{{ $alert->title }}</p>
                    <p class="text-xs text-gray-400 mt-1">{{ $alert->message }}</p>
                    <p class="text-xs text-gray-600 mt-1">{{ \Carbon\Carbon::parse($alert->created_at)->diffForHumans() }}</p>
                </div>
                @if(!$alert->is_read)
                    <form method="POST" action="{{ route('banking.alerts.read', $alert) }}">
                        @csrf
                        <button class="text-xs text-blue-400 hover:text-blue-300 transition-colors flex-shrink-0">Mark read</button>
                    </form>
                @endif
            </div>
        @empty
            @include('components.empty-state', ['message' => 'No bank alerts'])
        @endforelse
    </div>

    {{-- Connections --}}
    <div x-show="tab === 'connections'">
        <div class="flex justify-end mb-4">
            <a href="{{ route('banking.connections.create') }}"
               class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
                + Add Connection
            </a>
        </div>
        <div class="space-y-3">
            @forelse($connections ?? [] as $conn)
                <div class="flex items-center justify-between px-6 py-4 bg-gray-900 border border-gray-800 rounded-xl">
                    <div>
                        <p class="text-sm font-semibold text-white">{{ $conn->bank_display_name }}</p>
                        <p class="text-xs text-gray-400 font-mono">{{ $conn->account_number }} · {{ $conn->account_type }} · {{ $conn->currency }}</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="text-xs {{ $conn->is_active ? 'text-emerald-400' : 'text-gray-500' }}">{{ $conn->is_active ? '● Active' : '○ Inactive' }}</span>
                        @if($conn->is_active)
                            <form method="POST" action="{{ route('banking.connections.sync', $conn) }}">
                                @csrf
                                <button class="text-xs text-blue-400 hover:text-blue-300 transition-colors">Sync ↻</button>
                            </form>
                        @endif
                    </div>
                </div>
            @empty
                @include('components.empty-state', ['message' => 'No bank connections configured'])
            @endforelse
        </div>
    </div>
</div>
@endsection
