<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>@yield('title', 'SLAC FreightLink 360')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @stack('styles')
</head>
<body class="h-full bg-gray-950 text-gray-100 font-sans antialiased">

    {{-- Inactivity timeout: 15 minutes --}}
    <meta name="inactivity-timeout" content="900" />

    <div class="flex h-full" x-data="{ sidebarOpen: false }">

        {{-- Mobile sidebar overlay --}}
        <div x-show="sidebarOpen"
             x-transition:enter="transition-opacity ease-linear duration-300"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-100"
             x-transition:leave="transition-opacity ease-linear duration-300"
             x-transition:leave-start="opacity-100"
             x-transition:leave-end="opacity-0"
             class="fixed inset-0 bg-black/60 z-20 lg:hidden"
             @click="sidebarOpen = false">
        </div>

        {{-- Sidebar --}}
        @include('layouts.partials.sidebar')

        {{-- Main content area --}}
        <div class="flex flex-col flex-1 overflow-hidden">
            @include('layouts.partials.topbar')

            {{-- Flash messages --}}
            @if(session('success'))
                <div class="mx-6 mt-4">
                    @include('components.alert', ['type' => 'success', 'message' => session('success')])
                </div>
            @endif
            @if(session('error'))
                <div class="mx-6 mt-4">
                    @include('components.alert', ['type' => 'error', 'message' => session('error')])
                </div>
            @endif

            <main class="flex-1 overflow-y-auto p-6">
                @yield('content')
            </main>
        </div>
    </div>

    @stack('scripts')

    {{-- Inactivity logout script --}}
    <script>
        (function () {
            const TIMEOUT = parseInt(document.querySelector('meta[name="inactivity-timeout"]').content) * 1000;
            let timer;
            const reset = () => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    fetch('/api/v1/auth/logout', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content } })
                        .finally(() => window.location.href = '/login?reason=inactivity');
                }, TIMEOUT);
            };
            ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'].forEach(e => document.addEventListener(e, reset, true));
            reset();
        })();
    </script>
</body>
</html>
