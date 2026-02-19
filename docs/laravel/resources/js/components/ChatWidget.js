/**
 * SLAC Messenger – Chat Widget
 * Alpine.js component that mirrors InternalChatBox.tsx behavior.
 * Real-time via Laravel Echo (Pusher).
 */

export function chatWidget() {
    return {
        /* ── State ─────────────────────────────────────── */
        open:          false,
        channel:       'general',
        message:       '',
        messages:      [],
        unreadCount:   0,
        loading:       false,
        sending:       false,
        typingUsers:   [],
        typingTimer:   null,
        echoChannel:   null,
        presenceChannel: null,
        onlineUsers:   [],

        channels: [
            { id: 'general',    label: 'General',    icon: '💬' },
            { id: 'operations', label: 'Operations', icon: '🚢' },
            { id: 'finance',    label: 'Finance',    icon: '💰' },
            { id: 'management', label: 'Management', icon: '📋' },
            { id: 'customs',    label: 'Customs',    icon: '🛃' },
            { id: 'trucking',   label: 'Trucking',   icon: '🚛' },
        ],

        /* ── Lifecycle ──────────────────────────────────── */
        init() {
            this.fetchMessages();
            this.joinPresence();
            this.subscribeToChannel(this.channel);

            // Update unread badge every 30s even when closed
            setInterval(() => this.fetchUnreadCount(), 30_000);

            // Scroll to bottom when messages update
            this.$watch('messages', () => {
                this.$nextTick(() => this.scrollToBottom());
            });
        },

        /* ── Channel subscription ───────────────────────── */
        subscribeToChannel(ch) {
            if (this.echoChannel) {
                window.Echo.leave(`chat.${this.channel}`);
            }

            this.channel = ch;
            this.messages = [];
            this.fetchMessages();

            this.echoChannel = window.Echo.private(`chat.${ch}`)
                .listen('.NewMessage', (e) => {
                    this.messages.push(e.message);
                    if (!this.open) this.unreadCount++;
                    this.$nextTick(() => this.scrollToBottom());
                })
                .listenForWhisper('typing', (e) => {
                    if (!this.typingUsers.includes(e.name)) {
                        this.typingUsers.push(e.name);
                        setTimeout(() => {
                            this.typingUsers = this.typingUsers.filter(u => u !== e.name);
                        }, 3000);
                    }
                });
        },

        joinPresence() {
            this.presenceChannel = window.Echo.join('presence.staff')
                .here(users => { this.onlineUsers = users; })
                .joining(user => { this.onlineUsers.push(user); })
                .leaving(user => { this.onlineUsers = this.onlineUsers.filter(u => u.id !== user.id); });
        },

        /* ── Data fetching ──────────────────────────────── */
        fetchMessages() {
            this.loading = true;
            window.axios.get('/api/chat/messages', { params: { channel: this.channel, limit: 50 } })
                .then(res => {
                    this.messages = res.data.data || [];
                    this.$nextTick(() => this.scrollToBottom());
                })
                .catch(err => console.error('[Chat] fetch error', err))
                .finally(() => { this.loading = false; });
        },

        fetchUnreadCount() {
            window.axios.get('/api/chat/unread')
                .then(res => { this.unreadCount = res.data.count || 0; })
                .catch(() => {});
        },

        /* ── Sending ────────────────────────────────────── */
        sendMessage() {
            const text = this.message.trim();
            if (!text || this.sending) return;

            this.sending = true;
            const payload = { channel: this.channel, message: text, message_type: 'text' };

            window.axios.post('/api/chat/messages', payload)
                .then(res => {
                    this.messages.push(res.data.data);
                    this.message = '';
                    this.$nextTick(() => this.scrollToBottom());
                })
                .catch(err => console.error('[Chat] send error', err))
                .finally(() => { this.sending = false; });
        },

        handleKeydown(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
            this.sendTypingWhisper();
        },

        sendTypingWhisper() {
            if (!this.echoChannel) return;
            clearTimeout(this.typingTimer);
            this.echoChannel.whisper('typing', { name: window.AUTH_USER_NAME || 'Someone' });
            this.typingTimer = setTimeout(() => {}, 2000);
        },

        /* ── UI helpers ─────────────────────────────────── */
        toggleOpen() {
            this.open = !this.open;
            if (this.open) {
                this.unreadCount = 0;
                this.$nextTick(() => {
                    this.scrollToBottom();
                    this.$refs.messageInput?.focus();
                });
            }
        },

        switchChannel(ch) {
            this.subscribeToChannel(ch);
        },

        scrollToBottom() {
            const el = this.$refs.messageList;
            if (el) el.scrollTop = el.scrollHeight;
        },

        isOwnMessage(msg) {
            return msg.sender_id == window.AUTH_USER_ID;
        },

        formatTime(ts) {
            return new Date(ts).toLocaleTimeString('en-GB', {
                hour:   '2-digit',
                minute: '2-digit',
            });
        },

        departmentBadgeColor(dept) {
            const map = {
                operations:       'bg-blue-600',
                documentation:    'bg-purple-600',
                accounts:         'bg-green-600',
                finance:          'bg-green-600',
                marketing:        'bg-pink-600',
                customer_service: 'bg-cyan-600',
                warehouse:        'bg-amber-600',
                management:       'bg-red-600',
                super_admin:      'bg-gray-600',
            };
            return map[dept] || 'bg-gray-600';
        },

        channelLabel(ch) {
            return this.channels.find(c => c.id === ch)?.label || ch;
        },
    };
}
