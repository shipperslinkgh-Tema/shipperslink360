/**
 * SLAC FreightLink 360 — Main JavaScript Entry Point
 *
 * Initialises:
 *  • Alpine.js (with Echo plugin for real-time)
 *  • Axios with CSRF header
 *  • Chart.js defaults
 *  • Global helpers (flash toast, status-colour map, formatters)
 */

// ── Alpine.js ──────────────────────────────────────────────────────────────
import Alpine from 'alpinejs';
import Echo   from 'laravel-echo';
import Pusher from 'pusher-js';
import axios  from 'axios';
import Chart  from 'chart.js/auto';

// ── Axios global defaults ──────────────────────────────────────────────────
window.axios = axios;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// Ensure CSRF token is present on every mutation request
const csrfMeta = document.head.querySelector('meta[name="csrf-token"]');
if (csrfMeta) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfMeta.content;
}

// ── Laravel Echo / Pusher setup ───────────────────────────────────────────
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster:  'pusher',
    key:          import.meta.env.VITE_PUSHER_APP_KEY,
    cluster:      import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
    wsHost:       import.meta.env.VITE_PUSHER_HOST        ?? `ws-${import.meta.env.VITE_PUSHER_APP_CLUSTER}.pusher.com`,
    wsPort:       import.meta.env.VITE_PUSHER_PORT        ?? 80,
    wssPort:      import.meta.env.VITE_PUSHER_PORT        ?? 443,
    forceTLS:    (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': csrfMeta?.content ?? '',
        },
    },
});

// ── Chart.js global defaults ───────────────────────────────────────────────
Chart.defaults.color          = '#8fa3cc';
Chart.defaults.borderColor    = '#243054';
Chart.defaults.font.family    = 'Inter, ui-sans-serif, system-ui, sans-serif';
Chart.defaults.font.size      = 12;
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.padding  = 16;
window.Chart = Chart;

// ── Global status → badge colour map ──────────────────────────────────────
window.statusColours = {
    pending:    'badge-yellow',
    active:     'badge-green',
    completed:  'badge-blue',
    cancelled:  'badge-red',
    in_transit: 'badge-blue',
    arrived:    'badge-green',
    cleared:    'badge-teal',
    overdue:    'badge-orange',
    draft:      'badge-gray',
    approved:   'badge-green',
    rejected:   'badge-red',
    paid:       'badge-green',
    partial:    'badge-yellow',
    unpaid:     'badge-red',
    submitted:  'badge-purple',
};

