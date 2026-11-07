import { useEffect, useState } from 'react';

const STORAGE_KEY = 'wecare-language';
const DEFAULT_LANGUAGE = 'my';

const normalizeLanguage = (language) => (language === 'en' ? 'en' : DEFAULT_LANGUAGE);

const applyDocumentLang = (language) => {
    if (typeof document !== 'undefined') {
        document.documentElement.lang = language === 'en' ? 'en' : 'my';
    }
};

const getStoredLanguage = () => {
    if (typeof window === 'undefined') {
        return DEFAULT_LANGUAGE;
    }

    try {
        return normalizeLanguage(window.localStorage.getItem(STORAGE_KEY));
    } catch {
        return DEFAULT_LANGUAGE;
    }
};

export default function useLanguage() {
    const [lang, setLanguage] = useState(getStoredLanguage);

    useEffect(() => {
        applyDocumentLang(lang);
    }, [lang]);

    const setLang = (nextLanguage) => {
        const resolvedLanguage = typeof nextLanguage === 'function'
            ? nextLanguage(lang)
            : nextLanguage;
        const normalizedLanguage = normalizeLanguage(resolvedLanguage);

        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(STORAGE_KEY, normalizedLanguage);
            } catch {
                // Keep the in-memory language working when storage is unavailable.
            }
        }

        setLanguage(normalizedLanguage);
    };

    return [lang, setLang];
}
