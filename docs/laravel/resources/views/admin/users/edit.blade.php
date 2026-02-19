@extends('layouts.app')
@section('title', 'Edit User')
@section('content')
<div class="max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-foreground">Edit User: {{ $user->profile?->full_name }}</h1>
    <form action="{{ route('admin.users.update', $user) }}" method="POST" class="space-y-6">
        @csrf @method('PUT')
        <div class="rounded-xl border border-border bg-card p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2">
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Full Name *</label>
                    <input type="text" name="full_name" value="{{ old('full_name', $user->profile?->full_name) }}" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                    <input type="text" name="phone" value="{{ old('phone', $user->profile?->phone) }}" class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                </div>
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Department *</label>
                    <select name="department" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        @foreach($departments as $key => $label)
                        <option value="{{ $key }}" {{ $user->profile?->department === $key ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-muted-foreground mb-1">Role *</label>
                    <select name="role" required class="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        @foreach($roles as $key => $label)
                        <option value="{{ $key }}" {{ $user->profile?->role === $key ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                    </select>
                </div>
            </div>
        </div>
        <div class="flex gap-3 justify-end">
            <a href="{{ route('admin.users.index') }}" class="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:bg-muted/50">Cancel</a>
            <button type="submit" class="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Update User</button>
        </div>
    </form>
</div>
@endsection