// ── Alpine: Flash toast store ──────────────────────────────────────────────
document.addEventListener('alpine:init', () => {

    // ── Toast ──────────────────────────────────────────────────────────────
    Alpine.store('toast', {
        items: [],
        show(message, type = 'success', duration = 4000) {
            const id = Date.now();
            this.items.push({ id, message, type });
            setTimeout(() => this.dismiss(id), duration);
        },
        dismiss(id) {
            this.items = this.items.filter(t => t.id !== id);
        },
    });

    // ── Sidebar ────────────────────────────────────────────────────────────
    Alpine.store('sidebar', {
        open: window.innerWidth >= 1024,
        toggle() { this.open = !this.open; },
        close()  { this.open = false; },
    });

    // ── Notifications unread count ─────────────────────────────────────────
    Alpine.store('notifications', {
        count: parseInt(document.body.dataset.unreadNotifications ?? '0', 10),
        markAllRead() { this.count = 0; },
    });

    // ── Chat widget (floating) ─────────────────────────────────────────────
    Alpine.data('chatWidget', () => ({
        open:       false,
        minimised:  false,
        activeRoom: 'general',
        message:    '',
        messages:   {},
        unread:     0,
        typing:     false,
        typingUser: '',
        typingTimer: null,

        rooms: [
            { id: 'general',     label: 'General',    icon: '💬' },
            { id: 'operations',  label: 'Operations', icon: '🚢' },
            { id: 'finance',     label: 'Finance',    icon: '💰' },
            { id: 'management',  label: 'Management', icon: '📊' },
        ],

        get currentMessages() {
            return this.messages[this.activeRoom] ?? [];
        },

        init() {
            this.rooms.forEach(room => {
                this.messages[room.id] = [];
                this.loadMessages(room.id);
                this.subscribeChannel(room.id);
            });
        },

        async loadMessages(room) {
            try {
                const res = await axios.get(`/api/chat/messages?room=${room}`);
                this.messages[room] = res.data.data ?? res.data;
                this.$nextTick(() => this.scrollBottom());
            } catch (e) { console.error('Chat load error', e); }
        },

        subscribeChannel(room) {
            const userId = document.body.dataset.userId;
            if (!userId) return;

            window.Echo.private(`dept.${room}`)
                .listen('.MessageSent', (e) => {
                    if (!this.messages[room]) this.messages[room] = [];
                    this.messages[room].push(e.message);
                    if (!this.open || this.activeRoom !== room) this.unread++;
                    this.$nextTick(() => this.scrollBottom());
                })
                .listenForWhisper('typing', (e) => {
                    if (e.userId !== userId) {
                        this.typingUser = e.name;
                        this.typing = true;
                        clearTimeout(this.typingTimer);
                        this.typingTimer = setTimeout(() => { this.typing = false; }, 2000);
                    }
                });
        },

        switchRoom(room) {
            this.activeRoom = room;
            if (!this.messages[room]?.length) this.loadMessages(room);
            this.$nextTick(() => this.scrollBottom());
        },

        async send() {
            const msg = this.message.trim();
            if (!msg) return;
            this.message = '';
            try {
                await axios.post('/api/chat/messages', {
                    room:    this.activeRoom,
                    message: msg,
                });
            } catch (e) {
                console.error('Send error', e);
                this.$store.toast.show('Failed to send message.', 'error');
            }
        },

        onKeydown(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.send();
            }
            // Whisper typing
            const channel = window.Echo.private(`dept.${this.activeRoom}`);
            channel.whisper('typing', {
                userId: document.body.dataset.userId,
                name:   document.body.dataset.userName,
            });
        },

        toggleOpen() {
            this.open = !this.open;
            if (this.open) {
                this.unread = 0;
                this.minimised = false;
                this.$nextTick(() => this.scrollBottom());
            }
        },

        scrollBottom() {
            const el = this.$refs.messageList;
            if (el) el.scrollTop = el.scrollHeight;
        },

        formatTime(ts) {
            if (!ts) return '';
            const d = new Date(ts);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },

        isOwn(msg) {
            return String(msg.user_id) === String(document.body.dataset.userId);
        },
    }));

    // ── Finance Charts helper ──────────────────────────────────────────────
    Alpine.data('financeChart', (type, labels, datasets, options = {}) => ({
        chart: null,
        init() {
            this.chart = new Chart(this.$el, {
                type,
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    ...options,
                },
            });
        },
        destroy() { this.chart?.destroy(); },
    }));

    // ── Confirm delete ─────────────────────────────────────────────────────
    Alpine.data('confirmDelete', (action) => ({
        open: false,
        action,
        proceed() {
            document.getElementById('delete-form-' + this.action)?.submit();
        },
    }));

    // ── Dynamic invoice line items ─────────────────────────────────────────
    Alpine.data('invoiceBuilder', () => ({
        items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }],
        taxRate: parseFloat(document.getElementById('tax-rate-meta')?.dataset.taxRate ?? '0.15'),

        get subtotal() {
            return this.items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        },
        get taxAmount()   { return this.subtotal * this.taxRate; },
        get totalAmount() { return this.subtotal + this.taxAmount; },

        addItem() {
            this.items.push({ description: '', quantity: 1, unit_price: 0, amount: 0 });
        },
        removeItem(index) {
            if (this.items.length > 1) this.items.splice(index, 1);
        },
        recalc(index) {
            const item = this.items[index];
            item.amount = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0);
        },
        fmt(n) {
            return Number(n).toLocaleString('en-GH', { minimumFractionDigits: 2 });
        },
    }));

});

// ── Boot Alpine ────────────────────────────────────────────────────────────
Alpine.start();

// ── Global flash from session (rendered by blade) ─────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    const flash = document.getElementById('flash-data');
    if (flash) {
        const { type, message } = flash.dataset;
        if (message) {
            Alpine.store('toast').show(message, type ?? 'success');
        }
    }
});
