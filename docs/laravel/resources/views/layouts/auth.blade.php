<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Login') · SLAC FreightLink 360</title>
    @vite(['resources/css/app.css'])
</head>
<body class="h-full bg-gray-950 flex items-center justify-center p-4">

    <div class="w-full max-w-md">
        {{-- Logo --}}
        <div class="text-center mb-8">
            <div class="inline-flex items-center gap-3 mb-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/>
                    </svg>
                </div>
                <div class="text-left">
                    <div class="text-xl font-black text-white tracking-tight">SLAC FreightLink</div>
                    <div class="text-xs text-blue-400 font-medium tracking-widest uppercase">360 Platform</div>
                </div>
            </div>
        </div>

        @yield('content')

        <p class="text-center text-xs text-gray-600 mt-6">
            &copy; {{ date('Y') }} SLAC Group. All rights reserved.
        </p>
    </div>

    @vite(['resources/js/app.js'])
</body>
</html>
