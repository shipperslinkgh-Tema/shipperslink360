<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>@yield('title', 'Client Portal — SLAC FreightLink 360')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('styles')
</head>
<body class="h-full bg-gray-950 text-gray-100 font-sans antialiased">

    {{-- Client inactivity timeout: 30 minutes --}}
    <meta name="inactivity-timeout" content="1800" />

    <div class="flex h-full" x-data="{ sidebarOpen: false }">

        {{-- Mobile overlay --}}
        <div x-show="sidebarOpen"
             x-transition.opacity
             class="fixed inset-0 bg-black/60 z-20 lg:hidden"
             @click="sidebarOpen = false"></div>

        {{-- Client sidebar --}}
        <aside class="fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 lg:translate-x-0"
               :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'">

            {{-- Brand --}}
            <div class="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
                <div class="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">S</div>
                <div>
                    <p class="font-semibold text-sm text-white">SLAC FreightLink</p>
                    <p class="text-xs text-gray-400">Client Portal</p>
                </div>
            </div>

            {{-- Client info --}}
            <div class="px-6 py-4 border-b border-gray-800">
                <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Logged in as</p>
                <p class="text-sm font-medium text-white">{{ Auth::user()->clientProfile?->contact_name }}</p>
                <p class="text-xs text-gray-400">{{ Auth::user()->clientProfile?->company_name }}</p>
            </div>

            {{-- Navigation --}}
            <nav class="flex-1 px-4 py-4 space-y-1">
                @php
                    $clientNav = [
                        ['route' => 'client.dashboard', 'icon' => '◉', 'label' => 'Dashboard'],
                        ['route' => 'client.shipments.index', 'icon' => '🚢', 'label' => 'My Shipments'],
                        ['route' => 'client.invoices.index', 'icon' => '📄', 'label' => 'Invoices'],
                        ['route' => 'client.documents.index', 'icon' => '📁', 'label' => 'Documents'],
                        ['route' => 'client.messages.index', 'icon' => '💬', 'label' => 'Messages'],
                    ];
                @endphp
                @foreach($clientNav as $item)
                    <a href="{{ route($item['route']) }}"
                       class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                              {{ request()->routeIs($item['route']) ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800' }}">
                        <span class="text-base">{{ $item['icon'] }}</span>
                        {{ $item['label'] }}
                    </a>
                @endforeach
            </nav>

            {{-- Logout --}}
            <div class="p-4 border-t border-gray-800">
                <form method="POST" action="{{ route('client.logout') }}">
                    @csrf
                    <button type="submit"
                            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <span>⇠</span> Sign Out
                    </button>
                </form>
            </div>
        </aside>

        {{-- Main --}}
        <div class="flex flex-col flex-1 lg:pl-64 overflow-hidden">
            {{-- Top bar --}}
            <header class="flex items-center justify-between px-6 h-14 bg-gray-900/80 backdrop-blur border-b border-gray-800 sticky top-0 z-10">
                <button @click="sidebarOpen = true" class="lg:hidden text-gray-400 hover:text-white">☰</button>
                <div class="flex items-center gap-2 ml-auto">
                    <span class="text-xs text-gray-500">Customer ID:</span>
                    <span class="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                        {{ Auth::user()->clientProfile?->customer_id }}
                    </span>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto p-6">
                @if(session('success'))
                    <div class="mb-4">@include('components.alert', ['type' => 'success', 'message' => session('success')])</div>
                @endif
                @yield('content')
            </main>
        </div>
    </div>

    @stack('scripts')
    <script>
        (function () {
            const TIMEOUT = 1800000; // 30 min
            let timer;
            const reset = () => { clearTimeout(timer); timer = setTimeout(() => window.location.href = '/portal/login?reason=inactivity', TIMEOUT); };
            ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(e => document.addEventListener(e, reset, true));
            reset();
        })();
    </script>
</body>
</html>
