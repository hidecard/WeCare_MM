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
            $seoDescription = $publicSeo['description']['my'] ?? '';
            $seoFullTitle = $seoTitle !== '' ? $seoTitle.' - '.config('app.name') : config('app.name', 'WeCare Myanmar');
            $seoJsonLd = $publicSeo['json_ld']['my'] ?? null;
        @endphp

        <title inertia>{{ $seoFullTitle }}</title>
        @if($publicSeo)
            <meta id="seo-description" name="description" content="{{ $seoDescription }}">
            <meta id="seo-robots" name="robots" content="{{ $publicSeo['index'] ? 'index, follow' : 'noindex, nofollow' }}">
            <link id="seo-canonical" rel="canonical" href="{{ $publicSeo['canonical'] ?? url()->current() }}">
            <meta id="seo-og-title" property="og:title" content="{{ $seoFullTitle }}">
            <meta id="seo-og-description" property="og:description" content="{{ $seoDescription }}">
            <meta id="seo-og-url" property="og:url" content="{{ $publicSeo['canonical'] ?? url()->current() }}">
            <meta id="seo-og-type" property="og:type" content="website">
            <meta id="seo-og-locale" property="og:locale" content="my_MM">
            <meta id="seo-og-site" property="og:site_name" content="WeCare Myanmar">
            <meta id="seo-twitter-card" name="twitter:card" content="summary">
            <meta id="seo-twitter-title" name="twitter:title" content="{{ $seoFullTitle }}">
            <meta id="seo-twitter-description" name="twitter:description" content="{{ $seoDescription }}">
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
    </body>
</html>
