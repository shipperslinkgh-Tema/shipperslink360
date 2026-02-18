@extends('layouts.app')

@section('title', 'Staff Users')
@section('page-title', 'Staff User Management')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-xl font-bold text-white">Staff Users</h1>
        <p class="text-sm text-gray-400 mt-1">{{ $users->total() }} total users</p>
    </div>
    <a href="{{ route('admin.users.create') }}"
       class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow shadow-blue-600/20">
        + Add User
    </a>
</div>

{{-- Filters --}}
<form method="GET" class="flex flex-wrap gap-3 mb-6">
    <input type="text" name="search" value="{{ request('search') }}"
           placeholder="Search by name or email…"
           class="flex-1 min-w-48 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
    <select name="department"
            class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Departments</option>
        @foreach(['operations','documentation','accounts','marketing','customer_service','warehouse','management','super_admin'] as $d)
            <option value="{{ $d }}" {{ request('department') === $d ? 'selected' : '' }}>{{ ucwords(str_replace('_',' ',$d)) }}</option>
        @endforeach
    </select>
    <button type="submit" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">Filter</button>
    <a href="{{ route('admin.users.index') }}" class="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors">Reset</a>
</form>

{{-- Table --}}
<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">User</th>
                <th class="px-6 py-3 text-left font-medium">Staff ID</th>
                <th class="px-6 py-3 text-left font-medium">Department</th>
                <th class="px-6 py-3 text-left font-medium">Role</th>
                <th class="px-6 py-3 text-left font-medium">Status</th>
                <th class="px-6 py-3 text-left font-medium">Last Login</th>
                <th class="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($users as $user)
                @php $profile = $user->profile; @endphp
                <tr class="hover:bg-gray-800/40 transition-colors">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {{ strtoupper(substr($profile?->full_name ?? 'U', 0, 1)) }}
                            </div>
                            <div>
                                <p class="font-medium text-white">{{ $profile?->full_name }}</p>
                                <p class="text-xs text-gray-400">{{ $user->email }}</p>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-gray-300 font-mono text-xs">{{ $profile?->staff_id }}</td>
                    <td class="px-6 py-4 text-gray-300 capitalize">{{ str_replace('_', ' ', $profile?->department) }}</td>
                    <td class="px-6 py-4">
                        @include('components.badge', ['status' => $user->getRole(), 'type' => 'role'])
                    </td>
                    <td class="px-6 py-4">
                        @if($profile?->is_locked)
                            <span class="inline-flex items-center gap-1 text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">🔒 Locked</span>
                        @elseif(!$profile?->is_active)
                            <span class="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full">Inactive</span>
                        @else
                            <span class="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">● Active</span>
                        @endif
                    </td>
                    <td class="px-6 py-4 text-gray-400 text-xs">
                        {{ $profile?->last_login_at ? \Carbon\Carbon::parse($profile->last_login_at)->diffForHumans() : 'Never' }}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-2">
                            <a href="{{ route('admin.users.show', $user) }}"
                               class="text-xs text-blue-400 hover:text-blue-300 transition-colors">View</a>
                            @if($profile?->is_locked)
                                <form method="POST" action="{{ route('admin.users.unlock', $user) }}" class="inline">
                                    @csrf
                                    <button class="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">Unlock</button>
                                </form>
                            @else
                                <form method="POST" action="{{ route('admin.users.lock', $user) }}" class="inline"
                                      onsubmit="return confirm('Lock {{ $profile?->full_name }}?')">
                                    @csrf
                                    <button class="text-xs text-red-400 hover:text-red-300 transition-colors">Lock</button>
                                </form>
                            @endif
                        </div>
                    </td>
                </tr>
            @empty
                <tr><td colspan="7">@include('components.empty-state', ['message' => 'No users found'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $users->withQueryString()->links('components.pagination') }}</div>
@endsection
