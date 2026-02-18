@php
    $unreadCount = \App\Models\AppNotification::where(function ($q) {
        $dept = Auth::user()?->getDepartment();
        $q->where('recipient_id', Auth::id())
          ->orWhere('recipient_department', $dept);
    })->where('is_read', false)->count();
@endphp

<div class="relative" x-data="{ open: false }" @click.away="open = false">
    <button @click="open = !open"
            class="relative p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        @if($unreadCount > 0)
            <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {{ $unreadCount > 9 ? '9+' : $unreadCount }}
            </span>
        @endif
    </button>

    <div x-show="open"
         x-transition:enter="transition ease-out duration-100"
         x-transition:enter-start="opacity-0 scale-95"
         x-transition:enter-end="opacity-100 scale-100"
         class="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-50">

        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <p class="text-sm font-semibold text-white">Notifications</p>
            @if($unreadCount > 0)
                <form action="{{ route('notifications.mark-all-read') }}" method="POST">
                    @csrf
                    <button class="text-xs text-blue-400 hover:text-blue-300 transition-colors">Mark all read</button>
                </form>
            @endif
        </div>

        <div class="max-h-72 overflow-y-auto divide-y divide-gray-800">
            @php
                $dept = Auth::user()?->getDepartment();
                $recent = \App\Models\AppNotification::where(function ($q) use ($dept) {
                    $q->where('recipient_id', Auth::id())->orWhere('recipient_department', $dept);
                })->orderByDesc('created_at')->take(8)->get();
            @endphp

            @forelse($recent as $n)
                <div class="px-4 py-3 {{ $n->is_read ? 'opacity-60' : '' }} hover:bg-gray-800/50 transition-colors">
                    <div class="flex items-start gap-3">
                        <span class="mt-0.5 flex-shrink-0 w-2 h-2 rounded-full {{ $n->priority === 'critical' ? 'bg-red-500' : ($n->priority === 'high' ? 'bg-orange-500' : 'bg-blue-500') }}"></span>
                        <div class="min-w-0 flex-1">
                            <p class="text-xs font-medium text-white truncate">{{ $n->title }}</p>
                            <p class="text-xs text-gray-400 mt-0.5 line-clamp-2">{{ $n->message }}</p>
                            <p class="text-xs text-gray-600 mt-1">{{ $n->created_at->diffForHumans() }}</p>
                        </div>
                    </div>
                </div>
            @empty
                <div class="px-4 py-8 text-center">
                    <p class="text-sm text-gray-500">No notifications</p>
                </div>
            @endforelse
        </div>

        <a href="{{ route('notifications.index') }}"
           class="block text-center text-xs text-blue-400 hover:text-blue-300 px-4 py-3 border-t border-gray-800 transition-colors">
            View all notifications →
        </a>
    </div>
</div>
