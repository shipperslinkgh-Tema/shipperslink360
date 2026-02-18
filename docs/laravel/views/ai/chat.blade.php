@extends('layouts.app')

@section('title', 'AI Assistant')
@section('page-title', 'AI Assistant')

@section('content')
<div class="flex flex-col h-[calc(100vh-10rem)]" x-data="aiChat()">

    <div class="mb-4 flex items-center justify-between">
        <div>
            <h1 class="text-xl font-bold text-white">AI Assistant</h1>
            <p class="text-sm text-gray-400 mt-0.5">
                Department context: <span class="text-blue-400 capitalize font-medium">{{ str_replace('_', ' ', Auth::user()?->getDepartment()) }}</span>
            </p>
        </div>
        <button @click="clearChat()" class="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
            Clear chat
        </button>
    </div>

    {{-- Messages area --}}
    <div class="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scroll-smooth" x-ref="messages">

        {{-- Welcome --}}
        <template x-if="messages.length === 0">
            <div class="flex flex-col items-center justify-center h-full text-center py-12">
                <div class="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl mb-4">✨</div>
                <h3 class="text-base font-semibold text-white mb-2">SLAC AI Assistant</h3>
                <p class="text-sm text-gray-400 max-w-sm">Ask me about shipments, invoices, customs procedures, or anything related to your department operations.</p>
                <div class="grid grid-cols-2 gap-2 mt-6 w-full max-w-sm">
                    @php
                        $suggestions = [
                            'What shipments are currently in customs?',
                            'Summarise overdue invoices this month',
                            'What are the customs requirements for electronics?',
                            'Show me cash flow trends',
                        ];
                    @endphp
                    @foreach($suggestions as $s)
                        <button @click="sendMessage('{{ $s }}')"
                                class="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-300 hover:text-white text-left transition-colors">
                            {{ $s }}
                        </button>
                    @endforeach
                </div>
            </div>
        </template>

        <template x-for="msg in messages" :key="msg.id">
            <div :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                <div :class="msg.role === 'user' ? 'bg-blue-600 text-white max-w-lg' : 'bg-gray-800 text-gray-100 max-w-2xl'"
                     class="px-4 py-3 rounded-2xl text-sm leading-relaxed">
                    <div x-html="msg.content" class="prose prose-sm prose-invert max-w-none"></div>
                    <p class="text-xs opacity-50 mt-1 text-right" x-text="msg.time"></p>
                </div>
            </div>
        </template>

        {{-- Typing indicator --}}
        <template x-if="isStreaming">
            <div class="flex justify-start">
                <div class="bg-gray-800 px-4 py-3 rounded-2xl">
                    <div class="flex gap-1 items-center">
                        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                        <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
                    </div>
                </div>
            </div>
        </template>
    </div>

    {{-- Input --}}
    <form @submit.prevent="sendMessage()" class="flex items-end gap-3">
        <div class="flex-1 relative">
            <textarea x-model="prompt"
                      @keydown.enter.exact.prevent="sendMessage()"
                      placeholder="Ask anything about your operations…"
                      rows="1"
                      class="w-full px-4 py-3 pr-12 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none
                             max-h-32 overflow-y-auto"
                      :disabled="isStreaming">
            </textarea>
            <p class="absolute bottom-2 right-3 text-xs text-gray-600" x-text="prompt.length + '/4000'"></p>
        </div>
        <button type="submit"
                :disabled="!prompt.trim() || isStreaming"
                class="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
        </button>
    </form>
</div>

@push('scripts')
<script>
function aiChat() {
    return {
        messages: [],
        prompt: '',
        isStreaming: false,

        async sendMessage(text) {
            const content = (text || this.prompt).trim();
            if (!content || this.isStreaming) return;

            this.messages.push({ id: Date.now(), role: 'user', content, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
            this.prompt = '';
            this.isStreaming = true;

            await this.$nextTick();
            this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;

            const assistantMsg = { id: Date.now() + 1, role: 'assistant', content: '', time: '' };
            this.messages.push(assistantMsg);

            try {
                const res = await fetch('/api/v1/ai/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content },
                    body: JSON.stringify({ prompt: content, module: 'general' })
                });

                const reader = res.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const lines = decoder.decode(value).split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const data = JSON.parse(line.slice(6));
                                assistantMsg.content += data.content;
                                await this.$nextTick();
                                this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
                            } catch {}
                        }
                    }
                }

                assistantMsg.time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch (err) {
                assistantMsg.content = 'Sorry, an error occurred. Please try again.';
            } finally {
                this.isStreaming = false;
            }
        },

        clearChat() {
            this.messages = [];
        }
    };
}
</script>
@endpush
@endsection
