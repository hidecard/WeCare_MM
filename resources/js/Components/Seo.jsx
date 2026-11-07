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

    useEffect(() => {
        if (!data || !title) {
            return undefined;
        }

        const canonical = data.canonical || window.location.origin + window.location.pathname;

        ensure('seo-description', 'meta', { name: 'description', content: description });
        ensure('seo-robots', 'meta', { name: 'robots', content: data.index ? 'index, follow' : 'noindex, nofollow' });
        ensure('seo-canonical', 'link', { rel: 'canonical', href: canonical });
        ensure('seo-og-title', 'meta', { property: 'og:title', content: fullTitle });
        ensure('seo-og-description', 'meta', { property: 'og:description', content: description });
        ensure('seo-og-url', 'meta', { property: 'og:url', content: canonical });
        ensure('seo-og-type', 'meta', { property: 'og:type', content: 'website' });
        ensure('seo-og-locale', 'meta', { property: 'og:locale', content: lang === 'en' ? 'en_US' : 'my_MM' });
        ensure('seo-og-site', 'meta', { property: 'og:site_name', content: 'WeCare Myanmar' });
        ensure('seo-twitter-card', 'meta', { name: 'twitter:card', content: 'summary' });
        ensure('seo-twitter-title', 'meta', { name: 'twitter:title', content: fullTitle });
        ensure('seo-twitter-description', 'meta', { name: 'twitter:description', content: description });

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
    }, [data, description, fullTitle, lang, title]);

    if (!data || !title) {
        return null;
    }

    return <Head title={title} />;
}
