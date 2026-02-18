<header class="flex items-center justify-between px-6 h-14 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10 lg:pl-64">
    {{-- Mobile hamburger --}}
    <button @click="sidebarOpen = true" class="lg:hidden text-gray-400 hover:text-white p-1 rounded transition-colors">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
    </button>

    {{-- Page title --}}
    <h2 class="text-sm font-semibold text-white hidden lg:block">@yield('page-title')</h2>

    {{-- Right side --}}
    <div class="flex items-center gap-3 ml-auto">

        {{-- Department badge --}}
        <span class="hidden sm:block text-xs font-medium capitalize px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
            {{ str_replace('_', ' ', Auth::user()?->getDepartment() ?? '') }}
        </span>

        {{-- Notifications bell --}}
        @include('layouts.partials.notifications-dropdown')

        {{-- Avatar --}}
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold cursor-pointer select-none"
             title="{{ Auth::user()?->profile?->full_name }}">
            {{ strtoupper(substr(Auth::user()?->profile?->full_name ?? 'U', 0, 1)) }}
        </div>
    </div>
</header>
