<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') · SLAC FreightLink 360</title>

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    {{-- Pusher keys for Echo --}}
    <script>
        window.PUSHER_APP_KEY     = "{{ config('broadcasting.connections.pusher.key') }}";
        window.PUSHER_APP_CLUSTER = "{{ config('broadcasting.connections.pusher.options.cluster', 'mt1') }}";
        window.AUTH_USER_ID       = {{ auth()->id() ?? 'null' }};
        window.AUTH_USER_NAME     = "{{ auth()->user()?->profile?->full_name ?? '' }}";
    </script>

    @stack('head')
</head>
<body class="h-full bg-gray-950 text-gray-100 antialiased" x-data>

    <div class="flex h-full">

        {{-- Sidebar --}}
        @include('layouts.partials.sidebar')

        {{-- Main Content --}}
        <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

            {{-- Topbar --}}
            @include('layouts.partials.topbar')

            {{-- Flash Messages --}}
            @include('layouts.partials.flash-messages')

            {{-- Page Content --}}
            <main class="flex-1 overflow-y-auto p-6">
                @yield('content')
            </main>

        </div>
    </div>

    {{-- Chat Widget --}}
    @include('partials.chat-widget')

    @stack('scripts')
</body>
</html>
