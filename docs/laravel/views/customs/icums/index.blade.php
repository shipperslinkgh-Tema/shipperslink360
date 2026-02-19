@extends('layouts.app')
@section('title', 'ICUMS Declarations')
@section('page-title', 'ICUMS Declarations')

@section('content')
<div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div>
        <h1 class="text-xl font-bold text-white">ICUMS Declarations</h1>
        <p class="text-sm text-gray-400 mt-0.5">Integrated Customs Management System filings</p>
    </div>
    <a href="{{ route('icums.create') }}" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
        + New Filing
    </a>
</div>

{{-- Filters --}}
<form method="GET" class="flex flex-wrap gap-3 mb-4">
    <input type="text" name="search" value="{{ request('search') }}" placeholder="Search entry number, BL, customer…"
           class="flex-1 min-w-48 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
    <select name="status" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Statuses</option>
        @foreach(['draft','submitted','under_examination','duty_assessed','released','rejected'] as $s)
            <option value="{{ $s }}" {{ request('status') === $s ? 'selected' : '' }}>{{ ucwords(str_replace('_',' ',$s)) }}</option>
        @endforeach
    </select>
    <button type="submit" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">Filter</button>
</form>

{{-- Table --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">Entry No.</th>
                <th class="px-6 py-3 text-left font-medium hidden md:table-cell">BL Number</th>
                <th class="px-6 py-3 text-left font-medium">Customer</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Duty (GHS)</th>
                <th class="px-6 py-3 text-left font-medium hidden lg:table-cell">Filed</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
                <th class="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($declarations ?? [] as $decl)
                <tr class="hover:bg-gray-800/40 transition-colors">
                    <td class="px-6 py-4 font-mono text-xs text-blue-400">{{ $decl->entry_number ?? '—' }}</td>
                    <td class="px-6 py-4 font-mono text-xs text-gray-300 hidden md:table-cell">{{ $decl->bl_number }}</td>
                    <td class="px-6 py-4 text-white">{{ $decl->customer_name }}</td>
                    <td class="px-6 py-4 text-white hidden lg:table-cell">{{ number_format($decl->total_duty ?? 0, 2) }}</td>
                    <td class="px-6 py-4 text-gray-400 text-xs hidden lg:table-cell">{{ $decl->filed_date ? \Carbon\Carbon::parse($decl->filed_date)->format('d M Y') : '—' }}</td>
                    <td class="px-6 py-4">@include('components.badge', ['status' => $decl->status, 'type' => 'icums'])</td>
                    <td class="px-6 py-4 text-right">
                        <a href="{{ route('icums.show', $decl) }}" class="text-xs text-blue-400 hover:text-blue-300">View →</a>
                    </td>
                </tr>
            @empty
                <tr><td colspan="7">@include('components.empty-state', ['message' => 'No ICUMS declarations found'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>
@if(isset($declarations)) <div class="mt-4">{{ $declarations->withQueryString()->links('components.pagination') }}</div> @endif
@endsection
