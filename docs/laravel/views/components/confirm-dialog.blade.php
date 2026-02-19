{{--
    Confirm Dialog – lightweight delete/action confirmation
    Usage: @include('components.confirm-dialog', ['id' => 'deleteShipment', 'action' => route('shipments.destroy', $id), 'message' => 'Delete this shipment?'])
--}}
<div
    x-data="{ show: false, formAction: '' }"
    x-on:open-confirm-{{ $id ?? 'dialog' }}.window="show = true; formAction = $event.detail.action ?? '{{ $action ?? '' }}'"
    x-on:keydown.escape.window="show = false"
    x-show="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="display: none;"
>
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm" x-on:click="show = false"></div>

    <div
        class="relative bg-gray-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-sm p-6"
        x-on:click.stop
        x-transition:enter="ease-out duration-200"
        x-transition:enter-start="opacity-0 scale-95"
        x-transition:enter-end="opacity-100 scale-100"
    >
        <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.07 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
            </div>
            <div>
                <h3 class="text-lg font-semibold text-white">{{ $title ?? 'Confirm Action' }}</h3>
                <p class="text-sm text-gray-400 mt-1">{{ $message ?? 'Are you sure you want to proceed?' }}</p>
            </div>
        </div>

        <form :action="formAction" method="POST" class="flex justify-end gap-3">
            @csrf
            @method($method ?? 'DELETE')
            <button type="button" x-on:click="show = false" class="btn-ghost">Cancel</button>
            <button type="submit" class="btn-danger">{{ $confirmLabel ?? 'Delete' }}</button>
        </form>
    </div>
</div>
