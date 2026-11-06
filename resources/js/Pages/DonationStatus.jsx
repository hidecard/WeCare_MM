import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Clock3, Search, XCircle } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

export default function DonationStatus() {
    const [lang, setLang] = useLanguage();
    const [trackingToken, setTrackingToken] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [lastLookup, setLastLookup] = useState('');
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = trackingToken.trim();
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

    const statusCopy = {
        pending: copy('စစ်ဆေးနေဆဲ', 'Under review'),
        approved: copy('အတည်ပြုပြီး', 'Approved'),
        rejected: copy('အတည်မပြုနိုင်ပါ', 'Not approved'),
    };
    const status = result?.status || 'pending';
    const StatusIcon = status === 'approved' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock3;
    const statusTone = status === 'approved' ? 'bg-emerald-100 text-emerald-800' : status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';

    return (
        <>
            <Head title={copy('လှူဒါန်းမှုအခြေအနေ', 'Donation status')} />
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
                                    placeholder="WC-..."
                                    autoComplete="off"
                                    className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-emerald-100/60 outline-none focus:border-[#F59E0B]"
                                />
                                <button type="submit" disabled={processing} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#065F46] disabled:cursor-not-allowed disabled:opacity-60">
                                    <Search className="h-4 w-4" /> {processing ? copy('စစ်ဆေးနေသည်...', 'Checking...') : copy('စစ်ဆေးရန်', 'Check status')}
                                </button>
                            </div>
                        </form>
                    </section>

                    {error && <div role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"><p>{error}</p>{lastLookup && <button type="button" onClick={handleSubmit} className="mt-3 rounded-full bg-white px-3 py-2 text-xs font-bold text-red-800 ring-1 ring-red-200">{copy('ပြန်ကြိုးစားရန်', 'Try again')}</button>}</div>}

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
                                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-600">{copy('လှူဒါန်းမှုအမှတ်', 'Tracking ID')}</p><p className="mt-1 break-all font-mono text-sm font-bold text-slate-900">{trackingToken.trim()}</p></div>
                            </div>
                            <p className="mt-5 text-sm text-slate-600">
                                {status === 'approved' ? copy('လှူဒါန်းမှုကို အတည်ပြုပြီးပါပြီ။ ကျေးဇူးတင်လွှာ ရရှိနိုင်ပါပြီ။', 'Your donation has been approved. Your appreciation certificate is available.') : status === 'rejected' ? copy('အသေးစိတ်အတွက် WeCare အဖွဲ့ကို ဆက်သွယ်ပါ။', 'Please contact the WeCare team for more details.') : copy('အဖွဲ့မှ ငွေလွှဲပြေစာကို စစ်ဆေးနေပါသည်။ အတည်ပြုပြီးပါက ဤနေရာတွင် update ဖြစ်ပါမည်။', 'The team is reviewing your payment slip. This page will show the updated status after review.')}
                            </p>
                            {result.certificate_url && <a href={result.certificate_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-[#065F46] px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">{copy('Certificate ရယူရန်', 'Download certificate')}</a>}
                        </section>
                    )}
                </main>
            </PublicLayout>
        </>
    );
}
