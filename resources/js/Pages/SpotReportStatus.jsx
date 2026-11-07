import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock3, Search, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

export default function SpotReportStatus() {
    const [lang, setLang] = useLanguage();
    const [referenceCode, setReferenceCode] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [lastLookup, setLastLookup] = useState('');
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);

    const statusLabels = {
        unread: copy('လက်ခံရရှိပြီး', 'Received'),
        checked: copy('စစ်ဆေးပြီး', 'Checked'),
        in_progress: copy('ဆောင်ရွက်နေသည်', 'In progress'),
        resolved: copy('ကူညီပြီးစီး', 'Resolved'),
    };

    const lookup = async (code, quiet = false) => {
        if (!code) {
            setError(copy('သတင်းပေးမှုအမှတ် ထည့်ပါ။', 'Enter your report reference code.'));
            setResult(null);
            return;
        }

        if (!quiet) {
            setProcessing(true);
            setError('');
            setResult(null);
        }
        setLastLookup(code);

        try {
            if (!navigator.onLine) {
                throw new Error('offline');
            }
            const response = await fetch(route('spot-reports.status', code), { headers: { Accept: 'application/json' }, cache: 'no-store' });
            if (!response.ok) {
                throw new Error('not-found');
            }
            setResult(await response.json());
            if (!quiet) {
                setError('');
            }
        } catch (lookupError) {
            if (quiet) {
                return;
            }
            setError(lookupError.message === 'offline'
                ? copy('အင်တာနက်ချိတ်ဆက်မှု မရှိသေးပါ။ ချိတ်ဆက်ပြီး ပြန်ကြိုးစားပါ။', 'You appear to be offline. Reconnect and try again.')
                : copy('ဒီသတင်းပေးမှုအမှတ်ကို မတွေ့ပါ။ ပြန်စစ်ပြီး ထပ်ကြိုးစားပါ။', 'We could not find this report. Check the reference code and try again.'));
        } finally {
            if (!quiet) {
                setProcessing(false);
            }
        }
    };

    useEffect(() => {
        const code = new URLSearchParams(window.location.search).get('code')?.trim();
        if (!code) {
            return;
        }
        setReferenceCode(code);
        lookup(code.toUpperCase());
    }, []);

    useEffect(() => {
        if (!result || result.status === 'resolved' || !lastLookup) {
            return undefined;
        }

        const code = lastLookup;
        const timer = window.setInterval(() => {
            lookup(code, true);
        }, 12000);

        return () => window.clearInterval(timer);
    }, [result?.status, lastLookup]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        await lookup(referenceCode.trim().toUpperCase());
    };

    return (
        <>
            <PublicLayout active="community" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-3xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
                    <Link href={route('community')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"><ArrowLeft className="h-4 w-4" /> {copy('အသိုက်အဝန်းသို့', 'Back to community')}</Link>
                    <section className="mt-8 rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('သတင်းပေးမှုအခြေအနေ', 'Report status')}</p>
                        <h1 className="mt-2 text-3xl font-black md:text-4xl">{copy('အကူအညီတောင်းထားမှုကို ပြန်စစ်ရန်', 'Track a community report')}</h1>
                        <p className="mt-3 text-sm text-emerald-50/80">{copy('တင်သွင်းပြီးနောက် ရရှိထားသော WR- အမှတ်ကို ထည့်ပြီး လက်ရှိအခြေအနေကို စစ်ဆေးနိုင်ပါသည်။', 'Enter the WR- reference code received after submitting a report.')}</p>
                        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                            <label htmlFor="report-reference" className="block text-sm font-semibold text-emerald-50">{copy('သတင်းပေးမှုအမှတ်', 'Report reference code')}</label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <input id="report-reference" type="text" value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} placeholder="WR-..." autoComplete="off" className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm uppercase text-white placeholder:text-emerald-100/60 outline-none focus:border-[#F59E0B]" />
                                <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#065F46] disabled:cursor-not-allowed disabled:opacity-60"><Search className="h-4 w-4" /> {processing ? copy('စစ်ဆေးနေသည်...', 'Checking...') : copy('စစ်ဆေးရန်', 'Check status')}</button>
                            </div>
                        </form>
                    </section>
                    {error && <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"><p>{error}</p>{lastLookup && <button type="button" onClick={handleSubmit} className="mt-3 rounded-full bg-white px-3 py-2 text-xs font-bold text-red-800 ring-1 ring-red-200">{copy('ပြန်ကြိုးစားရန်', 'Try again')}</button>}</div>}
                    {result && <section className="mt-5 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8" aria-live="polite">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{copy('အခြေအနေ', 'Status')}</p><h2 className="mt-2 text-2xl font-black text-slate-900">{result.township}</h2></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> {statusLabels[result.status] || statusLabels.unread}</span></div>
                        <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-600">{copy('သတင်းပေးမှုအမှတ်', 'Reference')}</p><p className="mt-1 font-mono text-sm font-bold text-slate-900">{result.reference_code}</p></div><div className="rounded-2xl bg-amber-50 p-4"><p className="text-xs text-amber-700">{copy('အရေးပေါ်အဆင့်', 'Urgency')}</p><p className="mt-1 text-sm font-bold text-slate-900">{result.urgency}</p></div></div>
                        <p className="mt-5 text-base text-slate-600">{result.status === 'resolved' ? copy('အဖွဲ့မှ သတင်းပေးထားသောနေရာကို ကူညီပြီးစီးပါပြီ။', 'The outreach team has completed the follow-up.') : copy('အဖွဲ့မှ အချက်အလက်ကို စစ်ဆေးနေပါသည်။ မပြီးသေးသရွေ့ ဤစာမျက်နှာက အခြေအနေကို ကိုယ်တိုင် ပြန်စစ်ပါမည်။', 'The team is still working on this report. This page keeps checking until it is complete.')}</p>
                        {result.follow_up_note && <div className="mt-4 flex gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-slate-700"><Wrench className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /><p>{result.follow_up_note}</p></div>}
                    </section>}
                    <div className="mt-6 flex items-center gap-2 text-xs text-slate-500"><Clock3 className="h-4 w-4" /> {copy('အကျိုးခံစားသူ၏ ကိုယ်ရေးအချက်အလက်များကို မဖော်ပြပါ။', 'Beneficiary personal information is not shown.')}</div>
                </main>
            </PublicLayout>
        </>
    );
}
