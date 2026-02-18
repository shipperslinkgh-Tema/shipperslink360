<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <title>@yield('title', 'Sign In') — SLAC FreightLink 360</title>
    @vite(['resources/css/app.css'])
</head>
<body class="h-full bg-gray-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">

        {{-- Brand mark --}}
        <div class="flex flex-col items-center mb-8">
            <div class="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl mb-3 shadow-lg shadow-blue-600/30">S</div>
            <h1 class="text-xl font-bold text-white">SLAC FreightLink 360</h1>
            <p class="text-sm text-gray-400 mt-1">@yield('subtitle', 'Staff Portal')</p>
        </div>

        {{-- Card --}}
        <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
            @if(session('error'))
                @include('components.alert', ['type' => 'error', 'message' => session('error')])
                <div class="mb-4"></div>
            @endif
            @if(request('reason') === 'inactivity')
                @include('components.alert', ['type' => 'warning', 'message' => 'You were signed out due to inactivity.'])
                <div class="mb-4"></div>
            @endif

            @yield('content')
        </div>

        <p class="text-center text-xs text-gray-600 mt-6">
            &copy; {{ date('Y') }} SLAC Shippers Link Africa Ltd. All rights reserved.
        </p>
    </div>
</body>
</html>
