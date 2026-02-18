@props(['message' => 'No data found', 'icon' => '📭'])
<div class="flex flex-col items-center justify-center py-10 text-center">
    <span class="text-3xl mb-3">{{ $icon }}</span>
    <p class="text-sm text-gray-500">{{ $message }}</p>
</div>
