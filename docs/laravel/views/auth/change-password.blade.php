@extends('layouts.auth')

@section('title', 'Change Password')
@section('subtitle', 'Security Required')

@section('content')
<form method="POST" action="{{ route('auth.change-password') }}" class="space-y-5">
    @csrf

    <div>
        <h2 class="text-xl font-bold text-white">Set your password</h2>
        <p class="text-sm text-gray-400 mt-1">
            @if(auth()->user()?->profile?->must_change_password)
                Your account requires a password change before you can continue.
            @else
                Choose a strong password for your account.
            @endif
        </p>
    </div>

    {{-- Security notice --}}
    <div class="flex items-start gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <span class="text-amber-400 text-base flex-shrink-0 mt-0.5">⚠</span>
        <div class="text-xs text-amber-300 space-y-1">
            <p class="font-semibold">Password requirements:</p>
            <ul class="text-amber-400/80 space-y-0.5 list-disc list-inside">
                <li>Minimum 8 characters</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include at least one number</li>
            </ul>
        </div>
    </div>

    {{-- Current password --}}
    <div class="space-y-1.5">
        <label for="current_password" class="block text-sm font-medium text-gray-300">Current password</label>
        <input type="password"
               id="current_password"
               name="current_password"
               required
               class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white text-sm placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                      {{ $errors->has('current_password') ? 'border-red-500' : 'border-gray-700' }}" />
        @error('current_password')
            <p class="text-xs text-red-400">{{ $message }}</p>
        @enderror
    </div>

    {{-- New password --}}
    <div class="space-y-1.5">
        <label for="new_password" class="block text-sm font-medium text-gray-300">New password</label>
        <input type="password"
               id="new_password"
               name="new_password"
               required
               class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white text-sm placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
                      {{ $errors->has('new_password') ? 'border-red-500' : 'border-gray-700' }}" />
        @error('new_password')
            <p class="text-xs text-red-400">{{ $message }}</p>
        @enderror
    </div>

    {{-- Confirm --}}
    <div class="space-y-1.5">
        <label for="new_password_confirmation" class="block text-sm font-medium text-gray-300">Confirm new password</label>
        <input type="password"
               id="new_password_confirmation"
               name="new_password_confirmation"
               required
               class="w-full px-4 py-2.5 rounded-lg bg-gray-800 border text-white text-sm placeholder-gray-500
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition border-gray-700" />
    </div>

    <button type="submit"
            class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-blue-600/20">
        Update password →
    </button>
</form>
@endsection
