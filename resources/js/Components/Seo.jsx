import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'WeCare Myanmar';

const ensure = (id, tagName, attributes) => {
    let element = document.getElementById(id);

    if (!element) {
        element = document.createElement(tagName);
        element.id = id;
        document.head.appendChild(element);
    }

    Object.entries(attributes).forEach(([name, value]) => {
        element.setAttribute(name, value ?? '');
    });

    return element;
};

export default function Seo({ lang = 'my', seo = undefined }) {
    const shared = usePage().props.seo ?? null;
    const data = seo === undefined ? shared : seo;
    const title = data?.title?.[lang] || data?.title?.my || '';
    const description = data?.description?.[lang] || data?.description?.my || '';
    const fullTitle = title ? `${title} - ${appName}` : appName;
    const shareTitle = data?.title?.my && data?.title?.en ? `${data.title.my} / ${data.title.en} - ${appName}` : fullTitle;
    const shareDescription = data?.description?.my && data?.description?.en ? `${data.description.my} | ${data.description.en}` : description;

    useEffect(() => {
        if (!data || !title) {
            return undefined;
        }

        const canonical = data.canonical || window.location.origin + window.location.pathname;
        const image = `${window.location.origin}/og-image.png`;

        ensure('seo-description', 'meta', { name: 'description', content: description });
        ensure('seo-robots', 'meta', { name: 'robots', content: data.index ? 'index, follow' : 'noindex, nofollow' });
        ensure('seo-canonical', 'link', { rel: 'canonical', href: canonical });
        ensure('seo-og-title', 'meta', { property: 'og:title', content: shareTitle });
        ensure('seo-og-description', 'meta', { property: 'og:description', content: shareDescription });
        ensure('seo-og-image', 'meta', { property: 'og:image', content: image });
        ensure('seo-og-image-alt', 'meta', { property: 'og:image:alt', content: 'WeCare Myanmar | ဝီကဲယား မြန်မာ' });
        ensure('seo-og-image-width', 'meta', { property: 'og:image:width', content: '1200' });
        ensure('seo-og-image-height', 'meta', { property: 'og:image:height', content: '630' });
        ensure('seo-og-image-type', 'meta', { property: 'og:image:type', content: 'image/png' });
        ensure('seo-og-url', 'meta', { property: 'og:url', content: canonical });
        ensure('seo-og-type', 'meta', { property: 'og:type', content: 'website' });
        ensure('seo-og-locale', 'meta', { property: 'og:locale', content: lang === 'en' ? 'en_US' : 'my_MM' });
        ensure('seo-og-locale-alternate', 'meta', { property: 'og:locale:alternate', content: lang === 'en' ? 'my_MM' : 'en_US' });
        ensure('seo-og-site', 'meta', { property: 'og:site_name', content: 'WeCare Myanmar | ဝီကဲယား မြန်မာ' });
        ensure('seo-twitter-card', 'meta', { name: 'twitter:card', content: 'summary_large_image' });
        ensure('seo-twitter-title', 'meta', { name: 'twitter:title', content: shareTitle });
        ensure('seo-twitter-description', 'meta', { name: 'twitter:description', content: shareDescription });
        ensure('seo-twitter-image', 'meta', { name: 'twitter:image', content: image });
        ensure('seo-twitter-image-alt', 'meta', { name: 'twitter:image:alt', content: 'WeCare Myanmar | ဝီကဲယား မြန်မာ' });

        const payload = data.json_ld?.[lang] || data.json_ld?.my || null;
        const jsonLd = ensure('seo-jsonld', 'script', { type: 'application/ld+json' });
        jsonLd.textContent = payload ? JSON.stringify(payload) : '';

        return () => {
            ensure('seo-description', 'meta', { name: 'description', content: '' });
            ensure('seo-robots', 'meta', { name: 'robots', content: 'noindex, nofollow' });
            const existingJsonLd = document.getElementById('seo-jsonld');
            if (existingJsonLd) {
                existingJsonLd.textContent = '';
            }
        };
    }, [data, description, fullTitle, lang, shareDescription, shareTitle, title]);

    if (!data || !title) {
        return null;
    }

    return <Head title={title} />;
}
