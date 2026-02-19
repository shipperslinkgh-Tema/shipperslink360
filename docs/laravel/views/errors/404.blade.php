<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>404 — Not Found | SLAC FreightLink 360</title>
    @vite(['resources/css/app.css'])
</head>
<body class="h-full bg-gray-950 text-gray-100 flex items-center justify-center">
    <div class="text-center max-w-md px-6">
        <div class="text-8xl font-black text-blue-500/20 mb-4">404</div>
        <h1 class="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p class="text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <a href="{{ route('dashboard') }}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Back to Dashboard
        </a>
    </div>
</body>
</html>
