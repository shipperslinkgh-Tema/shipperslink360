<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Queue Connection Name
    |--------------------------------------------------------------------------
    */

    'default' => env('QUEUE_CONNECTION', 'redis'),

    /*
    |--------------------------------------------------------------------------
    | Queue Connections
    |--------------------------------------------------------------------------
    */

    'connections' => [

        'sync' => [
            'driver' => 'sync',
        ],

        'database' => [
            'driver'       => 'database',
            'connection'   => null,
            'table'        => 'jobs',
            'queue'        => 'default',
            'retry_after'  => 90,
            'after_commit' => false,
        ],

        'redis' => [
            'driver'      => 'redis',
            'connection'  => env('QUEUE_REDIS_CONNECTION', 'default'),
            'queue'       => env('QUEUE_NAME', 'default'),
            'retry_after' => 90,
            'block_for'   => null,
            'after_commit'=> false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Job Batching
    |--------------------------------------------------------------------------
    */

    'batching' => [
        'database' => env('DB_CONNECTION', 'mysql'),
        'table'    => 'job_batches',
    ],

    /*
    |--------------------------------------------------------------------------
    | Failed Queue Jobs
    |--------------------------------------------------------------------------
    */

    'failed' => [
        'driver'   => env('QUEUE_FAILED_DRIVER', 'database-uuids'),
        'database' => env('DB_CONNECTION', 'mysql'),
        'table'    => 'failed_jobs',
    ],

    /*
    |--------------------------------------------------------------------------
    | Named Queues
    |--------------------------------------------------------------------------
    | Separate queues allow prioritization:
    |   php artisan queue:work --queue=critical,high,default,emails
    */
    'queues' => [
        'critical' => ['bank_alerts', 'security'],
        'high'     => ['invoices', 'notifications'],
        'default'  => ['default'],
        'emails'   => ['emails'],
    ],

];
