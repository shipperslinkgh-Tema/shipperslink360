@props(['label' => '', 'value' => '0', 'badge' => '', 'trend' => '', 'positive' => true])
<div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">{{ $label }}</p>
    <p class="text-2xl font-bold text-white">{{ $value }}</p>
    @if($trend)
        <p class="text-xs mt-2 {{ $positive ? 'text-emerald-400' : 'text-red-400' }}">{{ $trend }}</p>
    @endif
</div>
