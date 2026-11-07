import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, HandCoins, Landmark, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import DonationFlow from '../Components/DonationFlow';
import DonationFlowSteps from '../Components/DonationFlowSteps';
import useLanguage from '../hooks/useLanguage';
import { saveDonationReceipt } from '../lib/donationReceipts';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const numberFormat = new Intl.NumberFormat('en-MM');

const stepLabels = { my: ['ရွေးချယ်', 'ငွေပေးချေ', 'အတည်ပြု'], en: ['Choose', 'Pay', 'Confirm'] };

function Stepper({ step, lang }) {
    const labels = stepLabels[lang] ?? stepLabels.en;
    return (
        <div className="mt-5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-[#F59E0B] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <ol className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {labels.map((label, i) => {
                    const n = i + 1; const done = step > n; const current = step === n;
                    return (
                        <li key={label} aria-current={current ? 'step' : undefined} className={`flex items-center justify-center gap-1 rounded-full px-2 py-2 text-center font-semibold transition ${current ? 'bg-[#F59E0B] text-[#065F46]' : done ? 'bg-white/15 text-white' : 'bg-white/5 text-emerald-50/70'}`}>
                            {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <span>{n}</span>}<span className="truncate">{label}</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

export default function Donate({ fundPools = [], paymentDetails = {} }) {
    const [lang, setLang] = useLanguage();
    const [selectedPoolId, setSelectedPoolId] = useState(fundPools[0]?.id ?? 1);
    const [selectedAmount, setSelectedAmount] = useState(10000);
    const [selectedPayment, setSelectedPayment] = useState(Object.keys(paymentDetails)[0] ?? '');
    const [showSuccess, setShowSuccess] = useState(false);
    const [submittedReceipt, setSubmittedReceipt] = useState(null);
    const [copiedPayment, setCopiedPayment] = useState(false);
    const [slipPreview, setSlipPreview] = useState('');
    const [slipError, setSlipError] = useState('');
    const [step, setStep] = useState(1);

    useEffect(() => {
        if (!showSuccess) return undefined;
        const closeOnEscape = (event) => { if (event.key === 'Escape') setShowSuccess(false); };
        document.addEventListener('keydown', closeOnEscape);
        return () => document.removeEventListener('keydown', closeOnEscape);
    }, [showSuccess]);

    const selectedPool = fundPools.find((pool) => Number(pool.id) === Number(selectedPoolId)) ?? fundPools[0] ?? {};
    const amountNum = Number(selectedAmount) || 0;
    const unitCost = Math.max(Number(selectedPool.unit_cost) || 5000, 1);
    const estimatedPeople = Math.max(1, Math.round(amountNum / unitCost));
    const poolName = lang === 'my' ? (selectedPool.title_mm || selectedPool.title_en || 'အထွေထွေ ကူညီရေး') : (selectedPool.title_en || selectedPool.title_mm || 'General outreach');
    const impactMessage = lang === 'my'
        ? `${currency.format(amountNum)} = ${poolName}အတွက် သက်ကြီးရွယ်အို ~${numberFormat.format(estimatedPeople)} ဦး`
        : `${currency.format(amountNum)} can help ~${estimatedPeople} elder${estimatedPeople === 1 ? '' : 's'} through ${poolName}`;

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

    const handlePoolSelect = (poolId) => {
        setSelectedPoolId(poolId);
        setStep(1);
        donationForm.setData('fund_pool_id', poolId);
    };
    const handleAmountSelect = (amount) => {
        const next = String(amount ?? '').replace(/[^\d]/g, '');
        setSelectedAmount(next);
        setStep(1);
        donationForm.setData('amount', next);
    };
    const handlePaymentSelect = (method) => { setSelectedPayment(method); donationForm.setData('payment_method', method); };

    const handleSubmit = (event) => {
        event.preventDefault();
        donationForm.post(route('donations.store'), {
            forceFormData: true,
            onSuccess: (page) => {
                const receipt = page.props.flash?.donation_receipt;
                saveDonationReceipt(receipt);
                setSubmittedReceipt(receipt);
                donationForm.reset();
                setStep(1);
                setSlipPreview('');
                setShowSuccess(true);
            },
        });
    };

    const copyPaymentNumber = async () => {
        const accountNumber = paymentDetails[selectedPayment]?.phone;
        if (!accountNumber) return;
        try {
            await navigator.clipboard.writeText(accountNumber.replace(/\s+/g, ''));
            setCopiedPayment(true);
            window.setTimeout(() => setCopiedPayment(false), 1800);
        } catch {
            setCopiedPayment(false);
        }
    };

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

    const canNext = (s) => (s === 1 ? fundPools.length > 0 && amountNum >= 1000 : s === 2 ? !!paymentDetails[selectedPayment] : true);

    return (
        <>
            <Head title={lang === 'my' ? 'လှူဒါန်းရန်' : 'Donate'} />
            <PublicLayout active="donate" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center gap-3">
                        <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
                            <ArrowLeft className="h-4 w-4" /> {lang === 'my' ? 'မူလသို့' : 'Back home'}
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                        <div className="space-y-4">
                            <DonationFlow fundPools={fundPools} selectedPoolId={selectedPoolId} selectedAmount={selectedAmount} onPoolSelect={handlePoolSelect} onAmountSelect={handleAmountSelect} lang={lang} />
                            {fundPools.length > 0 && amountNum >= 1000 && (
                                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50/60 p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{lang === 'my' ? 'သင့်လှူဒါန်းမှု သက်ရောက်မှု' : 'Your impact'}</p>
                                    <p className="mt-2 text-base font-bold leading-snug text-slate-900">{impactMessage}</p>
                                </div>
                            )}
                        </div>

                        <section className="rounded-[2rem] bg-[#065F46] p-5 text-white shadow-lg shadow-emerald-900/20 sm:p-6">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100/90">{lang === 'my' ? 'လုံခြုံစွာ လှူဒါန်းရန်' : 'Secure donation'}</p>
                                    <h2 className="mt-1 text-xl font-black sm:text-2xl">{lang === 'my' ? 'လှူဒါန်းမှု ပြီးမြောက်အောင် လုပ်ဆောင်ပါ' : 'Complete your donation'}</h2>
                                </div>
                                <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">{step}/3</div>
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
                                copiedPayment={copiedPayment}
                                donationForm={donationForm}
                                onSubmit={handleSubmit}
                                onSlipChange={handleSlipChange}
                                slipPreview={slipPreview}
                                slipError={slipError}
                                review={step === 3 ? { pool: poolName, amount: currency.format(amountNum), payment: selectedPayment } : null}
                            />

                            <div className="mt-6 flex items-center justify-between gap-3">
                                <button type="button" onClick={() => setStep((c) => Math.max(1, c - 1))} disabled={step === 1} className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 disabled:opacity-40">
                                    {lang === 'my' ? 'နောက်သို့' : 'Back'}
                                </button>
                                {step < 3 && (
                                    <button type="button" onClick={() => setStep((c) => Math.min(3, c + 1))} disabled={!canNext(step)} className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#065F46] transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50">
                                        {lang === 'my' ? 'ရှေ့ဆက်ရန်' : 'Continue'} <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
                            <Landmark className="h-5 w-5 text-emerald-700" />
                            <p className="mt-3 text-2xl font-black text-slate-900">{currency.format(Number(fundPools.reduce((total, pool) => total + Number(pool.total_raised || 0), 0)))}</p>
                            <p className="mt-1 text-sm text-slate-600">{lang === 'my' ? 'စုစုပေါင်း လှူဒါန်းမှု' : 'Total raised'}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
                            <ShieldCheck className="h-5 w-5 text-emerald-700" />
                            <p className="mt-3 text-2xl font-black text-slate-900">{fundPools.length}</p>
                            <p className="mt-1 text-sm text-slate-600">{lang === 'my' ? 'လှူဒါန်းနိုင်သော ရန်ပုံငွေ' : 'Active funds'}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
                            <HandCoins className="h-5 w-5 text-emerald-700" />
                            <p className="mt-3 text-2xl font-black text-slate-900">{currency.format(Number(selectedPool.unit_cost || 0))}</p>
                            <p className="mt-1 text-sm text-slate-600">{lang === 'my' ? 'တစ်စုံလျှင် ခန့်မှန်းကုန်ကျစရိတ်' : 'Estimated unit cost'}</p>
                        </div>
                    </div>
                </main>

                {showSuccess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4" role="presentation">
                        <div role="dialog" aria-modal="true" aria-labelledby="donation-success-title" className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check className="h-7 w-7" strokeWidth={3} /></div>
                            <h2 id="donation-success-title" className="mt-4 text-2xl font-black text-slate-900">{lang === 'my' ? 'လှူဒါန်းမှု တင်သွင်းပြီးပါပြီ' : 'Donation submitted'}</h2>
                            <p className="mt-3 text-sm leading-relaxed text-slate-600">{lang === 'my' ? 'ကျေးဇူးတင်ပါသည်။ အဖွဲ့မှ စစ်ဆေးပြီးနောက် အခြေအနေကို အပ်ဒိတ်လုပ်ပါမည်။' : 'Thank you. Our team will review your donation and update the status.'}</p>
                            {submittedReceipt?.tracking_token && (
                                <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-left ring-1 ring-emerald-100">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{lang === 'my' ? 'ခြေရာခံ အမှတ်' : 'Tracking ID'}</p>
                                    <p className="mt-1 break-all font-mono text-sm font-bold text-slate-900">{submittedReceipt.tracking_token}</p>
                                </div>
                            )}
                            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                                <Link href={route('donations.status-page')} className="rounded-full bg-[#065F46] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">{lang === 'my' ? 'အခြေအနေ ကြည့်ရန်' : 'Track donation'}</Link>
                                <button type="button" onClick={() => setShowSuccess(false)} className="rounded-full bg-[#F59E0B] px-5 py-2.5 text-sm font-bold text-[#065F46] transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">{lang === 'my' ? 'ပိတ်ရန်' : 'Close'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </PublicLayout>
        </>
    );
}
