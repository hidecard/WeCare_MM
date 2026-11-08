<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'analytics' => [
        'script_url' => env('ANALYTICS_SCRIPT_URL'),
        'domain' => env('ANALYTICS_DOMAIN'),
        'api' => env('ANALYTICS_API'),
    ],

    'support' => [
        'phone' => env('WECARE_SUPPORT_PHONE'),
        'email' => env('WECARE_SUPPORT_EMAIL'),
        'telegram_url' => env('WECARE_SUPPORT_TELEGRAM_URL'),
        'facebook_url' => env('WECARE_SUPPORT_FACEBOOK_URL'),
        'hours' => env('WECARE_SUPPORT_HOURS', 'နေ့စဉ် 9:00 AM – 6:00 PM Myanmar Time'),
        'response_time' => env('WECARE_SUPPORT_RESPONSE_TIME', '၁ ရက်အတွင်း / within 1 day'),
    ],

];
