<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Broadcaster
    |--------------------------------------------------------------------------
    |
    | Supported: "pusher", "ably", "redis", "log", "null"
    |
    */

    'default' => env('BROADCAST_DRIVER', 'pusher'),

    /*
    |--------------------------------------------------------------------------
    | Broadcast Connections
    |--------------------------------------------------------------------------
    */

    'connections' => [

        'pusher' => [
            'driver'  => 'pusher',
            'key'     => env('PUSHER_APP_KEY'),
            'secret'  => env('PUSHER_APP_SECRET'),
            'app_id'  => env('PUSHER_APP_ID'),
            'options' => [
                'cluster'   => env('PUSHER_APP_CLUSTER', 'eu'),
                'host'      => env('PUSHER_HOST', 'api-eu.pusher.com'),
                'port'      => env('PUSHER_PORT', 443),
                'scheme'    => env('PUSHER_SCHEME', 'https'),
                'encrypted' => true,
                'useTLS'    => true,
            ],
            'client_options' => [
                // Guzzle HTTP client options
            ],
        ],

        'ably' => [
            'driver' => 'ably',
            'key'    => env('ABLY_KEY'),
        ],

        'redis' => [
            'driver'     => 'redis',
            'connection' => 'default',
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],
    ],

];
