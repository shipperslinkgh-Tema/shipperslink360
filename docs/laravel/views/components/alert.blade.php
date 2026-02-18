@props(['type' => 'success', 'message' => ''])
@php
    $styles = [
        'success' => 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
        'error'   => 'bg-red-500/10 border-red-500/30 text-red-300',
        'warning' => 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        'info'    => 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    ];
    $icons = ['success' => '✓', 'error' => '✕', 'warning' => '⚠', 'info' => 'ℹ'];
@endphp
<div class="flex items-start gap-3 px-4 py-3 rounded-lg border text-sm {{ $styles[$type] ?? $styles['info'] }}">
    <span class="flex-shrink-0 font-bold">{{ $icons[$type] ?? 'ℹ' }}</span>
    <p>{{ $message }}</p>
</div>
