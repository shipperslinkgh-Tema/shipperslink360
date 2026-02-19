<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>500 — Server Error | SLAC FreightLink 360</title>
    @vite(['resources/css/app.css'])
</head>
<body class="h-full bg-gray-950 text-gray-100 flex items-center justify-center">
    <div class="text-center max-w-md px-6">
        <div class="text-8xl font-black text-orange-500/20 mb-4">500</div>
        <h1 class="text-2xl font-bold text-white mb-2">Server Error</h1>
        <p class="text-gray-400 mb-8">Something went wrong on our end. Our team has been notified. Please try again in a few minutes.</p>
        <a href="{{ url()->previous('/') }}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            Try Again
        </a>
    </div>
</body>
</html>
