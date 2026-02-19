@extends('layouts.app')
@section('title', 'New Customer')
@section('page-title', 'New Customer')

@section('content')
<div class="max-w-2xl mx-auto">
    <div class="flex items-center gap-4 mb-6">
        <a href="{{ route('customers.index') }}" class="text-gray-400 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </a>
        <h1 class="text-xl font-bold text-white">New Customer</h1>
    </div>

    <form method="POST" action="{{ route('customers.store') }}" class="space-y-6">
        @csrf

        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 class="text-sm font-semibold text-white">Company Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                    <label class="block text-xs text-gray-400 mb-1.5">Company Name <span class="text-red-400">*</span></label>
                    <input type="text" name="company_name" value="{{ old('company_name') }}" required
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('company_name') <p class="text-red-400 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Customer Code</label>
                    <input type="text" name="customer_code" value="{{ old('customer_code') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="Auto-generated if empty">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Email <span class="text-red-400">*</span></label>
                    <input type="email" name="email" value="{{ old('email') }}" required
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    @error('email') <p class="text-red-400 text-xs mt-1">{{ $message }}</p> @enderror
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Contact Name</label>
                    <input type="text" name="contact_name" value="{{ old('contact_name') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">Phone</label>
                    <input type="text" name="phone" value="{{ old('phone') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1.5">TIN (Tax ID)</label>
                    <input type="text" name="tin" value="{{ old('tin') }}"
                           class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs text-gray-400 mb-1.5">Address</label>
                    <textarea name="address" rows="2" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">{{ old('address') }}</textarea>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs text-gray-400 mb-1.5">Notes</label>
                    <textarea name="notes" rows="2" class="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">{{ old('notes') }}</textarea>
                </div>
            </div>
        </div>

        <div class="flex items-center justify-end gap-3">
            <a href="{{ route('customers.index') }}" class="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</a>
            <button type="submit" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
                Create Customer
            </button>
        </div>
    </form>
</div>
@endsection
