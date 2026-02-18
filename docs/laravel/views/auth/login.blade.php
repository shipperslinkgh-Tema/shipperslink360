@extends('layouts.auth')

@section('title', 'Sign In')
@section('subtitle', 'Staff Portal')

@section('content')
<form method="POST" action="{{ route('login') }}" class="space-y-5">
    @csrf

    <div>
        <h2 class="text-xl font-bold text-white">Welcome back</h2>
        <p class="text-sm text-gray-400 mt-1">Sign in to your staff account</p>
    </div>

    {{-- Email --}}
    <div class="space-y-1.5">
        <label for="email" class="block text-sm font-medium text-gray-300">Email address</label>
        <input type="email"
               id="email"
               name="email"
               value="{{ old('email') }}"
               required
               autofocus
               autocomplete="email"
               placeholder="you@shipperslink.com"
               class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white text-sm placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                      {{ $errors->has('email') ? 'border-red-500' : 'border-gray-700' }}" />
        @error('email')
            <p class="text-xs text-red-400 mt-1">{{ $message }}</p>
        @enderror
    </div>

    {{-- Password --}}
    <div class="space-y-1.5">
        <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
        <div class="relative" x-data="{ show: false }">
            <input :type="show ? 'text' : 'password'"
                   id="password"
                   name="password"
                   required
                   autocomplete="current-password"
                   placeholder="••••••••"
                   class="w-full px-4 py-2.5 pr-12 rounded-lg bg-gray-800 border text-white text-sm placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                          {{ $errors->has('password') ? 'border-red-500' : 'border-gray-700' }}" />
            <button type="button" @click="show = !show"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-xs select-none">
                <span x-text="show ? 'Hide' : 'Show'"></span>
            </button>
        </div>
        @error('password')
            <p class="text-xs text-red-400 mt-1">{{ $message }}</p>
        @enderror
    </div>

    {{-- Submit --}}
    <button type="submit"
            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900">
        Sign in →
    </button>

    {{-- Client portal link --}}
    <p class="text-center text-xs text-gray-500">
        Are you a client?
        <a href="{{ route('client.login') }}" class="text-blue-400 hover:text-blue-300 transition-colors">
            Access Client Portal →
        </a>
    </p>
</form>
@endsection
