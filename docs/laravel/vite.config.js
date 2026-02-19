import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
            ],
            refresh: [
                'resources/views/**/*.blade.php',
                'routes/**/*.php',
            ],
        }),
    ],

    build: {
        // Enable source maps in development
        sourcemap: process.env.NODE_ENV === 'development',
        // Chunk splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    'chart':  ['chart.js'],
                    'vendor': ['alpinejs', 'axios'],
                    'pusher': ['pusher-js', 'laravel-echo'],
                },
            },
        },
    },

    server: {
        host: '0.0.0.0',
        cors: true,
    },
});
