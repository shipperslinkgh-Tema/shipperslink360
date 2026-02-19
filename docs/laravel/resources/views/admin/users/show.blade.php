@extends('layouts.app')

@section('title', 'User: ' . $profile->full_name)

@section('content')
<div class="space-y-6">

    {{-- Header --}}
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <a href="{{ route('admin.users.index') }}" class="btn-ghost">← Back</a>
            <div>
                <h1 class="text-2xl font-bold text-white">{{ $profile->full_name }}</h1>
                <p class="text-sm text-gray-400">{{ $profile->staff_id }} · {{ ucwords(str_replace('_', ' ', $profile->department)) }}</p>
            </div>
        </div>
        <div class="flex items-center gap-3">
            <a href="{{ route('admin.users.edit', $user) }}" class="btn-secondary">Edit Profile</a>
            @if($profile->is_locked)
            <form method="POST" action="{{ route('admin.users.unlock', $user) }}">
                @csrf @method('PATCH')
                <button class="btn-primary">Unlock Account</button>
            </form>
            @else
            <form method="POST" action="{{ route('admin.users.lock', $user) }}"
                  onsubmit="return confirm('Lock this account?')">
                @csrf @method('PATCH')
                <button class="btn-danger">Lock Account</button>
            </form>
            @endif
        </div>
    </div>

    <div class="grid grid-cols-12 gap-6">

        {{-- Profile Card --}}
        <div class="col-span-12 lg:col-span-4">
            <div class="card p-6 text-center space-y-4">
                {{-- Avatar --}}
                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-3xl font-bold text-white mx-auto">
                    {{ strtoupper(substr($profile->full_name, 0, 1)) }}
                </div>
                <div>
                    <h2 class="text-xl font-bold text-white">{{ $profile->full_name }}</h2>
                    <p class="text-gray-400 text-sm">{{ $user->email }}</p>
                </div>
                {{-- Badges --}}
                <div class="flex flex-wrap gap-2 justify-center">
                    <span class="badge bg-blue-500/20 text-blue-400">
                        {{ ucwords(str_replace('_', ' ', $profile->department)) }}
                    </span>
                    <span class="badge bg-purple-500/20 text-purple-400">
                        {{ ucwords(str_replace('_', ' ', $profile->role ?? 'staff')) }}
                    </span>
                    @if($profile->is_active)
                        <span class="badge bg-green-500/20 text-green-400">Active</span>
                    @else
                        <span class="badge bg-red-500/20 text-red-400">Inactive</span>
                    @endif
                    @if($profile->is_locked)
                        <span class="badge bg-red-500/20 text-red-400">🔒 Locked</span>
                    @endif
                </div>
                {{-- Stats --}}
                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div>
                        <p class="text-xs text-gray-500">Last Login</p>
                        <p class="text-sm text-white mt-0.5">
                            {{ $profile->last_login_at ? \Carbon\Carbon::parse($profile->last_login_at)->diffForHumans() : 'Never' }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Member Since</p>
                        <p class="text-sm text-white mt-0.5">
                            {{ \Carbon\Carbon::parse($profile->created_at)->format('M Y') }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Failed Logins</p>
                        <p class="text-sm {{ $profile->failed_login_attempts >= 3 ? 'text-red-400' : 'text-white' }} mt-0.5">
                            {{ $profile->failed_login_attempts }}
                        </p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Must Change Pwd</p>
                        <p class="text-sm mt-0.5 {{ $profile->must_change_password ? 'text-amber-400' : 'text-green-400' }}">
                            {{ $profile->must_change_password ? 'Yes' : 'No' }}
                        </p>
                    </div>
                </div>
            </div>

            {{-- Quick Actions --}}
            <div class="card p-4 mt-4 space-y-2">
                <h3 class="text-sm font-semibold text-gray-300 mb-3">Quick Actions</h3>
                <form method="POST" action="{{ route('admin.users.reset-password', $user) }}">
                    @csrf @method('PATCH')
                    <button class="btn-ghost w-full justify-start text-sm">
                        🔑 Force Password Reset
                    </button>
                </form>
                <form method="POST" action="{{ route('admin.users.toggle-active', $user) }}">
                    @csrf @method('PATCH')
                    <button class="btn-ghost w-full justify-start text-sm {{ $profile->is_active ? 'text-red-400' : 'text-green-400' }}">
                        {{ $profile->is_active ? '⏸ Deactivate Account' : '▶ Activate Account' }}
                    </button>
                </form>
            </div>
        </div>

        {{-- Details & Activity --}}
        <div class="col-span-12 lg:col-span-8 space-y-6">

            {{-- Contact Info --}}
            <div class="card p-6">
                <h2 class="text-base font-semibold text-white mb-4">Contact Information</h2>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p class="text-gray-500">Staff ID</p>
                        <p class="text-white font-mono mt-1">{{ $profile->staff_id }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">Username</p>
                        <p class="text-white font-mono mt-1">{{ $profile->username }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">Email</p>
                        <p class="text-white mt-1">{{ $user->email }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">Phone</p>
                        <p class="text-white mt-1">{{ $profile->phone ?? '—' }}</p>
                    </div>
                </div>
            </div>

            {{-- Login History --}}
            <div class="card overflow-hidden">
                <div class="px-6 py-4 border-b border-white/10">
                    <h2 class="text-base font-semibold text-white">Recent Login History</h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-white/10">
                                <th class="th">Date/Time</th>
                                <th class="th">IP Address</th>
                                <th class="th">Result</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            @forelse($loginHistory as $log)
                            <tr>
                                <td class="td text-gray-300">{{ \Carbon\Carbon::parse($log->login_at)->format('d M Y H:i') }}</td>
                                <td class="td font-mono text-gray-400 text-xs">{{ $log->ip_address ?? '—' }}</td>
                                <td class="td">
                                    @if($log->success)
                                        <span class="badge bg-green-500/20 text-green-400 text-xs">Success</span>
                                    @else
                                        <span class="badge bg-red-500/20 text-red-400 text-xs">Failed</span>
                                    @endif
                                </td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="3" class="td text-center text-gray-500 py-8">No login history found</td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>

            {{-- Audit Log --}}
            <div class="card overflow-hidden">
                <div class="px-6 py-4 border-b border-white/10">
                    <h2 class="text-base font-semibold text-white">Recent Activity</h2>
                </div>
                <div class="divide-y divide-white/5">
                    @forelse($auditLogs as $log)
                    <div class="px-6 py-3 flex items-start gap-4">
                        <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm text-white">{{ ucwords(str_replace('_', ' ', $log->action)) }}</p>
                            <p class="text-xs text-gray-500 mt-0.5">{{ \Carbon\Carbon::parse($log->created_at)->diffForHumans() }}</p>
                        </div>
                    </div>
                    @empty
                    <div class="px-6 py-8 text-center text-gray-500 text-sm">No activity recorded</div>
                    @endforelse
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
