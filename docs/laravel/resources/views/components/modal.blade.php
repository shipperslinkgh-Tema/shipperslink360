{{--
    Reusable Modal Component
    Usage: @include('components.modal', ['id' => 'myModal', 'title' => 'Title', 'size' => 'md'])
    Open via: $dispatch('open-modal', { name: 'myModal' })
--}}
<div
    x-data="{ show: false, name: '{{ $id ?? 'modal' }}' }"
    x-on:open-modal.window="if ($event.detail.name === name) show = true"
    x-on:close-modal.window="if ($event.detail.name === name) show = false"
    x-on:keydown.escape.window="show = false"
    x-show="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    style="display: none;"
>
    {{-- Backdrop --}}
    <div
        class="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        x-show="show"
        x-transition:enter="ease-out duration-200"
        x-transition:enter-start="opacity-0"
        x-transition:enter-end="opacity-100"
        x-transition:leave="ease-in duration-150"
        x-transition:leave-start="opacity-100"
        x-transition:leave-end="opacity-0"
        x-on:click="show = false"
    ></div>

    {{-- Panel --}}
    <div class="flex min-h-full items-center justify-center p-4">
        <div
            class="relative bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full transition-all
                   {{ match($size ?? 'md') {
                       'sm'  => 'max-w-sm',
                       'md'  => 'max-w-lg',
                       'lg'  => 'max-w-2xl',
                       'xl'  => 'max-w-4xl',
                       '2xl' => 'max-w-6xl',
                       default => 'max-w-lg',
                   } }}"
            x-show="show"
            x-transition:enter="ease-out duration-200"
            x-transition:enter-start="opacity-0 translate-y-4 scale-95"
            x-transition:enter-end="opacity-100 translate-y-0 scale-100"
            x-transition:leave="ease-in duration-150"
            x-transition:leave-start="opacity-100 translate-y-0 scale-100"
            x-transition:leave-end="opacity-0 translate-y-4 scale-95"
            x-on:click.stop
        >
            {{-- Header --}}
            @if(isset($title))
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h3 class="text-lg font-semibold text-white">{{ $title }}</h3>
                <button
                    type="button"
                    class="text-gray-400 hover:text-white transition-colors"
                    x-on:click="show = false"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            @endif

            {{-- Body --}}
            <div class="{{ isset($title) ? 'p-6' : 'p-6' }}">
                {{ $slot }}
            </div>
        </div>
    </div>
</div>
