{{-- Floating Internal Chat Widget --}}
<div x-data="{
    open: false,
    channel: 'general',
    messages: [],
    message: '',
    loading: false,
    channels: {{ json_encode(array_keys(config('shipperlink.chat_channels', []))) }},

    async loadMessages() {
        this.loading = true;
        try {
            const res = await fetch(`/api/chat/messages?channel=${this.channel}`, {
                headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content }
            });
            const data = await res.json();
            this.messages = data.data ?? [];
        } catch (e) { console.error(e); }
        this.loading = false;
        this.$nextTick(() => { const el = this.$refs.msgList; if(el) el.scrollTop = el.scrollHeight; });
    },

    async send() {
        if (!this.message.trim()) return;
        const body = { channel: this.channel, message: this.message };
        this.message = '';
        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            this.messages.push(data.data);
            this.$nextTick(() => { const el = this.$refs.msgList; if(el) el.scrollTop = el.scrollHeight; });
        } catch(e) { console.error(e); }
    }
}" x-init="loadMessages()" class="fixed bottom-6 right-6 z-50">

    {{-- Toggle Button --}}
    <button @click="open = !open"
            class="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center transition-colors">
        <svg x-show="!open" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        <svg x-show="open" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    </button>

    {{-- Chat Panel --}}
    <div x-show="open" x-transition
         class="absolute bottom-16 right-0 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden"
         style="height: 420px;">

        {{-- Header --}}
        <div class="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
            <span class="text-sm font-semibold text-white">Internal Chat</span>
            <select x-model="channel" @change="loadMessages()"
                    class="text-xs bg-gray-700 border-0 text-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <template x-for="ch in channels" :key="ch">
                    <option :value="ch" x-text="ch.charAt(0).toUpperCase() + ch.slice(1).replace('_',' ')"></option>
                </template>
            </select>
        </div>

        {{-- Messages --}}
        <div x-ref="msgList" class="flex-1 overflow-y-auto p-4 space-y-3">
            <template x-if="loading">
                <div class="text-center text-gray-500 text-xs py-6">Loading…</div>
            </template>
            <template x-for="msg in messages" :key="msg.id">
                <div :class="msg.sender_id === '{{ Auth::id() }}' ? 'flex-row-reverse' : ''" class="flex items-end gap-2">
                    <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                         x-text="(msg.sender_name || 'U').charAt(0).toUpperCase()"></div>
                    <div :class="msg.sender_id === '{{ Auth::id() }}' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'"
                         class="max-w-52 px-3 py-2 rounded-xl text-xs leading-relaxed">
                        <p x-show="msg.sender_id !== '{{ Auth::id() }}'" x-text="msg.sender_name" class="text-gray-400 text-[10px] mb-1 font-medium"></p>
                        <p x-text="msg.message"></p>
                    </div>
                </div>
            </template>
        </div>

        {{-- Input --}}
        <div class="px-3 py-3 border-t border-gray-700 flex gap-2">
            <input type="text" x-model="message"
                   @keydown.enter.prevent="send()"
                   placeholder="Type a message…"
                   class="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <button @click="send()"
                    class="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg transition-colors">
                Send
            </button>
        </div>
    </div>
</div>
