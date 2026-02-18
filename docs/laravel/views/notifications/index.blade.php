@extends('layouts.app')

@section('title', 'Notifications')
@section('page-title', 'Notifications')

@section('content')
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-xl font-bold text-white">Notifications</h1>
        <p class="text-sm text-gray-400 mt-1">{{ $notifications->total() }} total · {{ $unreadCount }} unread</p>
    </div>
    @if($unreadCount > 0)
        <form method="POST" action="{{ route('notifications.mark-all-read') }}">
            @csrf
            <button class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-colors">
                Mark all read
            </button>
        </form>
    @endif
</div>

{{-- Priority filter --}}
<div class="flex gap-2 mb-6 flex-wrap">
    @foreach(['all' => 'All', 'critical' => 'Critical', 'high' => 'High', 'medium' => 'Medium', 'low' => 'Low'] as $p => $label)
        <a href="{{ route('notifications.index', array_merge(request()->query(), ['priority' => $p === 'all' ? null : $p])) }}"
           class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
                  {{ (request('priority', 'all') === $p) ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700' }}">
            {{ $label }}
        </a>
    @endforeach
</div>

{{-- List --}}
<div class="space-y-2">
    @forelse($notifications as $n)
        <div class="flex items-start gap-4 px-6 py-4 bg-gray-900 border border-gray-800 rounded-xl transition-all
                    {{ !$n->is_read ? 'border-l-2 ' . ($n->priority === 'critical' ? 'border-l-red-500' : ($n->priority === 'high' ? 'border-l-orange-500' : 'border-l-blue-500')) : '' }}
                    {{ $n->is_read ? 'opacity-70' : '' }}">

            {{-- Priority dot --}}
            <div class="flex-shrink-0 mt-1.5">
                <span class="block w-2 h-2 rounded-full
                    {{ $n->priority === 'critical' ? 'bg-red-500' : ($n->priority === 'high' ? 'bg-orange-500' : ($n->priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500')) }}">
                </span>
            </div>

            {{-- Content --}}
            <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                    <div>
                        <p class="text-sm font-semibold text-white">{{ $n->title }}</p>
                        <p class="text-xs text-gray-400 mt-1 leading-relaxed">{{ $n->message }}</p>
                    </div>
                    <div class="flex-shrink-0 text-right">
                        <p class="text-xs text-gray-500">{{ $n->created_at->diffForHumans() }}</p>
                        @if($n->recipient_department)
                            <span class="text-xs text-gray-600 capitalize">{{ str_replace('_',' ',$n->recipient_department) }}</span>
                        @endif
                    </div>
                </div>

                {{-- Actions --}}
                <div class="flex items-center gap-3 mt-3">
                    @if($n->action_url)
                        <a href="{{ $n->action_url }}" class="text-xs text-blue-400 hover:text-blue-300 transition-colors">View →</a>
                    @endif
                    @if(!$n->is_read)
                        <form method="POST" action="{{ route('notifications.read', $n) }}" class="inline">
                            @csrf
                            <button class="text-xs text-gray-500 hover:text-gray-300 transition-colors">Mark read</button>
                        </form>
                    @endif
                    @if(!$n->is_resolved)
                        <form method="POST" action="{{ route('notifications.resolve', $n) }}" class="inline">
                            @csrf
                            <button class="text-xs text-gray-500 hover:text-emerald-400 transition-colors">Resolve</button>
                        </form>
                    @endif
                </div>
            </div>
        </div>
    @empty
        @include('components.empty-state', ['message' => 'No notifications yet', 'icon' => '🔔'])
    @endforelse
</div>

<div class="mt-4">{{ $notifications->withQueryString()->links('components.pagination') }}</div>
@endsection
