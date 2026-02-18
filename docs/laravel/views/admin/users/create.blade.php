@extends('layouts.app')

@section('title', 'Create Staff User')
@section('page-title', 'Create Staff User')

@section('content')
<div class="max-w-2xl">
    <div class="mb-6">
        <a href="{{ route('admin.users.index') }}" class="text-sm text-gray-400 hover:text-white transition-colors">← Back to Users</a>
    </div>

    <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 class="text-lg font-semibold text-white mb-6">New Staff Account</h2>

        <form method="POST" action="{{ route('admin.users.store') }}" class="space-y-5">
            @csrf

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {{-- Full name --}}
                <div class="space-y-1.5 sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-300">Full name <span class="text-red-400">*</span></label>
                    <input type="text" name="full_name" value="{{ old('full_name') }}" required
                           class="w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 {{ $errors->has('full_name') ? 'border-red-500' : 'border-gray-700' }}" />
                    @error('full_name') <p class="text-xs text-red-400">{{ $message }}</p> @enderror
                </div>

                {{-- Email --}}
                <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-gray-300">Email address <span class="text-red-400">*</span></label>
                    <input type="email" name="email" value="{{ old('email') }}" required
                           class="w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 {{ $errors->has('email') ? 'border-red-500' : 'border-gray-700' }}" />
                    @error('email') <p class="text-xs text-red-400">{{ $message }}</p> @enderror
                </div>

                {{-- Username --}}
                <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-gray-300">Username <span class="text-red-400">*</span></label>
                    <input type="text" name="username" value="{{ old('username') }}" required
                           class="w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 {{ $errors->has('username') ? 'border-red-500' : 'border-gray-700' }}" />
                    @error('username') <p class="text-xs text-red-400">{{ $message }}</p> @enderror
                </div>

                {{-- Staff ID --}}
                <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-gray-300">Staff ID <span class="text-red-400">*</span></label>
                    <input type="text" name="staff_id" value="{{ old('staff_id') }}" required placeholder="OPS-001"
                           class="w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 {{ $errors->has('staff_id') ? 'border-red-500' : 'border-gray-700' }}" />
                    @error('staff_id') <p class="text-xs text-red-400">{{ $message }}</p> @enderror
                </div>

                {{-- Phone --}}
                <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-gray-300">Phone</label>
                    <input type="tel" name="phone" value="{{ old('phone') }}" placeholder="+233 XX XXX XXXX"
                           class="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {{-- Department --}}
                <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-gray-300">Department <span class="text-red-400">*</span></label>
                    <select name="department" required
                            class="w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 {{ $errors->has('department') ? 'border-red-500' : 'border-gray-700' }}">
                        <option value="">Select department…</option>
                        @foreach(['operations','documentation','accounts','marketing','customer_service','warehouse','management'] as $d)
                            <option value="{{ $d }}" {{ old('department') === $d ? 'selected' : '' }}>{{ ucwords(str_replace('_',' ',$d)) }}</option>
                        @endforeach
                    </select>
                    @error('department') <p class="text-xs text-red-400">{{ $message }}</p> @enderror
                </div>

                {{-- Role --}}
                <div class="space-y-1.5">
                    <label class="block text-sm font-medium text-gray-300">Role <span class="text-red-400">*</span></label>
                    <select name="role" required
                            class="w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 {{ $errors->has('role') ? 'border-red-500' : 'border-gray-700' }}">
                        <option value="">Select role…</option>
                        @foreach(['staff' => 'Staff', 'manager' => 'Manager', 'admin' => 'Admin'] as $val => $label)
                            <option value="{{ $val }}" {{ old('role') === $val ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                        @if(Auth::user()?->isSuperAdmin())
                            <option value="super_admin" {{ old('role') === 'super_admin' ? 'selected' : '' }}>Super Admin</option>
                        @endif
                    </select>
                    @error('role') <p class="text-xs text-red-400">{{ $message }}</p> @enderror
                </div>
            </div>

            {{-- Info note --}}
            <div class="flex items-start gap-3 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <span class="text-blue-400 text-sm flex-shrink-0">ℹ</span>
                <p class="text-xs text-blue-300">
                    A temporary password will be auto-generated and displayed once. The user will be required to change it on first login.
                </p>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <button type="submit"
                        class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
                    Create account
                </button>
                <a href="{{ route('admin.users.index') }}" class="px-5 py-2.5 text-gray-400 hover:text-white text-sm transition-colors">Cancel</a>
            </div>
        </form>
    </div>
</div>
@endsection
