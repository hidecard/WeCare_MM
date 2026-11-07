export function normalizeMyanmarMobile(value) {
    return String(value || '').replace(/[\s\-()]/g, '');
}

export function myanmarMobileError(value, lang = 'my') {
    const digits = normalizeMyanmarMobile(value);

    if (!digits || /^09\d{7,9}$/.test(digits)) {
        return '';
    }

    return lang === 'my' ? '09 ဖြင့် စသော ဖုန်းနံပါတ် ထည့်ပါ။' : 'Enter a mobile number that starts with 09.';
}
