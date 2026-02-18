@extends('layouts.auth')

@section('title', 'Client Sign In')
@section('subtitle', 'Client Portal')

@section('content')
<form method="POST" action="{{ route('client.login') }}" class="space-y-5">
    @csrf

    <div>
        <h2 class="text-xl font-bold text-white">Client Portal</h2>
        <p class="text-sm text-gray-400 mt-1">Sign in to track your shipments and invoices</p>
    </div>

    <div class="space-y-1.5">
        <label for="email" class="block text-sm font-medium text-gray-300">Email address</label>
        <input type="email"
               id="email"
               name="email"
               value="{{ old('email') }}"
               required
               autofocus
               autocomplete="email"
               placeholder="your@company.com"
               class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white text-sm placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                      {{ $errors->has('email') ? 'border-red-500' : 'border-gray-700' }}" />
        @error('email')
            <p class="text-xs text-red-400">{{ $message }}</p>
        @enderror
    </div>

    <div class="space-y-1.5">
        <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
        <input type="password"
               id="password"
               name="password"
               required
               autocomplete="current-password"
               placeholder="••••••••"
               class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white text-sm placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                      {{ $errors->has('password') ? 'border-red-500' : 'border-gray-700' }}" />
        @error('password')
            <p class="text-xs text-red-400">{{ $message }}</p>
        @enderror
    </div>

    <button type="submit"
            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/20">
        Sign in →
    </button>

    <p class="text-center text-xs text-gray-500">
        Are you staff?
        <a href="{{ route('login') }}" class="text-blue-400 hover:text-blue-300 transition-colors">
            Go to Staff Portal →
        </a>
    </p>

    {{-- Support note --}}
    <p class="text-center text-xs text-gray-600 mt-4">
        Access issues? Contact your SLAC representative.
    </p>
</form>
@endsection
