{{ $paginator->links() }}
{{-- Place this in resources/views/components/pagination.blade.php
     Override Laravel's default paginator with a styled version. --}}
@if ($paginator->hasPages())
    <nav class="flex items-center justify-between">
        <p class="text-xs text-gray-500">
            Showing {{ $paginator->firstItem() }}–{{ $paginator->lastItem() }} of {{ $paginator->total() }} results
        </p>
        <div class="flex items-center gap-1">
            {{-- Previous --}}
            @if($paginator->onFirstPage())
                <span class="px-3 py-1.5 text-xs text-gray-600 bg-gray-800 rounded-lg cursor-not-allowed">← Prev</span>
            @else
                <a href="{{ $paginator->previousPageUrl() }}" class="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">← Prev</a>
            @endif

            {{-- Page numbers --}}
            @foreach($elements as $element)
                @if(is_string($element))
                    <span class="px-3 py-1.5 text-xs text-gray-600">{{ $element }}</span>
                @endif
                @if(is_array($element))
                    @foreach($element as $page => $url)
                        @if($page === $paginator->currentPage())
                            <span class="px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg font-semibold">{{ $page }}</span>
                        @else
                            <a href="{{ $url }}" class="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">{{ $page }}</a>
                        @endif
                    @endforeach
                @endif
            @endforeach

            {{-- Next --}}
            @if($paginator->hasMorePages())
                <a href="{{ $paginator->nextPageUrl() }}" class="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">Next →</a>
            @else
                <span class="px-3 py-1.5 text-xs text-gray-600 bg-gray-800 rounded-lg cursor-not-allowed">Next →</span>
            @endif
        </div>
    </nav>
@endif
