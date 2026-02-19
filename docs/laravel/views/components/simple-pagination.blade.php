@if ($paginator->hasPages())
<nav class="flex items-center justify-between text-sm text-gray-400">
    <span>
        Showing {{ $paginator->firstItem() }} - {{ $paginator->lastItem() }} of {{ $paginator->total() }} results
    </span>
    <div class="flex items-center gap-1">
        {{-- Previous --}}
        @if ($paginator->onFirstPage())
            <span class="px-3 py-1.5 rounded-md bg-white/5 text-gray-600 cursor-not-allowed">‹</span>
        @else
            <a href="{{ $paginator->previousPageUrl() }}"
               class="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 transition-colors">‹</a>
        @endif

        {{-- Page Numbers --}}
        @foreach ($elements as $element)
            @if (is_string($element))
                <span class="px-3 py-1.5">{{ $element }}</span>
            @endif

            @if (is_array($element))
                @foreach ($element as $page => $url)
                    @if ($page == $paginator->currentPage())
                        <span class="px-3 py-1.5 rounded-md bg-blue-600 text-white font-medium">{{ $page }}</span>
                    @else
                        <a href="{{ $url }}"
                           class="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 transition-colors">{{ $page }}</a>
                    @endif
                @endforeach
            @endif
        @endforeach

        {{-- Next --}}
        @if ($paginator->hasMorePages())
            <a href="{{ $paginator->nextPageUrl() }}"
               class="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 transition-colors">›</a>
        @else
            <span class="px-3 py-1.5 rounded-md bg-white/5 text-gray-600 cursor-not-allowed">›</span>
        @endif
    </div>
</nav>
@endif
