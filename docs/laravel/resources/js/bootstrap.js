/**
 * SLAC FreightLink 360 - JavaScript Bootstrap
 * Initializes Axios, Laravel Echo (Pusher), and CSRF token handling.
 */

import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// ─── Axios Global Configuration ──────────────────────────────────────────────
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

// Attach CSRF token from meta tag
const csrfToken = document.head.querySelector('meta[name="csrf-token"]');
if (csrfToken) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.content;
} else {
    console.error('[SLAC] CSRF token not found. Ensure <meta name="csrf-token"> is in <head>.');
}

// Intercept 401 responses → redirect to login
window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            window.location.href = '/login?expired=1';
        }
        return Promise.reject(error);
    }
);

// ─── Laravel Echo + Pusher (Real-time) ───────────────────────────────────────
window.Pusher = Pusher;

if (window.PUSHER_APP_KEY && window.PUSHER_APP_KEY !== '') {
    window.Echo = new Echo({
        broadcaster:      'pusher',
        key:              window.PUSHER_APP_KEY,
        cluster:          window.PUSHER_APP_CLUSTER || 'mt1',
        forceTLS:         true,
        authEndpoint:     '/broadcasting/auth',
        auth: {
            headers: {
                'X-CSRF-TOKEN': csrfToken ? csrfToken.content : '',
            },
        },
    });

    console.log('[SLAC] Laravel Echo initialized.');
} else {
    // Provide a stub so components don't crash if Echo isn't configured
    window.Echo = {
        channel: () => ({ listen: () => {}, stopListening: () => {} }),
        private: () => ({ listen: () => {}, stopListening: () => {}, whisper: () => {} }),
        join:    () => ({ here: () => {}, joining: () => {}, leaving: () => {}, listen: () => {} }),
        leave:   () => {},
        leaveChannel: () => {},
    };
    console.warn('[SLAC] Pusher not configured. Real-time features disabled.');
}
