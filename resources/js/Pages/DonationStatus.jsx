import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock3, Copy, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';
import { DONATION_RECEIPT_EVENT, readDonationReceipts } from '../lib/donationReceipts';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const formatDateTime = (value, lang) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(lang === 'my' ? 'my-MM' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

export default function DonationStatus() {
    const [lang, setLang] = useLanguage();
    const [trackingToken, setTrackingToken] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [lastLookup, setLastLookup] = useState('');
    const [savedReceipts, setSavedReceipts] = useState(() => readDonationReceipts());
    const [copiedId, setCopiedId] = useState('');
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);

    const lookup = async (token) => {
        if (!token) {
            setError(copy('လှူဒါန်းမှုအမှတ် ထည့်ပါ။', 'Enter your donation tracking ID.'));
            setResult(null);
            return;
        }

        setProcessing(true);
        setError('');
        setResult(null);
        setLastLookup(token);

        try {
            if (!navigator.onLine) {
                throw new Error('offline');
            }
            const response = await fetch(route('donations.status', token), {
                headers: { Accept: 'application/json' },
                cache: 'no-store',
            });
            if (!response.ok) {
                throw new Error('not-found');
            }
            setResult(await response.json());
        } catch (lookupError) {
            setError(lookupError.message === 'offline'
                ? copy('အင်တာနက်ချိတ်ဆက်မှု မရှိသေးပါ။ ချိတ်ဆက်ပြီး ပြန်ကြိုးစားပါ။', 'You appear to be offline. Reconnect and try again.')
                : copy('ဒီလှူဒါန်းမှုအမှတ်ကို မတွေ့ပါ။ ပြန်စစ်ပြီး ထပ်ကြိုးစားပါ။', 'We could not find this donation. Check the tracking ID and try again.'));
        } finally {
            setProcessing(false);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const sync = () => setSavedReceipts(readDonationReceipts());
        window.addEventListener(DONATION_RECEIPT_EVENT, sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener(DONATION_RECEIPT_EVENT, sync);
            window.removeEventListener('storage', sync);
        };
    }, []);

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token')?.trim();
        if (!token) {
            return;
        }
        setTrackingToken(token);
        lookup(token);
    }, []);

    useEffect(() => {
        if (result?.status !== 'pending' || !lastLookup) {
            return undefined;
        }

        const token = lastLookup;
        const timer = window.setInterval(async () => {
            try {
                const response = await fetch(route('donations.status', token), {
                    headers: { Accept: 'application/json' },
                    cache: 'no-store',
                });
                if (!response.ok) {
                    return;
                }
                setResult(await response.json());
            } catch {
                // Keep the last known status until the next check.
            }
        }, 12000);

        return () => window.clearInterval(timer);
    }, [result?.status, lastLookup]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await lookup(trackingToken.trim());
    };

    const copyTrackingId = async (token) => {
        if (!token) return;
        try {
            await navigator.clipboard.writeText(token);
            setCopiedId(token);
            window.setTimeout(() => setCopiedId(''), 1800);
        } catch {
            setCopiedId('');
        }
    };

    const drawTrackingCard = (token) => {
        if (!token) return null;
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 520;
        const context = canvas.getContext('2d');
        if (!context) return null;
        context.fillStyle = '#065F46';
        context.fillRect(0, 0, 900, 520);
        context.fillStyle = '#F59E0B';
        context.fillRect(0, 0, 900, 14);
        context.fillStyle = '#ffffff';
        context.font = 'bold 40px sans-serif';
        context.fillText('WeCare Myanmar', 48, 92);
        context.fillStyle = '#D1FAE5';
        context.font = '24px sans-serif';
        context.fillText(copy('လှူဒါန်းမှု ခြေရာခံအမှတ်', 'Donation tracking ID'), 48, 160);
        context.fillStyle = '#ffffff';
        context.font = 'bold 22px monospace';
        const lines = token.match(/.{1,36}/g) || [token];
        lines.forEach((line, index) => context.fillText(line, 48, 220 + index * 36));
        context.fillStyle = '#FCD34D';
        context.font = '20px sans-serif';
        context.fillText(copy('ဤအမှတ်ဖြင့် အခြေအနေ စစ်ဆေးနိုင်ပါသည်', 'Use this ID to check your donation status'), 48, 470);
        return canvas;
    };

    const saveTrackingCard = (token) => {
        const canvas = drawTrackingCard(token);
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'wecare-tracking-id.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const shareTrackingCard = async (token) => {
        const canvas = drawTrackingCard(token);
        if (!canvas) return;
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
        const file = blob ? new File([blob], 'wecare-tracking-id.png', { type: 'image/png' }) : null;
        if (file && navigator.canShare?.({ files: [file] })) {
            try {
                await navigator.share({ files: [file], title: 'WeCare Myanmar', text: copy('လှူဒါန်းမှု ခြေရာခံအမှတ်', 'Donation tracking ID') });
                return;
            } catch {
                return;
            }
        }
        saveTrackingCard(token);
    };

    const statusCopy = {
        pending: copy('စစ်ဆေးနေဆဲ', 'Under review'),
        approved: copy('အတည်ပြုပြီး', 'Approved'),
        rejected: copy('အတည်မပြုနိုင်ပါ', 'Not approved'),
    };
    const status = result?.status || 'pending';
    const StatusIcon = status === 'approved' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock3;
    const statusTone = status === 'approved' ? 'bg-emerald-100 text-emerald-800' : status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';
    const timeline = [
        { key: 'submitted', label: copy('တင်သွင်းပြီး', 'Submitted'), date: result?.submitted_at, complete: Boolean(result?.submitted_at) },
        { key: 'review', label: copy('စစ်ဆေးနေဆဲ', 'Under review'), date: result?.reviewed_at, complete: Boolean(result?.reviewed_at) || status === 'pending' },
        { key: 'decision', label: status === 'rejected' ? copy('အတည်မပြုနိုင်ပါ', 'Not approved') : copy('အတည်ပြုပြီး', 'Approved'), date: result?.approved_at || result?.reviewed_at, complete: status !== 'pending' },
    ];

    return (
        <>
            <PublicLayout active="status" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
                    <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <ArrowLeft className="h-4 w-4" /> {copy('မူလသို့', 'Back home')}
                    </Link>

                    <section className="mt-8 rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('လှူဒါန်းမှုအခြေအနေ', 'Donation status')}</p>
                        <h1 className="mt-2 text-3xl font-black md:text-4xl">{copy('လှူဒါန်းမှုကို ပြန်စစ်ရန်', 'Track your donation')}</h1>
                        <p className="mt-3 max-w-xl text-sm text-emerald-50/80">{copy('လှူဒါန်းပြီးနောက် ရရှိထားသော လှူဒါန်းမှုအမှတ်ကို ထည့်ပြီး အခြေအနေကို စစ်ဆေးနိုင်ပါသည်။', 'Enter the tracking ID you received after submitting your donation to check its latest status.')}</p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                            <label htmlFor="tracking-token" className="block text-sm font-semibold text-emerald-50">{copy('လှူဒါန်းမှုအမှတ်', 'Donation tracking ID')}</label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <input
                                    id="tracking-token"
                                    type="text"
                                    value={trackingToken}
                                    onChange={(event) => setTrackingToken(event.target.value)}
                                    placeholder={copy('တင်သွင်းပြီးနောက် ရရှိသော အမှတ် (ဥပမာ အက္ခရာ/ဂဏန်း ရှည်လျားသော code)', 'The ID you received after submitting (long code)')}
                                    autoComplete="off"
                                    spellCheck={false}
                                    className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-emerald-100/60 outline-none focus:border-[#F59E0B]"
                                />
                                <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#065F46] disabled:cursor-not-allowed disabled:opacity-60">
                                    <Search className="h-4 w-4" /> {processing ? copy('စစ်ဆေးနေသည်...', 'Checking...') : copy('စစ်ဆေးရန်', 'Check status')}
                                </button>
                            </div>
                            <p className="text-xs leading-relaxed text-emerald-50/80">{copy('အီးမေးလ် မထည့်ထားသူများအတွက် ဤခြေရာခံအမှတ်သည် အခြေအနေစစ်ဆေးရာ တစ်ခုတည်းသော လမ်းကြောင်းဖြစ်နိုင်ပါသည်။ တင်သွင်းပြီးချိန်တွင် ကူးယူ/ပုံသိမ်း/ဝေမျှ ထားပါ။', 'If you did not provide an email, this tracking ID may be the only way to check your status. Copy, save, or share it after submitting.')}</p>
                        </form>

                        {savedReceipts.length > 0 && (
                            <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                                <p className="text-sm font-semibold text-white">{copy('ဤစက်ထဲ သိမ်းထားသော လှူဒါန်းမှုအမှတ်များ', 'Tracking IDs saved on this device')}</p>
                                <div className="mt-3 space-y-2">
                                    {savedReceipts.slice(0, 5).map((receipt) => (
                                        <div key={receipt.tracking_token} className="flex flex-col gap-2 rounded-xl bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0">
                                                <p className="truncate font-mono text-xs text-emerald-50/90">{receipt.tracking_token}</p>
                                                <p className="mt-0.5 text-xs text-emerald-50/70">{receipt.donor_name || copy('အမည်မဖော်ပြ', 'Anonymous')} · MMK {Number(receipt.amount || 0).toLocaleString('en-US')}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button type="button" onClick={() => { setTrackingToken(receipt.tracking_token); lookup(receipt.tracking_token); }} className="rounded-full bg-[#F59E0B] px-3 py-1.5 text-xs font-bold text-[#065F46]">{copy('စစ်ရန်', 'Check')}</button>
                                                <button type="button" onClick={() => copyTrackingId(receipt.tracking_token)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">{copiedId === receipt.tracking_token ? copy('ကူးပြီး', 'Copied') : copy('ကူးရန်', 'Copy')}</button>
                                                <button type="button" onClick={() => saveTrackingCard(receipt.tracking_token)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">{copy('ပုံသိမ်း', 'Save')}</button>
                                                <button type="button" onClick={() => shareTrackingCard(receipt.tracking_token)} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">{copy('ဝေမျှ', 'Share')}</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {error && (
                        <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                            <p className="font-semibold">{error}</p>
                            <ul className="mt-2 list-disc space-y-1 pl-5 text-red-800/90">
                                <li>{copy('အမှတ်ကို ကူးယူထည့်စဉ် ရှေ့/နောက် space မပါအောင် စစ်ပါ။', 'Remove extra spaces before/after the ID.')}</li>
                                <li>{copy('အက္ခရာ/ဂဏန်း အပြည့်အစုံ ပါဝင်မှု ရှိမရှိ ပြန်စစ်ပါ။', 'Make sure the full code is included.')}</li>
                                <li>{copy('အီးမေးလ် မထည့်ခဲ့လျှင် တင်သွင်းပြီးချိန်တွင် ပြသခဲ့သော အမှတ်ကို အသုံးပြုရပါမည်။', 'If you did not provide an email, use the ID shown right after submission.')}</li>
                            </ul>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {lastLookup && <button type="button" onClick={handleSubmit} className="rounded-full bg-white px-3 py-2 text-xs font-bold text-red-800 ring-1 ring-red-200">{copy('ပြန်ကြိုးစားရန်', 'Try again')}</button>}
                                <Link href={route('donate')} className="rounded-full bg-red-800 px-3 py-2 text-xs font-bold text-white">{copy('လှူဒါန်းမှု ပြန်တင်ရန်', 'Submit a donation')}</Link>
                            </div>
                        </div>
                    )}

                    {result && (
                        <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8" aria-live="polite">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{copy('လှူဒါန်းမှုအခြေအနေ', 'Donation status')}</p>
                                    <h2 className="mt-2 text-2xl font-black text-slate-900">{result.donor_name || copy('အမည်မဖော်ပြထားသူ', 'Anonymous donor')}</h2>
                                </div>
                                <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${statusTone}`}>
                                    <StatusIcon className="h-4 w-4" /> {statusCopy[status] || statusCopy.pending}
                                </span>
                            </div>
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs text-emerald-700">{copy('လှူဒါန်းပမာဏ', 'Amount')}</p><p className="mt-1 text-xl font-black text-slate-900">{currency.format(Number(result.amount) || 0)}</p></div>
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-600">{copy('လှူဒါန်းမှုအမှတ်', 'Tracking ID')}</p>
                                    <p className="mt-1 break-all font-mono text-sm font-bold text-slate-900">{trackingToken.trim()}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button type="button" onClick={() => copyTrackingId(trackingToken.trim())} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200"><Copy className="h-3.5 w-3.5" />{copiedId === trackingToken.trim() ? copy('ကူးပြီး', 'Copied') : copy('ကူးရန်', 'Copy')}</button>
                                        <button type="button" onClick={() => saveTrackingCard(trackingToken.trim())} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 ring-1 ring-slate-200">{copy('ပုံသိမ်း', 'Save image')}</button>
                                        <button type="button" onClick={() => shareTrackingCard(trackingToken.trim())} className="rounded-full bg-[#065F46] px-3 py-1.5 text-xs font-semibold text-white">{copy('ဝေမျှ', 'Share')}</button>
                                    </div>
                                </div>
                            </div>
                            <ol className="mt-6 grid gap-3 sm:grid-cols-3" aria-label={copy('လှူဒါန်းမှု အခြေအနေမှတ်တမ်း', 'Donation status timeline')}>
                                {timeline.map((item, index) => (
                                    <li key={item.key} className={`rounded-2xl border p-4 ${item.complete ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                        <div className="flex items-center gap-2"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${item.complete ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{index + 1}</span><span className="text-sm font-bold text-slate-800">{item.label}</span></div>
                                        {item.date && <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.date, lang)}</p>}
                                    </li>
                                ))}
                            </ol>
                            <p className="mt-5 text-base text-slate-600">
                                {status === 'approved' ? copy('လှူဒါန်းမှုကို အတည်ပြုပြီးပါပြီ။ ကျေးဇူးတင်လွှာ ရရှိနိုင်ပါပြီ။', 'Your donation has been approved. Your appreciation certificate is available.') : status === 'rejected' ? copy('အသေးစိတ်အတွက် WeCare အဖွဲ့ကို ဆက်သွယ်ပါ။', 'Please contact the WeCare team for more details.') : copy('အဖွဲ့မှ ငွေလွှဲပြေစာကို စစ်ဆေးနေပါသည်။ ပုံမှန်အားဖြင့် အလုပ်လုပ်ရက် ၁–၂ ရက်အတွင်း စစ်ဆေးပေးပါမည်။', 'The team is reviewing your payment slip. Reviews are usually completed within 1–2 working days.')}
                            </p>
                            {result.review_note && (
                                <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">{copy('အဖွဲ့မှ မှတ်ချက်', 'Note from the team')}</p>
                                    <p className="mt-2 text-sm text-slate-800">{result.review_note}</p>
                                </div>
                            )}
                            {result.certificate_url && <a href={result.certificate_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-[#065F46] px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">{copy('Certificate ရယူရန်', 'Download certificate')}</a>}
                        </section>
                    )}
                </main>
            </PublicLayout>
        </>
    );
}
