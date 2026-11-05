import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Building2, HandCoins, HeartHandshake, MapPinned, Phone, Soup, Stethoscope, Users, WalletCards, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicLayout from '../Components/PublicLayout';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const numberFormat = new Intl.NumberFormat('en-MM');

const formatDisplayDate = (value) => {
    if (!value) return '—';

    const safeDate = typeof value === 'string' && value.includes('T') ? value : `${value}T12:00:00`;
    const parsed = new Date(safeDate);

    if (Number.isNaN(parsed.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
};

const renderTripPagination = (pageCount, currentPage, onPageChange) => {
    if (pageCount <= 1) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button
                    key={pageNumber}
                    type="button"
                    onClick={() => onPageChange(pageNumber)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${currentPage === pageNumber ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'}`}
                >
                    {pageNumber}
                </button>
            ))}
        </div>
    );
};

export default function Home({ impact = {}, fundPools = [], recentDonations = [], recentTrips = [], financialSummary = {}, paymentDetails = {} }) {
    const { flash = {} } = usePage().props;
    const [lang, setLang] = useState('my');
    const [selectedPoolId, setSelectedPoolId] = useState(fundPools[0]?.id ?? 1);
    const [selectedAmount, setSelectedAmount] = useState(10000);
    const [selectedPayment, setSelectedPayment] = useState(Object.keys(paymentDetails)[0] ?? '');
    const [copiedNumber, setCopiedNumber] = useState('');
    const [step, setStep] = useState(1);
    const [activeCommunityTab, setActiveCommunityTab] = useState('report');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [tripPage, setTripPage] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const selectedPool = fundPools.find((pool) => Number(pool.id) === Number(selectedPoolId)) ?? fundPools[0] ?? {};
    const estimatedPeople = Math.max(1, Math.round((Number(selectedAmount) || 0) / Math.max(Number(selectedPool.unit_cost) || 5000, 1)));
    const tripPageSize = 6;
    const tripPageCount = Math.max(1, Math.ceil((recentTrips?.length ?? 0) / tripPageSize));
    const tripPageStart = (tripPage - 1) * tripPageSize;
    const visibleTrips = (recentTrips ?? []).slice(tripPageStart, tripPageStart + tripPageSize);

    const donationForm = useForm({
        fund_pool_id: selectedPool.id ?? 1,
        amount: selectedAmount,
        payment_method: selectedPayment,
        donor_name: '',
        is_anonymous: false,
        phone: '',
        wish_note: '',
        slip_image: null,
    });

    const reportForm = useForm({
        township: '',
        street_landmark: '',
        time_seen: '',
        condition_note: '',
        reporter_phone: '',
    });

    const volunteerForm = useForm({
        name: '',
        phone: '',
        township: '',
        available_days: 'Weekdays',
        status: 'available',
    });

    const statCards = [
        { label: lang === 'my' ? 'အသက်ကြီးသူများ' : 'Elderly Helped', value: numberFormat.format(impact.total_elderly_helped ?? 0), icon: Users },
        { label: lang === 'my' ? 'အစားအစာထုပ်ပိုးမှု' : 'Meal Boxes', value: numberFormat.format(impact.meals_distributed ?? 0), icon: Soup },
        { label: lang === 'my' ? 'ဆေးဝါးကူညီမှု' : 'Medical Aid', value: numberFormat.format(impact.medical_aid_provided ?? 0), icon: Stethoscope },
        { label: lang === 'my' ? 'မြို့နယ်များ' : 'Townships', value: numberFormat.format(impact.townships_reached ?? 0), icon: MapPinned },
    ];

    const copyPaymentNumber = async (method) => {
        const phone = paymentDetails[method]?.phone;
        if (!phone) return;
        try {
            await navigator.clipboard.writeText(phone.replace(/\s+/g, ''));
            setCopiedNumber(method);
            setTimeout(() => setCopiedNumber(''), 1500);
        } catch (error) {
            setCopiedNumber(method);
        }
    };

    const handlePoolSelect = (poolId) => {
        setSelectedPoolId(poolId);
        setStep(1);
        donationForm.setData({
            ...donationForm.data,
            fund_pool_id: poolId,
        });
    };

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        setStep(1);
        donationForm.setData({
            ...donationForm.data,
            amount: amount,
        });
    };

    const handlePaymentSelect = (method) => {
        setSelectedPayment(method);
        donationForm.setData('payment_method', method);
    };

    useEffect(() => {
        if (flash?.success) {
            setShowSuccessModal(true);
        }
    }, [flash?.success]);

    const handleDonationSubmit = (event) => {
        event.preventDefault();
        donationForm.post(route('donations.store'), {
            forceFormData: true,
            onSuccess: () => {
                setShowSuccessModal(true);
                donationForm.reset();
                setStep(1);
                setSelectedPoolId(fundPools[0]?.id ?? 1);
                setSelectedAmount(10000);
                setSelectedPayment(Object.keys(paymentDetails)[0] ?? '');
            },
        });
    };

    const handleReportSubmit = (event) => {
        event.preventDefault();
        reportForm.post(route('spot-reports.store'), {
            preserveScroll: true,
            onSuccess: () => reportForm.reset(),
        });
    };

    const handleVolunteerSubmit = (event) => {
        event.preventDefault();
        volunteerForm.post(route('volunteers.store'), {
            preserveScroll: true,
            onSuccess: () => volunteerForm.reset('name', 'phone', 'township'),
        });
    };

    const impactMessage = `${currency.format(Number(selectedAmount) || 0)} = ${(selectedPool.title_en || 'General outreach')} support for around ${estimatedPeople} elderly people today.`;

    return (
        <>
            <Head title={lang === 'my' ? 'WeCare Myanmar | မူလစာမျက်နှာ' : 'WeCare Myanmar | Home'} />
            <PublicLayout active="home" lang={lang} setLang={setLang}>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                        <div className="w-full max-w-md rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-2xl">
                            <div className="flex justify-end">
                                <button type="button" onClick={() => setShowSuccessModal(false)} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                <BadgeCheck className="h-8 w-8" />
                            </div>
                            <h3 className="mt-5 text-center text-2xl font-black text-slate-900">Donation received</h3>
                            <p className="mt-3 text-center text-sm text-slate-600">
                                {flash?.success || 'Thank you. Your donation request has been received and is being reviewed by our outreach team.'}
                            </p>
                            <div className="mt-6 flex justify-center">
                                <button type="button" onClick={() => setShowSuccessModal(false)} className="rounded-full bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#065F46] shadow-sm hover:bg-amber-400">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
                    <section className="grid gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#065F46] via-[#0f766e] to-[#0e7490] p-6 text-white shadow-lg shadow-emerald-900/20 md:grid-cols-[1.2fr_0.8fr] md:p-10">
                        <div>
                            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50">
                                {lang === 'my' ? 'ယုံကြည်စိတ်ချရသော အကူအညီ' : 'Trusted local support'}
                            </span>
                            <h1 className="mt-5 font-sans text-4xl font-black leading-tight md:text-5xl">
                                {lang === 'my' ? 'မြန်မာနိုင်ငံအတွင်း အသက်ကြီးသူများကို မျက်နှာထားပြီး အရေးပေါ်စောင့်ရှောက်မှု ပေးပါ' : 'Helping Myanmar’s elderly with dignified daily care, food, and medicine.'}
                            </h1>
                            <p className="mt-4 max-w-xl text-sm text-emerald-50/90 md:text-base">
                                {lang === 'my'
                                    ? 'လှူဒါန်းမှုအားလုံးကို အများပြည်သူပိုင် ရန်ပုံငွေအတွက် သုံးပြီး အဖွဲ့သားများက လမ်းဘေးမှ အသက်ကြီးသူများကို အပူမီးစားစရာ၊ ဆေးဝါး၊ ငွေကြေးနှင့် စိတ်မကောင်းသောအခါကူညီပေးသည်။'
                                    : 'Every contribution goes into general outreach support so our volunteers can reach vulnerable elders on the streets with warm meals, medical aid, and compassion.'}
                            </p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Link href={route('donate')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#065F46] shadow-md shadow-amber-500/20 hover:bg-amber-400">
                                    {lang === 'my' ? 'ပါဝင်လှူဒါန်းရန်' : 'Donate now'} <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link href={route('community')} className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">
                                    {lang === 'my' ? 'အသိုက်အဝန်း' : 'Community action'}
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] bg-[#FFFBEB] p-4 text-slate-800 shadow-xl shadow-emerald-950/20">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">{lang === 'my' ? 'တိုင်းတာမှု' : 'Live impact'}</p>
                                <BadgeCheck className="h-5 w-5 text-emerald-700" />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {statCards.map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                                        <Icon className="h-4 w-4 text-emerald-700" />
                                        <p className="mt-3 text-xl font-black text-slate-800">{value}</p>
                                        <p className="mt-1 text-[11px] font-medium text-slate-600">{label}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 rounded-2xl bg-emerald-800 p-3 text-sm text-emerald-50">
                                <p className="font-semibold">{lang === 'my' ? 'လက်ရှိပမာဏ' : 'Current monthly reach'}</p>
                                <p className="mt-1 text-xl font-black">{currency.format(Number(financialSummary.current_balance ?? 0))}</p>
                            </div>
                        </div>
                    </section>

                    <section id="impact" className="mt-12">
                        <div className="flex items-end justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{lang === 'my' ? 'အကျိုးသက်ရောက်မှု' : 'Impact'}</p>
                                <h2 className="mt-2 text-3xl font-black text-slate-900">{lang === 'my' ? 'မနက်ဖန်အတွက် ကျွန်ုပ်တို့လုပ်ဆောင်နေသည်' : 'The difference we are making'}</h2>
                            </div>
                            <Link href={route('impact')} className="hidden text-sm font-semibold text-emerald-700 hover:text-emerald-900 sm:inline-flex">
                                {lang === 'my' ? 'ပိုမိုကြည့်ရှုရန်' : 'View details'}
                            </Link>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-4">
                            {statCards.map(({ label, value, icon: Icon }) => (
                                <div key={label} className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                                    <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <p className="text-3xl font-black text-slate-900">{value}</p>
                                    <p className="mt-2 text-sm text-slate-600">{label}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="donate" className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><HandCoins className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">{lang === 'my' ? 'လှူဒါန်းရန်' : 'Support now'}</p>
                                    <h3 className="mt-1 text-2xl font-black text-slate-900">{lang === 'my' ? 'သက်ဆိုင်ရာ အဖွဲ့အတွက် ရွေးချယ်ပါ' : 'Choose a fund pool'}</h3>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {fundPools.map((pool) => (
                                    <button
                                        key={pool.id}
                                        type="button"
                                        onClick={() => handlePoolSelect(pool.id)}
                                        className={`w-full rounded-2xl border p-4 text-left transition ${
                                            Number(selectedPoolId) === Number(pool.id)
                                                ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                                                : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/30'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-slate-900">{pool.title_mm || pool.title_en}</p>
                                                <p className="text-sm text-slate-600">{pool.description}</p>
                                            </div>
                                            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                                {currency.format(Number(pool.unit_cost || 0))}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6">
                                <p className="text-sm font-semibold text-slate-700">{lang === 'my' ? 'ပမာဏရွေးချယ်ပါ' : 'Choose amount'}</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {[5000, 10000, 30000, 50000].map((amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => handleAmountSelect(amount)}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold ${
                                                Number(selectedAmount) === Number(amount)
                                                    ? 'bg-[#F59E0B] text-[#065F46]'
                                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }`}
                                        >
                                            {currency.format(amount)}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-3">
                                    <p className="text-sm font-medium text-slate-700">{lang === 'my' ? 'မြေပြင်ပမာဏ' : 'Custom contribution'}</p>
                                    <input
                                        type="number"
                                        min="1000"
                                        value={selectedAmount}
                                        onChange={(event) => handleAmountSelect(event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-slate-800 outline-none ring-0 focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{lang === 'my' ? 'အဆင့် ၁-၃' : '3-step flow'}</p>
                                    <h3 className="mt-2 text-2xl font-black">{lang === 'my' ? 'လှူဒါန်းမှုတင်သွင်းရန်' : 'Complete the donation form'}</h3>
                                </div>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">
                                    {step}/3
                                </span>
                            </div>

                            <div className="mt-6 flex gap-2 text-xs">
                                {[1, 2, 3].map((value) => (
                                    <div key={value} className={`flex-1 rounded-full px-2 py-2 text-center ${step === value ? 'bg-[#F59E0B] text-[#065F46]' : 'bg-white/10 text-emerald-50'}`}>
                                        {lang === 'my' ? ['ရွေးချယ်', 'ငွေပေးချေ', 'အတည်ပြု'][value - 1] : ['Select', 'Pay', 'Submit'][value - 1]}
                                    </div>
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="mt-6 rounded-2xl bg-white/5 p-4">
                                    <p className="text-sm text-emerald-50/80">{lang === 'my' ? 'ရွေးချယ်ထားသော ရန်ပုံငွေ' : 'Selected support'}</p>
                                    <p className="mt-2 text-3xl font-black">{currency.format(Number(selectedAmount) || 0)}</p>
                                    <p className="mt-2 text-sm text-emerald-50/80">{impactMessage}</p>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="mt-6 space-y-4">
                                    {Object.entries(paymentDetails).map(([method, details]) => (
                                        <button
                                            key={method}
                                            type="button"
                                            onClick={() => handlePaymentSelect(method)}
                                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${selectedPayment === method ? 'border-[#F59E0B] bg-[#F59E0B]/10' : 'border-white/10 bg-white/5'}`}
                                        >
                                                <div>
                                                    <p className="font-semibold text-white">{method}</p>
                                                    <p className="text-xs text-emerald-50/80">{details.label}</p>
                                                    {details.qr_url && <img src={details.qr_url} alt={`${method} QR`} className="mt-2 h-20 w-20 rounded-lg bg-white object-contain p-1" />}
                                                </div>
                                            <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium">{details.phone}</span>
                                        </button>
                                    ))}
                                    <div className="rounded-2xl bg-white/5 p-4">
                                        <p className="font-semibold text-emerald-50">{selectedPayment}</p>
                                        <p className="mt-2 text-sm text-emerald-50/80">{paymentDetails[selectedPayment]?.phone}</p>
                                        <button type="button" onClick={() => copyPaymentNumber(selectedPayment)} className="mt-3 rounded-full bg-[#F59E0B] px-3 py-2 text-sm font-semibold text-[#065F46]">
                                            {copiedNumber === selectedPayment ? (lang === 'my' ? 'ကူးယူပြီး' : 'Copied') : (lang === 'my' ? 'ဖုန်းနံပါတ်ကူးယူရန်' : 'Copy number')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleDonationSubmit} className="mt-6 space-y-4">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <input
                                            type="text"
                                            value={donationForm.data.donor_name}
                                            onChange={(e) => donationForm.setData('donor_name', e.target.value)}
                                            placeholder={lang === 'my' ? 'လှူဒါန်းသူအမည်' : 'Donor name'}
                                            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]"
                                        />
                                        <input
                                            type="tel"
                                            value={donationForm.data.phone}
                                            onChange={(e) => donationForm.setData('phone', e.target.value)}
                                            placeholder={lang === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone number'}
                                            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]"
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-emerald-50/90">
                                        <input
                                            type="checkbox"
                                            checked={donationForm.data.is_anonymous}
                                            onChange={(e) => donationForm.setData('is_anonymous', e.target.checked)}
                                            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-400"
                                        />
                                        {lang === 'my' ? 'အမည်မဖော်ပြဘဲ လှူဒါန်းမည်' : 'Donate anonymously'}
                                    </label>
                                    <textarea
                                        value={donationForm.data.wish_note}
                                        onChange={(e) => donationForm.setData('wish_note', e.target.value)}
                                        rows="3"
                                        placeholder={lang === 'my' ? 'မေတ္တာစာ / အကြံပြုချက်' : 'Wish note or encouragement'}
                                        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]"
                                    />
                                    <input
                                        type="file"
                                        onChange={(e) => donationForm.setData('slip_image', e.target.files[0])}
                                        className="block w-full rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2 text-sm text-emerald-50/70 file:mr-3 file:rounded-full file:border-0 file:bg-[#F59E0B] file:px-3 file:py-2 file:text-[#065F46] file:font-semibold"
                                    />
                                    <button type="submit" className="w-full rounded-full bg-[#F59E0B] px-4 py-3 text-base font-bold text-[#065F46] hover:bg-amber-400" disabled={donationForm.processing}>
                                        {donationForm.processing ? (lang === 'my' ? 'တင်သွင်းနေသည်...' : 'Submitting...') : (lang === 'my' ? 'လှူဒါန်းမှုတင်သွင်းရန်' : 'Submit donation')}
                                    </button>
                                </form>
                            )}

                            <div className="mt-6 flex justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep((current) => Math.max(1, current - 1))}
                                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                                >
                                    {lang === 'my' ? 'ရှေ့သို့မသွား' : 'Back'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep((current) => Math.min(3, current + 1))}
                                    className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-semibold text-[#065F46] hover:bg-amber-400"
                                >
                                    {lang === 'my' ? 'အဆင့်တစ်ဆင့်' : 'Next'}
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="mt-16 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{lang === 'my' ? 'လမ်းဘေးစစ်ဆင်မှု' : 'Outreach timeline'}</p>
                                    <h3 className="mt-2 text-2xl font-black text-slate-900">{lang === 'my' ? 'လူမှုရေးသိမ်းဆည်းမည်' : 'Recent outreach trips'}</h3>
                                </div>
                                <Link href={route('outreach')} className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                                    {lang === 'my' ? 'မျက်နှာပြင်အားလုံး' : 'View all'}
                                </Link>
                            </div>
                            <div className="mt-6 space-y-4">
                                {visibleTrips.map((trip) => (
                                    <button
                                        key={trip.id}
                                        type="button"
                                        onClick={() => setSelectedTrip(trip)}
                                        className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/30"
                                    >
                                        <div>
                                            <p className="font-bold text-slate-900">{trip.township}</p>
                                            <p className="text-sm text-slate-600">{formatDisplayDate(trip.trip_date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-slate-900">{trip.elderly_helped_count}</p>
                                            <p className="text-xs text-slate-500">{lang === 'my' ? 'အသက်ကြီးသူများ' : 'elders helped'}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            {renderTripPagination(tripPageCount, tripPage, setTripPage)}
                        </div>

                        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><WalletCards className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{lang === 'my' ? 'ငွေစာရင်း' : 'Ledger'}</p>
                                    <h3 className="mt-1 text-2xl font-black text-slate-900">{lang === 'my' ? 'အကျိုးဆောင် မျှတမှု' : 'Financial transparency'}</h3>
                                </div>
                            </div>
                            <div className="mt-6 space-y-4">
                                <div className="rounded-2xl bg-emerald-50 p-4">
                                    <p className="text-sm text-emerald-700">{lang === 'my' ? 'လက်ခံရရှိမှု' : 'Total received'}</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{currency.format(Number(financialSummary.total_received ?? 0))}</p>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-4">
                                    <p className="text-sm text-amber-700">{lang === 'my' ? 'အသုံးပြုမှု' : 'Total spent'}</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{currency.format(Number(financialSummary.total_spent ?? 0))}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4">
                                    <p className="text-sm text-slate-700">{lang === 'my' ? 'လက်ကျန်ငွေ' : 'Current balance'}</p>
                                    <p className="mt-2 text-2xl font-black text-slate-900">{currency.format(Number(financialSummary.current_balance ?? 0))}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="community" className="mt-16 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">{lang === 'my' ? 'အသိုက်အဝန်း' : 'Community action'}</p>
                                <h3 className="mt-2 text-2xl font-black text-slate-900">{lang === 'my' ? 'လမ်းဘေးအခြေအနေ သတင်းပေးရန်' : 'Help us stay close to the streets'}</h3>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex gap-2">
                                    {['report', 'volunteer'].map((tab) => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setActiveCommunityTab(tab)}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold ${activeCommunityTab === tab ? 'bg-[#065F46] text-white' : 'bg-white text-slate-700'}`}
                                        >
                                            {tab === 'report' ? (lang === 'my' ? 'သတင်းပေးရန်' : 'Spot report') : (lang === 'my' ? 'စေတနာ့ဝန်ထမ်း' : 'Volunteer')}
                                        </button>
                                    ))}
                                </div>

                                {activeCommunityTab === 'report' ? (
                                    <form className="mt-5 space-y-3" onSubmit={handleReportSubmit}>
                                        <input required value={reportForm.data.township} onChange={(e) => reportForm.setData('township', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder={lang === 'my' ? 'မြို့နယ်' : 'Township'} />
                                        <input required value={reportForm.data.street_landmark} onChange={(e) => reportForm.setData('street_landmark', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder={lang === 'my' ? 'လမ်းဘေးအမှတ်တံဆိပ်' : 'Street landmark'} />
                                        <input required type="datetime-local" value={reportForm.data.time_seen} onChange={(e) => reportForm.setData('time_seen', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" />
                                        <textarea required value={reportForm.data.condition_note} onChange={(e) => reportForm.setData('condition_note', e.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder={lang === 'my' ? 'အခြေအနေဖော်ပြချက်' : 'Condition note'} />
                                        <input type="tel" value={reportForm.data.reporter_phone} onChange={(e) => reportForm.setData('reporter_phone', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder={lang === 'my' ? 'ဖုန်းနံပါတ် (ရွေးချယ်နိုင်သည်)' : 'Phone (optional)'} />
                                        <button type="submit" disabled={reportForm.processing} className="w-full rounded-full bg-[#065F46] px-4 py-3 font-semibold text-white disabled:opacity-60">{reportForm.processing ? (lang === 'my' ? 'ပေးပို့နေသည်...' : 'Sending...') : (lang === 'my' ? 'တင်သွင်းရန်' : 'Submit report')}</button>
                                    </form>
                                ) : (
                                    <form className="mt-5 space-y-3" onSubmit={handleVolunteerSubmit}>
                                        <input required value={volunteerForm.data.name} onChange={(e) => volunteerForm.setData('name', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder={lang === 'my' ? 'အမည်' : 'Name'} />
                                        <input required type="tel" value={volunteerForm.data.phone} onChange={(e) => volunteerForm.setData('phone', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder={lang === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone'} />
                                        <input required value={volunteerForm.data.township} onChange={(e) => volunteerForm.setData('township', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder={lang === 'my' ? 'မြို့နယ်' : 'Township'} />
                                        <input required value={volunteerForm.data.available_days} onChange={(e) => volunteerForm.setData('available_days', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2" placeholder={lang === 'my' ? 'အလုပ်ပေးနိုင်သောရက်' : 'Available days'} />
                                        <button type="submit" disabled={volunteerForm.processing} className="w-full rounded-full bg-[#F59E0B] px-4 py-3 font-semibold text-[#065F46] disabled:opacity-60">{volunteerForm.processing ? (lang === 'my' ? 'ပေးပို့နေသည်...' : 'Sending...') : (lang === 'my' ? 'စေတနာ့ဝန်ထမ်းအဖြစ် တက်ရောက်မည်' : 'Volunteer with us')}</button>
                                    </form>
                                )}
                            </div>

                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-emerald-700" />
                                    <p className="font-bold text-slate-900">{lang === 'my' ? 'မိမိအသိပေးမှု' : 'How to help'}</p>
                                </div>
                                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                                    <li className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {lang === 'my' ? 'အစားအစာ၊ ဆေးဝါး၊ အဝတ်အစားနှင့် ငွေကြေးပံ့ပိုးမှု' : 'Meals, medicine, clothing, and cash support'}</li>
                                    <li className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {lang === 'my' ? 'လမ်းဘေးနားက အဘိုးအဘွားများကို သတိထားမိပါ' : 'Keep a lookout for elders in need along the streets'}</li>
                                    <li className="flex gap-2"><BadgeCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {lang === 'my' ? 'တစ်ကြိမ်တည်း ရောက်မည့် မတင်မကတန်း လူမှုအဖွဲ့' : 'Trust-based, direct outreach support'}</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </main>
            </PublicLayout>
        </>
    );
}
