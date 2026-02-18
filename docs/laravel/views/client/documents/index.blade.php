@extends('layouts.client')

@section('title', 'Documents')

@section('content')
<div class="mb-6">
    <h1 class="text-xl font-bold text-white">Documents</h1>
    <p class="text-sm text-gray-400 mt-1">Your shipping and customs documents</p>
</div>

<form method="GET" class="flex flex-wrap gap-3 mb-6">
    <select name="document_type" class="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Document Types</option>
        @foreach(['Bill of Lading','Commercial Invoice','Packing List','Certificate of Origin','Import Permit','Delivery Order'] as $type)
            <option value="{{ $type }}" {{ request('document_type') === $type ? 'selected' : '' }}>{{ $type }}</option>
        @endforeach
    </select>
    <button type="submit" class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">Filter</button>
</form>

<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <table class="w-full text-sm">
        <thead>
            <tr class="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                <th class="px-6 py-3 text-left font-medium">Document</th>
                <th class="px-6 py-3 text-left font-medium">Type</th>
                <th class="px-6 py-3 text-left font-medium">Shipment</th>
                <th class="px-6 py-3 text-left font-medium">Date</th>
                <th class="px-6 py-3 text-left font-medium">Size</th>
                <th class="px-6 py-3 text-right font-medium">Action</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
            @forelse($documents as $doc)
                <tr class="hover:bg-gray-800/40 transition-colors">
                    <td class="px-6 py-4">
                        <p class="text-sm font-medium text-white">{{ $doc->document_name }}</p>
                        @if($doc->notes)
                            <p class="text-xs text-gray-400 mt-0.5">{{ Str::limit($doc->notes, 50) }}</p>
                        @endif
                    </td>
                    <td class="px-6 py-4 text-gray-300 text-xs">{{ $doc->document_type }}</td>
                    <td class="px-6 py-4 text-gray-400 text-xs font-mono">
                        {{ $doc->shipment?->bl_number ?? '—' }}
                    </td>
                    <td class="px-6 py-4 text-gray-400 text-xs">
                        {{ \Carbon\Carbon::parse($doc->created_at)->format('d M Y') }}
                    </td>
                    <td class="px-6 py-4 text-gray-500 text-xs">{{ $doc->file_size ?? '—' }}</td>
                    <td class="px-6 py-4 text-right">
                        <a href="{{ route('client.documents.download', $doc) }}"
                           class="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                            ↓ Download
                        </a>
                    </td>
                </tr>
            @empty
                <tr><td colspan="6">@include('components.empty-state', ['message' => 'No documents available'])</td></tr>
            @endforelse
        </tbody>
    </table>
</div>

<div class="mt-4">{{ $documents->withQueryString()->links('components.pagination') }}</div>
@endsection
