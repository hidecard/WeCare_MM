<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
        <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="32x32">

        @php
            $publicSeo = ($page['component'] ?? null) === 'Error'
                ? \App\Support\PublicSeo::error()
                : \App\Support\PublicSeo::forRequest(request());
            $seoTitle = $publicSeo['title']['my'] ?? '';
            $seoTitleEn = $publicSeo['title']['en'] ?? 'WeCare Myanmar';
            $seoDescription = $publicSeo['description']['my'] ?? '';
            $seoDescriptionEn = $publicSeo['description']['en'] ?? 'WeCare Myanmar brings meals, medicine, and direct care to elders in Myanmar.';
            $seoFullTitle = $seoTitle !== '' ? $seoTitle.' - '.config('app.name') : config('app.name', 'WeCare Myanmar');
            $seoShareTitle = $seoTitle !== '' ? $seoTitle.' / '.$seoTitleEn.' - WeCare Myanmar' : 'WeCare Myanmar | ဝီကဲယား မြန်မာ';
            $seoShareDescription = trim($seoDescription.' | '.$seoDescriptionEn);
            $seoImage = asset('og-image.png');
            $seoJsonLd = $publicSeo['json_ld']['my'] ?? null;
        @endphp

        <title inertia>{{ $seoFullTitle }}</title>
        @if($publicSeo)
            <meta id="seo-description" name="description" content="{{ $seoDescription }}">
            <meta id="seo-robots" name="robots" content="{{ $publicSeo['index'] ? 'index, follow' : 'noindex, nofollow' }}">
            <link id="seo-canonical" rel="canonical" href="{{ $publicSeo['canonical'] ?? url()->current() }}">
            <meta id="seo-og-title" property="og:title" content="{{ $seoShareTitle }}">
            <meta id="seo-og-description" property="og:description" content="{{ $seoShareDescription }}">
            <meta id="seo-og-image" property="og:image" content="{{ $seoImage }}">
            <meta id="seo-og-image-alt" property="og:image:alt" content="WeCare Myanmar | ဝီကဲယား မြန်မာ — {{ $seoShareDescription }}">
            <meta id="seo-og-image-width" property="og:image:width" content="1200">
            <meta id="seo-og-image-height" property="og:image:height" content="630">
            <meta id="seo-og-image-type" property="og:image:type" content="image/png">
            <meta id="seo-og-url" property="og:url" content="{{ $publicSeo['canonical'] ?? url()->current() }}">
            <meta id="seo-og-type" property="og:type" content="website">
            <meta id="seo-og-locale" property="og:locale" content="my_MM">
            <meta id="seo-og-locale-alternate" property="og:locale:alternate" content="en_US">
            <meta id="seo-og-site" property="og:site_name" content="WeCare Myanmar | ဝီကဲယား မြန်မာ">
            <meta id="seo-twitter-card" name="twitter:card" content="summary_large_image">
            <meta id="seo-twitter-title" name="twitter:title" content="{{ $seoShareTitle }}">
            <meta id="seo-twitter-description" name="twitter:description" content="{{ $seoShareDescription }}">
            <meta id="seo-twitter-image" name="twitter:image" content="{{ $seoImage }}">
            <meta id="seo-twitter-image-alt" name="twitter:image:alt" content="WeCare Myanmar | ဝီကဲယား မြန်မာ">
            @if($seoJsonLd)
                <script id="seo-jsonld" type="application/ld+json">@json($seoJsonLd)</script>
            @endif
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
        @if(config('services.analytics.script_url'))
            <script defer data-domain="{{ config('services.analytics.domain') }}" src="{{ config('services.analytics.script_url') }}"@if(config('services.analytics.api')) data-api="{{ config('services.analytics.api') }}"@endif></script>
        @endif
    </body>
</html>
