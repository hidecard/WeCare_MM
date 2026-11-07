const myanmarMonths = ['ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'];
const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];

const toMyanmarDigits = (value) => String(value).replace(/\d/g, (digit) => myanmarDigits[Number(digit)]);

const parseDate = (value) => {
    if (!value) {
        return null;
    }

    const safeDate = typeof value === 'string' && value.includes('T') ? value : `${value}T12:00:00`;
    const parsed = new Date(safeDate);

    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function formatDisplayDate(value, lang = 'en') {
    const parsed = parseDate(value);

    if (!parsed) {
        return value ? String(value) : '—';
    }

    if (lang === 'my') {
        return `${toMyanmarDigits(parsed.getFullYear())} ${myanmarMonths[parsed.getMonth()]} ${toMyanmarDigits(parsed.getDate())}`;
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
}

export function formatMonthLabel(value, lang = 'en') {
    const parsed = parseDate(String(value).length === 7 ? `${value}-01` : value);

    if (!parsed) {
        return String(value || '—');
    }

    if (lang === 'my') {
        return `${toMyanmarDigits(parsed.getFullYear())} ${myanmarMonths[parsed.getMonth()]}`;
    }

    return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(parsed);
}
