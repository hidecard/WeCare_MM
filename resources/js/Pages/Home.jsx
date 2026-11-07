import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Building2, Check, HandHeart, HeartHandshake, MapPinned, ShieldCheck, Soup, Sparkles, Stethoscope, Users, WalletCards, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import DonationFlow from '../Components/DonationFlow';
import DonationFlowSteps from '../Components/DonationFlowSteps';
import useLanguage from '../hooks/useLanguage';
import { saveDonationReceipt } from '../lib/donationReceipts';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const numberFormat = new Intl.NumberFormat('en-MM');

const formatDisplayDate = (value) => {
    if (!value) return '—';
    const safeDate = typeof value === 'string' && value.includes('T') ? value : `${value}T12:00:00`;
    const parsed = new Date(safeDate);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
};

const stepLabels = {
    my: ['ရွေးချယ်', 'ငွေပေးချေ', 'အတည်ပြု'],
    en: ['Choose', 'Pay', 'Confirm'],
};

function Stepper({ step, lang }) {
    const labels = stepLabels[lang] ?? stepLabels.en;
    return (
        <div className="mt-5" aria-label={lang === 'my' ? 'လှူဒါန်းမှု အဆင့်များ' : 'Donation steps'}>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-[#F59E0B] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <ol className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {labels.map((label, i) => {
                    const n = i + 1;
                    const done = step > n;
                    const current = step === n;
                    return (
                        <li key={label} aria-current={current ? 'step' : undefined} className={`flex items-center justify-center gap-1 rounded-full px-2 py-2 text-center font-semibold transition ${current ? 'bg-[#F59E0B] text-[#065F46]' : done ? 'bg-white/15 text-white' : 'bg-white/5 text-emerald-50/70'}`}>
                            {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span>{n}</span>}
                            <span className="truncate">{label}</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

export default function Home({ impact = {}, fundPools = [], recentDonations = [], recentTrips = [], financialSummary = {}, paymentDetails = {} }) {
    const { flash = {} } = usePage().props;
    const [lang, setLang] = useLanguage();
    const [selectedPoolId, setSelectedPoolId] = useState(fundPools[0]?.id ?? 1);
    const [selectedAmount, setSelectedAmount] = useState(10000);
    const [selectedPayment, setSelectedPayment] = useState(Object.keys(paymentDetails)[0] ?? '');
    const [copiedNumber, setCopiedNumber] = useState('');
    const [step, setStep] = useState(1);
    const [activeCommunityTab, setActiveCommunityTab] = useState('report');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripPage, setTripPage] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [slipPreview, setSlipPreview] = useState('');
    const [slipError, setSlipError] = useState('');

    const selectedPool = fundPools.find((pool) => Number(pool.id) === Number(selectedPoolId)) ?? fundPools[0] ?? {};
    const amountNum = Number(selectedAmount) || 0;
    const unitCost = Math.max(Number(selectedPool.unit_cost) || 5000, 1);
    const estimatedPeople = Math.max(1, Math.round(amountNum / unitCost));
    const poolName = lang === 'my' ? (selectedPool.title_mm || selectedPool.title_en || 'အထွေထွေ ကူညီရေး') : (selectedPool.title_en || selectedPool.title_mm || 'General outreach');
    const impactMessage = lang === 'my'
        ? `${currency.format(amountNum)} = ${poolName}အတွက် သက်ကြီးရွယ်အို ~${numberFormat.format(estimatedPeople)} ဦးကို ကူညီနိုင်ပါသည်`
        : `${currency.format(amountNum)} can help ~${numberFormat.format(estimatedPeople)} elder${estimatedPeople === 1 ? '' : 's'} through ${poolName}`;

    const tripPageSize = 6;
    const tripPageCount = Math.max(1, Math.ceil((recentTrips?.length ?? 0) / tripPageSize));
    const visibleTrips = (recentTrips ?? []).slice((tripPage - 1) * tripPageSize, (tripPage - 1) * tripPageSize + tripPageSize);
    const isLaunching = [impact.total_elderly_helped, impact.meals_distributed, impact.medical_aid_provided, impact.townships_reached].every((v) => !Number(v));

    const donationForm = useForm({
        fund_pool_id: selectedPool.id ?? 1,
        amount: selectedAmount,
        payment_method: selectedPayment,
        donor_name: '',
        is_anonymous: false,
        phone: '',
        donor_email: '',
        wish_note: '',
        slip_image: null,
    });

    const reportForm = useForm({ township: '', street_landmark: '', time_seen: '', condition_note: '', reporter_phone: '' });
    const volunteerForm = useForm({ name: '', phone: '', township: '', available_days: 'Weekdays', status: 'available' });

    const statCards = [
        { label: lang === 'my' ? 'ကူညီခဲ့သော သက်ကြီးရွယ်အို' : 'Elders helped', value: numberFormat.format(impact.total_elderly_helped ?? 0), icon: Users },
        { label: lang === 'my' ? 'အစားအစာ ထုပ်ပိုးမှု' : 'Meal boxes', value: numberFormat.format(impact.meals_distributed ?? 0), icon: Soup },
        { label: lang === 'my' ? 'ဆေးဝါး ကူညီမှု' : 'Medical aid', value: numberFormat.format(impact.medical_aid_provided ?? 0), icon: Stethoscope },
        { label: lang === 'my' ? 'ရောက်ရှိသော မြို့နယ်' : 'Townships reached', value: numberFormat.format(impact.townships_reached ?? 0), icon: MapPinned },
    ];

    const copyPaymentNumber = async (method) => {
        const phone = paymentDetails[method]?.phone;
        if (!phone) return;
        try {
            await navigator.clipboard.writeText(phone.replace(/\s+/g, ''));
            setCopiedNumber(method);
            setTimeout(() => setCopiedNumber(''), 1500);
        } catch {
            setCopiedNumber(method);
        }
    };

    const handlePoolSelect = (poolId) => {
        setSelectedPoolId(poolId);
        setStep(1);
        donationForm.setData((data) => ({ ...data, fund_pool_id: poolId }));
    };
    const handleAmountSelect = (amount) => {
        const next = String(amount ?? '').replace(/[^\d]/g, '');
        setSelectedAmount(next);
        setStep(1);
        donationForm.setData((data) => ({ ...data, amount: next }));
    };
    const handlePaymentSelect = (method) => { setSelectedPayment(method); donationForm.setData('payment_method', method); };

    const handleSlipChange = (event) => {
        const file = event.target.files?.[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (file && (!allowedTypes.includes(file.type) || file.size > 4 * 1024 * 1024)) {
            event.target.value = '';
            donationForm.setData('slip_image', null);
            setSlipPreview('');
            setSlipError(lang === 'my' ? 'JPG, PNG, WEBP (4 MB အထိ) သာ တင်နိုင်ပါသည်။' : 'Please upload a JPG, PNG, or WEBP image under 4 MB.');
            return;
        }
        donationForm.setData('slip_image', file || null);
        setSlipPreview(file ? URL.createObjectURL(file) : '');
        setSlipError('');
    };

    useEffect(() => { if (flash?.success) setShowSuccessModal(true); }, [flash?.success]);
    useEffect(() => {
        if (!showSuccessModal) return undefined;
        const closeOnEscape = (event) => { if (event.key === 'Escape') setShowSuccessModal(false); };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [showSuccessModal]);

    const handleDonationSubmit = (event) => {
        event.preventDefault();
        donationForm.post(route('donations.store'), {
            forceFormData: true,
            onSuccess: (page) => {
                saveDonationReceipt(page.props.flash?.donation_receipt);
                setShowSuccessModal(true);
                donationForm.reset();
                setStep(1);
                setSelectedPoolId(fundPools[0]?.id ?? 1);
                setSelectedAmount(10000);
                setSelectedPayment(Object.keys(paymentDetails)[0] ?? '');
                setSlipPreview('');
            },
        });
    };

    const handleReportSubmit = (event) => {
        event.preventDefault();
        reportForm.post(route('spot-reports.store'), { preserveScroll: true, onSuccess: () => reportForm.reset() });
    };
    const handleVolunteerSubmit = (event) => {
        event.preventDefault();
        volunteerForm.post(route('volunteers.store'), { preserveScroll: true, onSuccess: () => volunteerForm.reset('name', 'phone', 'township') });
    };

    const canNextFromStep = (s) => {
        if (s === 1) return fundPools.length > 0 && amountNum >= 1000;
        if (s === 2) return !!paymentDetails[selectedPayment];
        return true;
    };

    return (
        <>
            <Head title={lang === 'my' ? 'WeCare Myanmar | မူလစာမျက်နှာ' : 'WeCare Myanmar | Home'} />
            <PublicLayout active="home" lang={lang} setLang={setLang}>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" role="presentation">
                        <div role="dialog" aria-modal="true" aria-labelledby="home-donation-success-title" className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-2xl">
                            <div className="flex justify-end">
                                <button type="button" aria-label={lang === 'my' ? 'ပိတ်ရန်' : 'Close'} onClick={() => setShowSuccessModal(false)} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <BadgeCheck className="h-8 w-8" />
                            </div>
                            <h3 id="home-donation-success-title" className="mt-5 text-center text-2xl font-black text-slate-900">{lang === 'my' ? 'လှူဒါန်းမှု လက်ခံရရှိပါပြီ' : 'Donation received'}</h3>
                            <p className="mt-3 text-center text-sm leading-relaxed text-slate-600">
                                {flash?.success || (lang === 'my' ? 'ကျေးဇူးတင်ပါသည်။ သင့်လှူဒါန်းမှုကို လက်ခံရရှိပြီး အဖွဲ့မှ စစ်ဆေးနေပါသည်။' : 'Thank you. Your donation has been received and is being reviewed by our outreach team.')}
                            </p>
                            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                                <Link href={route('donations.status-page')} className="rounded-full bg-emerald-700 px-5 py-2.5 text-center text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">{lang === 'my' ? 'အခြေအနေ ကြည့်ရန်' : 'Track donation'}</Link>
                                <button type="button" onClick={() => setShowSuccessModal(false)} className="rounded-full bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#065F46] transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">
                                    {lang === 'my' ? 'ပိတ်ရန်' : 'Close'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 sm:pb-20 lg:px-8">
                    <section className="grid gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#065F46] via-[#0f766e] to-[#115e59] p-6 text-white shadow-lg shadow-emerald-900/20 md:grid-cols-[1.15fr_0.85fr] md:p-10">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50">
                                <ShieldCheck className="h-3.5 w-3.5" /> {lang === 'my' ? 'ယုံကြည်စိတ်ချရသော ဒေသခံ ကူညီရေး' : 'Trusted local outreach'}
                            </span>
                            <h1 className="mt-5 max-w-xl text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl">
                                {lang === 'my' ? 'မြန်မာနိုင်ငံ လမ်းဘေးရှိ သက်ကြီးရွယ်အိုများအတွက် နွေးထွေးစောင့်ရှောက်မှု ပေးအပ်ပါ။' : 'Bring warm meals and care to elders on Myanmar’s streets.'}
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-relaxed text-emerald-50/90 md:text-base">
                                {lang === 'my'
                                    ? 'သင့်လှူဒါန်းမှုသည် ယုံကြည်စိတ်ချရသော ဒေသခံ စေတနာ့ဝန်ထမ်းများမှတစ်ဆင့် လိုအပ်သူများထံ အစားအစာ၊ ဆေးဝါးနှင့် စောင့်ရှောက်မှု ရောက်ရှိစေပါသည်။'
                                    : 'Your donation reaches vulnerable older people through trusted local volunteers with food, medical aid, and compassionate care.'}
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Link href={route('donate')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-6 py-3.5 text-sm font-bold text-[#065F46] shadow-md shadow-amber-900/20 transition hover:-translate-y-0.5 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50">
                                    {lang === 'my' ? 'ယခု လှူဒါန်းမည်' : 'Donate now'} <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href={route('impact')} className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40">
                                    {lang === 'my' ? 'ကျွန်ုပ်တို့၏ သက်ရောက်မှု' : 'See our impact'}
                                </Link>
                            </div>
                            <p className="mt-4 text-xs font-medium text-emerald-50/75">
                                {lang === 'my' ? 'ငွေပေးချေမှု စစ်ဆေးအတည်ပြု • စေတနာ့ဝန်ထမ်း ဦးဆောင် • စစ်ဆေးပြီး အပ်ဒိတ်' : 'Verified payments • Volunteer-led • Updates after review'}
                            </p>
                        </div>

                        <div className="rounded-[1.5rem] bg-[#FFFBEB] p-4 text-slate-800 shadow-xl shadow-emerald-950/20 sm:p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">{lang === 'my' ? 'သက်ရောက်မှု' : 'Our impact'}</p>
                                <BadgeCheck className="h-5 w-5 text-emerald-700" />
                            </div>
                            {isLaunching && (
                                <div className="mt-3 rounded-xl bg-amber-50 p-3 ring-1 ring-amber-100">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><Sparkles className="h-4 w-4" /> {lang === 'my' ? 'စတင်ခြင်း အဆင့်' : 'Just getting started'}</p>
                                    <p className="mt-1 text-xs leading-relaxed text-amber-800/90">{lang === 'my' ? 'ယနေ့ သင့်လှူဒါန်းမှုက ပထမဆုံး ပြောင်းလဲမှုကို စတင်ပါမည်။' : 'Your gift today helps launch our first outreach impact.'}</p>
                                </div>
                            )}
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {statCards.map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="rounded-2xl border border-amber-100/80 bg-amber-50/70 p-3">
                                        <Icon className="h-4 w-4 text-emerald-700" />
                                        <p className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">{value}</p>
                                        <p className="mt-1 text-[11px] font-medium leading-snug text-slate-600 sm:text-xs">{label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 rounded-2xl bg-emerald-800 p-3.5 text-sm text-emerald-50">
                                <p className="font-semibold text-emerald-50/90">{lang === 'my' ? 'လက်ရှိ လက်ကျန်' : 'Current balance'}</p>
                                <p className="mt-1 text-xl font-black">{currency.format(Number(financialSummary.current_balance ?? 0))}</p>
                            </div>
                        </div>
                    </section>

                    <section id="donate" className="mt-16 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-start">
                        <div className="space-y-4">
                            <DonationFlow fundPools={fundPools} selectedPoolId={selectedPoolId} selectedAmount={selectedAmount} onPoolSelect={handlePoolSelect} onAmountSelect={handleAmountSelect} lang={lang} compact />
                            {fundPools.length > 0 && amountNum >= 1000 && (
                                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50/60 p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{lang === 'my' ? 'သင့်လှူဒါန်းမှု သက်ရောက်မှု' : 'Your impact'}</p>
                                    <p className="mt-2 text-base font-bold leading-snug text-slate-900 sm:text-lg">{impactMessage}</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-[2rem] bg-[#065F46] p-5 text-white shadow-lg shadow-emerald-900/20 sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/90">{lang === 'my' ? 'လုံခြုံစွာ လှူဒါန်းရန်' : 'Secure donation'}</p>
                                    <h3 className="mt-1 text-xl font-black sm:text-2xl">{lang === 'my' ? 'လှူဒါန်းမှု ပြီးမြောက်အောင် လုပ်ဆောင်ပါ' : 'Complete your donation'}</h3>
                                </div>
                                <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">{step}/3</span>
                            </div>

                            <Stepper step={step} lang={lang} />

                            <div className="mt-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm text-emerald-50/80">{lang === 'my' ? 'ရွေးချယ်ထားသည်' : 'Selected'}</p>
                                        <p className="mt-1 text-2xl font-black sm:text-3xl">{currency.format(amountNum)}</p>
                                        <p className="mt-1 truncate text-xs font-medium text-emerald-50/85">{poolName}</p>
                                    </div>
                                    {step > 1 && (
                                        <button type="button" onClick={() => setStep(1)} className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40">
                                            {lang === 'my' ? 'ပြင်ရန်' : 'Change'}
                                        </button>
                                    )}
                                </div>
                                {step === 1 && <p className="mt-2 text-sm font-medium leading-relaxed text-emerald-50">{impactMessage}</p>}
                                {fundPools.length === 0 && (
                                    <p role="alert" className="mt-3 rounded-xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">
                                        {lang === 'my' ? 'လက်ရှိ လှူဒါန်းနိုင်သော ရန်ပုံငွေ မရှိသေးပါ။ နောက်မှ ပြန်ကြိုးစားပါ။' : 'No donation funds are available right now. Please try again later.'}
                                    </p>
                                )}
                            </div>

                            <DonationFlowSteps
                                step={step}
                                lang={lang}
                                paymentDetails={paymentDetails}
                                selectedPayment={selectedPayment}
                                onPaymentSelect={handlePaymentSelect}
                                onCopyPaymentNumber={copyPaymentNumber}
                                copiedPayment={copiedNumber === selectedPayment}
                                donationForm={donationForm}
                                onSubmit={handleDonationSubmit}
                                onSlipChange={handleSlipChange}
                                slipPreview={slipPreview}
                                slipError={slipError}
                                review={step === 3 ? { pool: poolName, amount: currency.format(amountNum), payment: selectedPayment } : null}
                            />

                            <div className="mt-6 flex items-center justify-between gap-3">
                                <button type="button" onClick={() => setStep((c) => Math.max(1, c - 1))} className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 disabled:opacity-40" disabled={step === 1}>
                                    {lang === 'my' ? 'နောက်သို့' : 'Back'}
                                </button>
                                {step < 3 && (
                                    <button type="button" onClick={() => setStep((c) => Math.min(3, c + 1))} disabled={!canNextFromStep(step)} className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#065F46] transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50">
                                        {lang === 'my' ? 'ရှေ့ဆက်ရန်' : 'Continue'} <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>

                    <section id="impact" className="mt-20">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{lang === 'my' ? 'သက်ရောက်မှု' : 'Impact'}</p>
                                <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{lang === 'my' ? 'အတူတကွ ဖန်တီးနေသော ပြောင်းလဲမှု' : 'The difference we’re building together'}</h2>
                            </div>
                            <Link href={route('impact')} className="hidden text-sm font-semibold text-emerald-700 hover:text-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:inline-flex">
                                {lang === 'my' ? 'အသေးစိတ် ကြည့်ရန်' : 'View details'}
                            </Link>
                        </div>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {statCards.map(({ label, value, icon: Icon }) => (
                                <div key={label} className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Icon className="h-5 w-5" /></div>
                                    <p className="text-3xl font-black text-slate-900">{value}</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{label}</p>
                                </div>
                            ))}
                        </div>
                        {isLaunching && (
                            <p className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4 text-sm leading-relaxed text-slate-700">
                                {lang === 'my' ? 'ပထမဆုံး ကူညီထောက်ပံ့ရေး ခရီးစဉ် ပြီးဆုံးပါက ဤနေရာတွင် အတည်ပြုထားသော သက်ရောက်မှုများကို ပြသပါမည်။' : 'Verified impact numbers will appear here after our first outreach trips are completed.'}
                            </p>
                        )}
                    </section>

                    <section className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{lang === 'my' ? 'လမ်းဘေးကူညီရေး' : 'Outreach'}</p>
                                    <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{lang === 'my' ? 'မကြာသေးမီ ကူညီရေး ခရီးစဉ်များ' : 'Recent outreach trips'}</h3>
                                </div>
                                <Link href={route('outreach')} className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">{lang === 'my' ? 'အားလုံး' : 'View all'}</Link>
                            </div>
                            <div className="mt-6 space-y-3">
                                {visibleTrips.map((trip) => (
                                    <button key={trip.id} type="button" onClick={() => setSelectedTrip(trip)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900">{trip.township}</p>
                                            <p className="text-sm text-slate-600">{formatDisplayDate(trip.trip_date)}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-lg font-black text-slate-900">{trip.elderly_helped_count}</p>
                                            <p className="text-xs text-slate-500">{lang === 'my' ? 'ဦး ကူညီခဲ့' : 'elders helped'}</p>
                                        </div>
                                    </button>
                                ))}
                                {visibleTrips.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                        <HeartHandshake className="mx-auto h-8 w-8 text-emerald-300" />
                                        <p className="mt-3 font-semibold text-slate-800">{lang === 'my' ? 'ပထမဆုံး ခရီးစဉ်ကို စီစဉ်နေပါသည်' : 'Our first outreach trip is being planned'}</p>
                                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{lang === 'my' ? 'ခရီးစဉ် ပြီးဆုံးပါက ဓာတ်ပုံနှင့် အပ်ဒိတ်များကို ဤနေရာတွင် မျှဝေပါမည်။' : 'Photos and updates will appear here after our first completed trip.'}</p>
                                    </div>
                                )}
                            </div>
                            {tripPageCount > 1 && (
                                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                                    {Array.from({ length: tripPageCount }, (_, i) => i + 1).map((n) => (
                                        <button key={n} type="button" onClick={() => setTripPage(n)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${tripPage === n ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'}`}>{n}</button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><WalletCards className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{lang === 'my' ? 'ပွင့်လင်းမြင်သာမှု' : 'Transparency'}</p>
                                    <h3 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{lang === 'my' ? 'ငွေစာရင်း အကျဉ်းချုပ်' : 'Financial summary'}</h3>
                                </div>
                            </div>
                            <div className="mt-6 space-y-3">
                                <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-sm font-medium text-emerald-800">{lang === 'my' ? 'စုစုပေါင်း လက်ခံရရှိ' : 'Total received'}</p><p className="mt-1 text-2xl font-black text-slate-900">{currency.format(Number(financialSummary.total_received ?? 0))}</p></div>
                                <div className="rounded-2xl bg-amber-50 p-4"><p className="text-sm font-medium text-amber-800">{lang === 'my' ? 'မှတ်တမ်းတင်ထားသော ကုန်ကျစရိတ်' : 'Recorded expenses'}</p><p className="mt-1 text-2xl font-black text-slate-900">{currency.format(Number(financialSummary.total_spent ?? 0))}</p></div>
                                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><p className="text-sm font-medium text-slate-700">{lang === 'my' ? 'လက်ကျန်ငွေ' : 'Current balance'}</p><p className="mt-1 text-2xl font-black text-slate-900">{currency.format(Number(financialSummary.current_balance ?? 0))}</p></div>
                            </div>
                        </div>
                    </section>

                    <section id="community" className="mt-16 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{lang === 'my' ? 'အသိုက်အဝန်း' : 'Community'}</p>
                            <h3 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{lang === 'my' ? 'လမ်းဘေး အကူအညီလိုသူများကို အတူတကွ ကူညီပါ' : 'Help us reach elders who need support'}</h3>
                        </div>
                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                                <div className="flex gap-2">
                                    {[{ key: 'report', my: 'နေရာ သတင်းပေး', en: 'Spot report' }, { key: 'volunteer', my: 'စေတနာ့ဝန်ထမ်း', en: 'Volunteer' }].map((tab) => (
                                        <button key={tab.key} type="button" onClick={() => setActiveCommunityTab(tab.key)} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${activeCommunityTab === tab.key ? 'bg-[#065F46] text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
                                            {lang === 'my' ? tab.my : tab.en}
                                        </button>
                                    ))}
                                </div>
                                {activeCommunityTab === 'report' ? (
                                    <form className="mt-5 space-y-3" onSubmit={handleReportSubmit}>
                                        <input required value={reportForm.data.township} onChange={(e) => reportForm.setData('township', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder={lang === 'my' ? 'မြို့နယ်' : 'Township'} />
                                        <input required value={reportForm.data.street_landmark} onChange={(e) => reportForm.setData('street_landmark', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder={lang === 'my' ? 'လမ်းဘေး အမှတ်အသား' : 'Street landmark'} />
                                        <input required type="datetime-local" value={reportForm.data.time_seen} onChange={(e) => reportForm.setData('time_seen', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
                                        <textarea required value={reportForm.data.condition_note} onChange={(e) => reportForm.setData('condition_note', e.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder={lang === 'my' ? 'အခြေအနေ ဖော်ပြချက်' : 'Condition note'} />
                                        <input type="tel" inputMode="tel" value={reportForm.data.reporter_phone} onChange={(e) => reportForm.setData('reporter_phone', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder={lang === 'my' ? 'ဖုန်းနံပါတ် (ရွေးချယ်နိုင်)' : 'Phone (optional)'} />
                                        <button type="submit" disabled={reportForm.processing} className="w-full rounded-full bg-[#065F46] px-4 py-3.5 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:opacity-60">{reportForm.processing ? (lang === 'my' ? 'ပို့နေသည်…' : 'Sending…') : (lang === 'my' ? 'သတင်းပေးပို့ရန်' : 'Submit report')}</button>
                                    </form>
                                ) : (
                                    <form className="mt-5 space-y-3" onSubmit={handleVolunteerSubmit}>
                                        <input required value={volunteerForm.data.name} onChange={(e) => volunteerForm.setData('name', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder={lang === 'my' ? 'အမည်' : 'Name'} />
                                        <input required type="tel" inputMode="tel" value={volunteerForm.data.phone} onChange={(e) => volunteerForm.setData('phone', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder={lang === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone'} />
                                        <input required value={volunteerForm.data.township} onChange={(e) => volunteerForm.setData('township', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder={lang === 'my' ? 'မြို့နယ်' : 'Township'} />
                                        <input required value={volunteerForm.data.available_days} onChange={(e) => volunteerForm.setData('available_days', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" placeholder={lang === 'my' ? 'ကူညီနိုင်သော ရက်များ' : 'Available days'} />
                                        <button type="submit" disabled={volunteerForm.processing} className="w-full rounded-full bg-[#F59E0B] px-4 py-3.5 font-bold text-[#065F46] transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:opacity-60">{volunteerForm.processing ? (lang === 'my' ? 'ပို့နေသည်…' : 'Sending…') : (lang === 'my' ? 'စေတနာ့ဝန်ထမ်းအဖြစ် ပါဝင်ရန်' : 'Volunteer with us')}</button>
                                    </form>
                                )}
                            </div>
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-emerald-700" />
                                    <p className="font-bold text-slate-900">{lang === 'my' ? 'ဘယ်လို ကူညီနိုင်သလဲ' : 'How you can help'}</p>
                                </div>
                                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                                    <li className="flex gap-2"><HandHeart className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {lang === 'my' ? 'အစားအစာ၊ ဆေးဝါး၊ အဝတ်အစားနှင့် ငွေကြေး ပံ့ပိုးမှု' : 'Support meals, medicine, clothing, and outreach costs'}</li>
                                    <li className="flex gap-2"><MapPinned className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {lang === 'my' ? 'လမ်းဘေးတွင် အကူအညီလိုသူများကို တွေ့ပါက သတင်းပေးပါ' : 'Send a spot report when you see an elder who needs help'}</li>
                                    <li className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" /> {lang === 'my' ? 'ဒေသခံ စေတနာ့ဝန်ထမ်းများနှင့် တိုက်ရိုက် ကူညီပေးခြင်း' : 'Direct, trust-based outreach led by local volunteers'}</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </main>
            </PublicLayout>
        </>
    );
}
