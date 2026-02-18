@extends('layouts.client')

@section('title', 'Messages')

@section('content')
<div class="flex flex-col h-[calc(100vh-10rem)]">
    <div class="mb-4">
        <h1 class="text-xl font-bold text-white">Messages</h1>
        <p class="text-sm text-gray-400 mt-0.5">Communicate with the SLAC team</p>
    </div>

    {{-- Thread --}}
    <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        @forelse($messages as $msg)
            <div class="{{ $msg->sender_type === 'client' ? 'flex justify-end' : 'flex justify-start' }}">
                <div class="{{ $msg->sender_type === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100' }} max-w-lg px-4 py-3 rounded-2xl">
                    @if($msg->subject)
                        <p class="text-xs font-semibold opacity-75 mb-1">{{ $msg->subject }}</p>
                    @endif
                    <p class="text-sm leading-relaxed">{{ $msg->message }}</p>
                    <p class="text-xs opacity-50 mt-1.5 text-right">
                        {{ $msg->sender_type === 'client' ? 'You' : 'SLAC Team' }} ·
                        {{ \Carbon\Carbon::parse($msg->created_at)->format('d M, H:i') }}
                    </p>
                </div>
            </div>
        @empty
            <div class="flex flex-col items-center justify-center h-48 text-center">
                <p class="text-2xl mb-2">💬</p>
                <p class="text-sm text-gray-400">No messages yet. Start a conversation with our team.</p>
            </div>
        @endforelse
    </div>

    {{-- Compose --}}
    <div class="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <form method="POST" action="{{ route('client.messages.store') }}" class="space-y-3">
            @csrf
            <input type="text" name="subject"
                   placeholder="Subject (optional)"
                   value="{{ old('subject') }}"
                   class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div class="flex gap-3">
                <textarea name="message"
                          rows="2"
                          required
                          placeholder="Type your message here…"
                          class="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none">{{ old('message') }}</textarea>
                <button type="submit"
                        class="flex-shrink-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors self-end">
                    Send →
                </button>
            </div>
            @error('message') <p class="text-xs text-red-400">{{ $message }}</p> @enderror
        </form>
    </div>
</div>
@endsection
