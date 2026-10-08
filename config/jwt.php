<?php

return [

    /*
    |--------------------------------------------------------------------------
    | JWT Authentication Secret
    |--------------------------------------------------------------------------
    |
    | Don't forget to set this in your .env file, as it will be used to sign
    | your tokens. A helper command is provided for this:
    | `php artisan jwt:secret`
    |
    */

    'secret' => env('JWT_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | JWT Authentication Keys
    |--------------------------------------------------------------------------
    |
    | The algorithm you are using, will determine whether your tokens are
    | signed with a random string (defined in `JWT_SECRET`) or using the
    | public & private keys below.
    |
    */

    'keys' => [

        'public' => env('JWT_PUBLIC_KEY'),

        'private' => env('JWT_PRIVATE_KEY'),

        'passphrase' => env('JWT_PASSPHRASE'),
    ],

    /*
    |--------------------------------------------------------------------------
    | JWT time to live (TTL)
    |--------------------------------------------------------------------------
    |
    | Đặt null để Token không bao giờ hết hạn (đăng nhập nhớ mãi).
    |
    */

    'ttl' => (env('JWT_TTL') === 'null' || env('JWT_TTL') === null) ? null : (int) env('JWT_TTL'),
    /*
    |--------------------------------------------------------------------------
    | Refresh time to live
    |--------------------------------------------------------------------------
    */

    'refresh_iat' => env('JWT_REFRESH_IAT', false),
    'refresh_ttl' => (int) env('JWT_REFRESH_TTL', 20160),

    /*
    |--------------------------------------------------------------------------
    | JWT hashing algorithm
    |--------------------------------------------------------------------------
    */

    'algo' => env('JWT_ALGO', 'HS256'),

    /*
    |--------------------------------------------------------------------------
    | Required Claims
    |--------------------------------------------------------------------------
    |
    | Đã loại bỏ 'exp' khỏi mảng này để tránh lỗi Validation khi ttl = null.
    |
    */

    'required_claims' => [
        'iss',
        'iat',
        'nbf',
        'sub',
        'jti',
    ],

    /*
    |--------------------------------------------------------------------------
    | Persistent Claims
    |--------------------------------------------------------------------------
    */

    'persistent_claims' => [
        // 'foo',
        // 'bar',
    ],

    /*
    |--------------------------------------------------------------------------
    | Lock Subject
    |--------------------------------------------------------------------------
    */

    'lock_subject' => true,

    /*
    |--------------------------------------------------------------------------
    | Leeway
    |--------------------------------------------------------------------------
    */

    'leeway' => (int) env('JWT_LEEWAY', 0),

    /*
    |--------------------------------------------------------------------------
    | Blacklist Enabled
    |--------------------------------------------------------------------------
    */

    'blacklist_enabled' => env('JWT_BLACKLIST_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Blacklist Grace Period
    |--------------------------------------------------------------------------
    */

    'blacklist_grace_period' => (int) env('JWT_BLACKLIST_GRACE_PERIOD', 0),

    /*
    |--------------------------------------------------------------------------
    | Show blacklisted token option
    |--------------------------------------------------------------------------
    */

    'show_black_list_exception' => env('JWT_SHOW_BLACKLIST_EXCEPTION', true),

    /*
    |--------------------------------------------------------------------------
    | Cookies encryption & key name
    |--------------------------------------------------------------------------
    */

    'decrypt_cookies' => false,

    'cookie_key_name' => 'token',

    /*
    |--------------------------------------------------------------------------
    | Providers
    |--------------------------------------------------------------------------
    */

    'providers' => [

        'jwt' => PHPOpenSourceSaver\JWTAuth\Providers\JWT\Lcobucci::class,

        'auth' => PHPOpenSourceSaver\JWTAuth\Providers\Auth\Illuminate::class,

        'storage' => PHPOpenSourceSaver\JWTAuth\Providers\Storage\Illuminate::class,
    ],
];