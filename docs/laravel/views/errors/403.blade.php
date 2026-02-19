<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>403 — Forbidden | SLAC FreightLink 360</title>
    @vite(['resources/css/app.css'])
</head>
<body class="h-full bg-gray-950 text-gray-100 flex items-center justify-center">
    <div class="text-center max-w-md px-6">
        <div class="text-8xl font-black text-red-500/20 mb-4">403</div>
        <h1 class="text-2xl font-bold text-white mb-2">Access Forbidden</h1>
        <p class="text-gray-400 mb-8">You don't have permission to access this page. Please contact your administrator if you believe this is an error.</p>
        <a href="{{ url()->previous('/') }}" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Go Back
        </a>
    </div>
</body>
</html>
