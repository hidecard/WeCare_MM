import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Building2, HandCoins, HeartHandshake, MapPinned, Phone, Soup, Stethoscope, Users, WalletCards } from 'lucide-react';
import { useState } from 'react';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const numberFormat = new Intl.NumberFormat('en-MM');

const paymentDetails = {
    KBZPay: { phone: '09 123 456 789', label: 'KBZPay QR' },
    WavePay: { phone: '09 987 654 321', label: 'WavePay QR' },
    AYAPay: { phone: '09 555 666 777', label: 'AYA Pay QR' },
    CBPay: { phone: '09 333 444 555', label: 'CB Pay QR' },
};

export default function Welcome({ impact = {}, fundPools = [], recentDonations = [], recentTrips = [], financialSummary = {} }) {
    const [selectedPoolId, setSelectedPoolId] = useState(fundPools[0]?.id ?? 1);
    const [selectedAmount, setSelectedAmount] = useState(10000);
    const [selectedPayment, setSelectedPayment] = useState('KBZPay');
    const [copiedNumber, setCopiedNumber] = useState('');
    const [step, setStep] = useState(1);
    const [activeCommunityTab, setActiveCommunityTab] = useState('report');
    const [selectedTrip, setSelectedTrip] = useState(null);

    const selectedPool = fundPools.find((pool) => Number(pool.id) === Number(selectedPoolId)) ?? fundPools[0] ?? {};
    const estimatedPeople = Math.max(1, Math.round((Number(selectedAmount) || 0) / Math.max(Number(selectedPool.unit_cost) || 5000, 1)));

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
        { label: 'Elderly Helped', value: numberFormat.format(impact.total_elderly_helped ?? 0), icon: Users },
        { label: 'Meal Boxes', value: numberFormat.format(impact.meals_distributed ?? 0), icon: Soup },
        { label: 'Medical Aid', value: numberFormat.format(impact.medical_aid_provided ?? 0), icon: Stethoscope },
        { label: 'Townships', value: numberFormat.format(impact.townships_reached ?? 0), icon: MapPinned },
    ];

    const handlePoolSelect = (poolId) => {
        setSelectedPoolId(poolId);
        donationForm.setData('fund_pool_id', poolId);
    };

    const handleAmountSelect = (amount) => {
        setSelectedAmount(amount);
        donationForm.setData('amount', amount);
    };

    const handlePaymentSelect = (method) => {
        setSelectedPayment(method);
        donationForm.setData('payment_method', method);
    };

    const handleDonationSubmit = (event) => {
        event.preventDefault();
        donationForm.post(route('donations.store'), {
            forceFormData: true,
            onSuccess: () => {
                donationForm.reset();
                setStep(1);
                setSelectedPoolId(fundPools[0]?.id ?? 1);
                setSelectedAmount(10000);
                setSelectedPayment('KBZPay');
            },
        });
    };

    const impactMessage = `${currency.format(Number(selectedAmount) || 0)} = ${selectedPool.title_en || 'General outreach'} support for roughly ${estimatedPeople} elderly people today.`;

    return (
        <>
            <Head title="WeCare Myanmar" />
            <div className="min-h-screen bg-[#FFFBEB] text-slate-800">
                <header className="sticky top-0 z-40 border-b border-amber-100 bg-[#065F46]/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-white sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-[#065F46]">
                                <HeartHandshake className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold tracking-wide">WeCare Myanmar</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100">Street outreach</p>
                            </div>
                        </div>
                        <div className="hidden items-center gap-3 sm:flex">
                            <Link href="#impact" className="text-sm text-emerald-50/90 hover:text-white">Impact</Link>
                            <Link href="#donate" className="text-sm text-emerald-50/90 hover:text-white">Donate</Link>
                            <Link href="#community" className="text-sm text-emerald-50/90 hover:text-white">Community</Link>
                            <Link href="#contact" className="text-sm text-emerald-50/90 hover:text-white">Contact</Link>
                            <Link href={route('login')} className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-semibold text-[#065F46] hover:bg-amber-400">Admin Login</Link>
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
                    <section className="grid gap-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#065F46] via-[#0f766e] to-[#0e7490] p-6 text-white shadow-lg shadow-emerald-900/20 md:grid-cols-[1.2fr_0.8fr] md:p-10">
                        <div>
                            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50">Trusted local support</span>
                            <h1 className="mt-5 font-sans text-4xl font-black leading-tight md:text-5xl">Helping Myanmar’s elderly with dignified daily care, food, and medicine.</h1>
                            <p className="mt-4 max-w-xl text-sm text-emerald-50/90 md:text-base">Every contribution goes into general outreach support so our volunteers can reach vulnerable elders on the streets with warm meals, medical aid, and compassion.</p>
                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <a href="#donate" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#065F46] shadow-md shadow-amber-500/20 hover:bg-amber-400">
                                    ပါဝင်လှူဒါန်းရန် <ArrowRight className="h-4 w-4" />
                                </a>
                                <a href="#community" className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15">Community action</a>
                            </div>
                        </div>

                        <div className="rounded-[1.5rem] bg-[#FFFBEB] p-4 text-slate-800 shadow-xl shadow-emerald-950/20">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Live impact</p>
                                <BadgeCheck className="h-5 w-5 text-emerald-700" />
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                {statCards.map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                                        <Icon className="h-4 w-4 text-[#F59E0B]" />
                                        <p className="mt-3 text-2xl font-black text-[#065F46]">{value}</p>
                                        <p className="text-xs text-slate-600">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="donate" className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[2rem] border border-amber-200 bg-white p-5 shadow-sm shadow-amber-100">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Donation drive</p>
                                    <h2 className="mt-2 text-2xl font-black text-slate-900">Choose fund pool</h2>
                                </div>
                                <div className="rounded-full bg-emerald-50 p-2 text-emerald-800">
                                    <HandCoins className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                {fundPools.map((pool) => (
                                    <button
                                        key={pool.id}
                                        type="button"
                                        onClick={() => handlePoolSelect(pool.id)}
                                        className={`rounded-2xl border p-4 text-left transition ${selectedPoolId === pool.id ? 'border-[#F59E0B] bg-amber-50 shadow-md shadow-amber-100' : 'border-slate-200 bg-slate-50 hover:border-emerald-200'}`}
                                    >
                                        <p className="text-sm font-bold text-emerald-800">{pool.title_mm || pool.title_en}</p>
                                        <p className="mt-1 text-xs text-slate-500">{pool.title_en}</p>
                                        <p className="mt-3 text-lg font-black text-slate-900">{currency.format(Number(pool.unit_cost) || 5000)} / case</p>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6 rounded-2xl bg-[#FFFBEB] p-4">
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Impact calculator</p>
                                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {[5000, 10000, 30000, 50000].map((amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            onClick={() => handleAmountSelect(amount)}
                                            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${selectedAmount === amount ? 'border-[#F59E0B] bg-[#F59E0B] text-white' : 'border-amber-200 bg-white text-slate-700 hover:border-amber-300'}`}
                                        >
                                            {currency.format(amount)}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-white px-3 py-2">
                                    <span className="text-sm text-slate-500">Custom amount</span>
                                    <input type="number" min="1000" step="500" value={selectedAmount} onChange={(event) => handleAmountSelect(event.target.value)} className="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-semibold text-slate-800 outline-none focus:border-emerald-400" />
                                </div>
                                <p className="mt-4 text-sm text-slate-600">{impactMessage}</p>
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">3-step payment</p>
                                    <h3 className="mt-2 text-2xl font-black text-slate-900">Secure donation</h3>
                                </div>
                                <div className="rounded-full bg-emerald-50 p-2 text-emerald-700">
                                    <WalletCards className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                {[1, 2, 3].map((stepNumber) => (
                                    <button key={stepNumber} type="button" onClick={() => setStep(stepNumber)} className={`flex h-8 w-8 items-center justify-center rounded-full ${step === stepNumber ? 'bg-[#F59E0B] text-white' : 'bg-slate-200 text-slate-600'}`}>
                                        {stepNumber}
                                    </button>
                                ))}
                            </div>

                            <form onSubmit={handleDonationSubmit} className="mt-5 space-y-4">
                                {step === 1 && (
                                    <div className="space-y-3">
                                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Selected fund</p>
                                            <p className="mt-2 text-lg font-black text-slate-900">{selectedPool.title_mm || selectedPool.title_en}</p>
                                            <p className="text-sm text-slate-600">{selectedPool.description}</p>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contribution amount</p>
                                            <p className="mt-2 text-3xl font-black text-[#065F46]">{currency.format(Number(selectedAmount) || 0)}</p>
                                        </div>
                                        <button type="button" onClick={() => setStep(2)} className="w-full rounded-full bg-[#065F46] px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Continue to payment</button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-3">
                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="mb-3 flex items-center justify-between">
                                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">QR payment</p>
                                                <button type="button" onClick={async () => {
                                                    if (navigator.clipboard) {
                                                        await navigator.clipboard.writeText(paymentDetails[selectedPayment]?.phone || '');
                                                        setCopiedNumber(selectedPayment);
                                                    }
                                                }} className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                                                    {copiedNumber === selectedPayment ? 'Copied' : 'Copy number'}
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-inner shadow-slate-200">
                                                    <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-900 p-1">
                                                        {Array.from({ length: 16 }).map((_, index) => (
                                                            <span key={index} className={`h-2 w-2 rounded-sm ${index % 2 === 0 ? 'bg-slate-900' : 'bg-white'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Payment to</p>
                                                    <p className="mt-2 text-lg font-black text-slate-900">{selectedPayment}</p>
                                                    <p className="text-sm text-slate-600">{paymentDetails[selectedPayment]?.phone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {Object.entries(paymentDetails).map(([method, info]) => (
                                            <button key={method} type="button" onClick={() => handlePaymentSelect(method)} className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left ${selectedPayment === method ? 'border-[#F59E0B] bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
                                                <div>
                                                    <p className="font-bold text-slate-800">{method}</p>
                                                    <p className="text-xs text-slate-500">{info.phone}</p>
                                                </div>
                                                <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">{info.label}</div>
                                            </button>
                                        ))}
                                        <button type="button" onClick={() => setStep(3)} className="w-full rounded-full bg-[#F59E0B] px-4 py-3 text-sm font-bold text-[#065F46] hover:bg-amber-400">Next: slip upload</button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-3">
                                        <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#F59E0B]">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <p className="mt-3 text-sm font-semibold text-slate-700">{selectedPayment} payment details</p>
                                            <p className="mt-1 text-sm text-slate-500">{paymentDetails[selectedPayment]?.phone}</p>
                                        </div>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-600">Upload payment slip</span>
                                            <input type="file" accept="image/*" onChange={(event) => donationForm.setData('slip_image', event.target.files[0] || null)} className="block w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-[#F59E0B] file:px-3 file:py-2 file:text-sm file:font-bold file:text-[#065F46]" />
                                            {donationForm.errors.slip_image && <span className="mt-2 block text-xs text-red-600">{donationForm.errors.slip_image}</span>}
                                        </label>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-slate-600">Donor name</span>
                                                <input value={donationForm.data.donor_name} onChange={(event) => donationForm.setData('donor_name', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Your name" />
                                            </label>
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-slate-600">Phone</span>
                                                <input value={donationForm.data.phone} onChange={(event) => donationForm.setData('phone', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="09..." />
                                            </label>
                                        </div>

                                        <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                                            <div>
                                                <p className="font-semibold text-slate-700">Donate anonymously</p>
                                                <p className="text-xs text-slate-500">Protect donor privacy</p>
                                            </div>
                                            <input type="checkbox" checked={donationForm.data.is_anonymous} onChange={(event) => donationForm.setData('is_anonymous', event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-[#F59E0B] focus:ring-[#F59E0B]" />
                                        </label>

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-600">Wish / note</span>
                                            <textarea value={donationForm.data.wish_note} onChange={(event) => donationForm.setData('wish_note', event.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="May this help bring warmth and care..." />
                                        </label>

                                        <button type="submit" disabled={donationForm.processing} className="w-full rounded-full bg-[#F59E0B] px-4 py-3 text-sm font-bold text-[#065F46] hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60">
                                            {donationForm.processing ? 'Submitting...' : 'Submit donation for review'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </section>

                    <section id="impact" className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[2rem] border border-emerald-200 bg-white p-5 shadow-sm shadow-emerald-100">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Recent outreach</p>
                                    <h2 className="mt-2 text-2xl font-black text-slate-900">Street outreach timeline</h2>
                                </div>
                                <Building2 className="h-5 w-5 text-emerald-700" />
                            </div>

                            <div className="space-y-4">
                                {recentTrips.map((trip) => (
                                    <button key={trip.id} type="button" onClick={() => setSelectedTrip(trip)} className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{trip.township}</p>
                                                <p className="text-xs text-slate-500">{new Date(trip.trip_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                            </div>
                                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{trip.elderly_helped_count} elders</span>
                                        </div>
                                        <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
                                            <span>Meals: {trip.meals_distributed}</span>
                                            <span>Medical: {trip.medical_aid_count}</span>
                                            <span>Spent: {currency.format(Number(trip.total_spent) || 0)}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[2rem] border border-amber-200 bg-white p-5 shadow-sm shadow-amber-100">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Financial ledger</p>
                            <h3 className="mt-2 text-2xl font-black text-slate-900">Transparency</h3>
                            <div className="mt-4 space-y-3">
                                <div className="rounded-2xl bg-emerald-50 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Total received</p>
                                    <p className="mt-3 text-2xl font-black text-[#065F46]">{currency.format(Number(financialSummary.total_received) || 0)}</p>
                                </div>
                                <div className="rounded-2xl bg-amber-50 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Total spent</p>
                                    <p className="mt-3 text-2xl font-black text-[#A16207]">{currency.format(Number(financialSummary.total_spent) || 0)}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-100 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-700">Balance</p>
                                    <p className="mt-3 text-2xl font-black text-slate-800">{currency.format(Number(financialSummary.current_balance) || 0)}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Recent support</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">Approved donor wall</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {recentDonations.map((donation) => (
                                <div key={donation.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-bold text-slate-800">{donation.is_anonymous ? 'Anonymous donor' : donation.donor_name}</p>
                                            <p className="text-xs text-slate-500">{donation.fund_pool?.title_mm || donation.fund_pool?.title_en || 'General support'}</p>
                                        </div>
                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">Approved</span>
                                    </div>
                                    <p className="mt-3 text-2xl font-black text-[#065F46]">{currency.format(Number(donation.amount) || 0)}</p>
                                    <p className="mt-1 text-xs text-slate-500">Certificate: {donation.certificate_code}</p>
                                    <a href={donation.certificate_code ? route('donations.certificate', donation.id) : '#'} className={`mt-4 inline-flex rounded-full border px-3 py-2 text-xs font-bold ${donation.certificate_code ? 'border-emerald-200 bg-white text-emerald-700 hover:border-emerald-400' : 'pointer-events-none border-slate-200 bg-slate-100 text-slate-400'}`} download>
                                        {donation.certificate_code ? 'Download certificate' : 'Pending certificate'}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="community" className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Community action</p>
                                <h2 className="mt-2 text-2xl font-black text-slate-900">Help us respond quickly</h2>
                            </div>
                            <div className="flex gap-2 rounded-full bg-slate-100 p-1">
                                <button type="button" onClick={() => setActiveCommunityTab('report')} className={`rounded-full px-3 py-2 text-sm font-semibold ${activeCommunityTab === 'report' ? 'bg-[#065F46] text-white' : 'text-slate-600'}`}>Spot report</button>
                                <button type="button" onClick={() => setActiveCommunityTab('volunteer')} className={`rounded-full px-3 py-2 text-sm font-semibold ${activeCommunityTab === 'volunteer' ? 'bg-[#065F46] text-white' : 'text-slate-600'}`}>Volunteer</button>
                            </div>
                        </div>

                        {activeCommunityTab === 'report' ? (
                            <form onSubmit={(event) => { event.preventDefault(); reportForm.post(route('spot-reports.store')); }} className="mt-5 grid gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Township</span>
                                    <input value={reportForm.data.township} onChange={(event) => reportForm.setData('township', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Insein" />
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Landmark</span>
                                    <input value={reportForm.data.street_landmark} onChange={(event) => reportForm.setData('street_landmark', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Near bus station" />
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Time seen</span>
                                    <input type="datetime-local" value={reportForm.data.time_seen} onChange={(event) => reportForm.setData('time_seen', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Contact</span>
                                    <input value={reportForm.data.reporter_phone} onChange={(event) => reportForm.setData('reporter_phone', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="09..." />
                                </label>
                                <div className="md:col-span-2">
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-slate-600">Condition note</span>
                                        <textarea value={reportForm.data.condition_note} onChange={(event) => reportForm.setData('condition_note', event.target.value)} rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Describe the condition, needs, and location details." />
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <button type="submit" disabled={reportForm.processing} className="rounded-full bg-[#065F46] px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">Send report to admin team</button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={(event) => { event.preventDefault(); volunteerForm.post(route('volunteers.store')); }} className="mt-5 grid gap-4 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Full name</span>
                                    <input value={volunteerForm.data.name} onChange={(event) => volunteerForm.setData('name', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Aye Aye" />
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Phone</span>
                                    <input value={volunteerForm.data.phone} onChange={(event) => volunteerForm.setData('phone', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="09..." />
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Township</span>
                                    <input value={volunteerForm.data.township} onChange={(event) => volunteerForm.setData('township', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Thaketa" />
                                </label>
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Available days</span>
                                    <input value={volunteerForm.data.available_days} onChange={(event) => volunteerForm.setData('available_days', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Weekends / Evenings" />
                                </label>
                                <div className="md:col-span-2">
                                    <button type="submit" disabled={volunteerForm.processing} className="rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#065F46] hover:bg-amber-400 disabled:opacity-60">Register as volunteer</button>
                                </div>
                            </form>
                        )}
                    </section>
                </main>

                {selectedTrip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Trip details</p>
                                    <h3 className="mt-2 text-2xl font-black text-slate-900">{selectedTrip.township}</h3>
                                </div>
                                <button type="button" onClick={() => setSelectedTrip(null)} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Close</button>
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3 text-sm text-slate-600">
                                <div className="rounded-2xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Elders</span><span className="mt-2 block text-xl font-black text-slate-900">{selectedTrip.elderly_helped_count}</span></div>
                                <div className="rounded-2xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Meals</span><span className="mt-2 block text-xl font-black text-slate-900">{selectedTrip.meals_distributed}</span></div>
                                <div className="rounded-2xl bg-slate-50 p-3"><span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Spent</span><span className="mt-2 block text-xl font-black text-slate-900">{currency.format(Number(selectedTrip.total_spent) || 0)}</span></div>
                            </div>
                            <p className="mt-4 text-sm text-slate-600">{selectedTrip.summary_note}</p>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {(selectedTrip.photos_json || []).map((photo, index) => (
                                    <img key={`photo-${index}`} src={`/storage/${photo}`} alt="Outreach photo" className="h-40 w-full rounded-2xl object-cover" />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <footer id="contact" className="mt-16 border-t border-emerald-200 bg-[#065F46] text-emerald-50">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-[#065F46]">
                                    <HeartHandshake className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold">WeCare Myanmar</p>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">Street outreach</p>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-emerald-100/80">Trusted local care for elders on the streets, funded by community generosity and direct field outreach.</p>
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Quick links</p>
                            <ul className="mt-4 space-y-2 text-sm text-emerald-100/90">
                                <li><Link href={route('home')}>Home</Link></li>
                                <li><a href="#impact">Impact</a></li>
                                <li><a href="#donate">Donate</a></li>
                                <li><a href="#community">Community</a></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Support</p>
                            <ul className="mt-4 space-y-2 text-sm text-emerald-100/90">
                                <li>Daily meals</li>
                                <li>Medical aid</li>
                                <li>Warm clothing</li>
                                <li>Emergency support</li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-200">Contact</p>
                            <ul className="mt-4 space-y-2 text-sm text-emerald-100/90">
                                <li>+95 9 123 456 789</li>
                                <li>hello@wecaremyanmar.org</li>
                                <li>Insein, Yangon</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 py-4 text-center text-xs text-emerald-100/80">© 2026 WeCare Myanmar • Community outreach with dignity and care.</div>
                </footer>
            </div>
        </>
    );
}
