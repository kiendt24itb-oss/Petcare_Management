<?php

return [
    'defaults' => [
        'guard' => 'api',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'users',
        ],
        'api' => [
            'driver' => 'jwt',
            'provider' => 'accounts',
        ],
    ],

    'providers' => [
        'accounts' => [
            'driver' => 'eloquent',
            'model' => App\Models\Account::class,
        ],
    ],
];