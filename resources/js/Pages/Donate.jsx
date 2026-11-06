import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Copy, CreditCard, HandCoins, Landmark, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import DonationFlow from '../Components/DonationFlow';
import DonationFlowSteps from '../Components/DonationFlowSteps';
import useLanguage from '../hooks/useLanguage';
import { saveDonationReceipt } from '../lib/donationReceipts';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

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

    const selectedPool = fundPools.find((pool) => Number(pool.id) === Number(selectedPoolId)) ?? fundPools[0] ?? {};
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
            setSlipError(lang === 'my' ? 'JPG, PNG, WEBP ဖိုင်နှင့် 4 MB အောက်သာ တင်နိုင်ပါသည်။' : 'Please upload a JPG, PNG, or WEBP image under 4 MB.');
            return;
        }

        donationForm.setData('slip_image', file || null);
        setSlipPreview(file ? URL.createObjectURL(file) : '');
        setSlipError('');
    };

    return (
        <>
            <Head title={lang === 'my' ? 'လှူဒါန်းရန်' : 'Donate'} />
            <PublicLayout active="donate" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-3">
                        <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                            <ArrowLeft className="h-4 w-4" /> {lang === 'my' ? 'မူလသို့' : 'Back home'}
                        </Link>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <DonationFlow fundPools={fundPools} selectedPoolId={selectedPoolId} selectedAmount={selectedAmount} onPoolSelect={handlePoolSelect} onAmountSelect={handleAmountSelect} lang={lang} />

                        <section className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{lang === 'my' ? 'အဆင့် ၁-၃' : '3-step flow'}</p>
                                    <h2 className="mt-2 text-2xl font-black">{lang === 'my' ? 'လှူဒါန်းမှုတင်သွင်းရန်' : 'Complete the donation form'}</h2>
                                </div>
                                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">{step}/3</div>
                            </div>

                            <div className="mt-6 flex gap-2 text-xs">
                                {[1, 2, 3].map((value) => (
                                    <div key={value} className={`flex-1 rounded-full px-2 py-2 text-center ${step === value ? 'bg-[#F59E0B] text-[#065F46]' : 'bg-white/10 text-emerald-50'}`}>
                                        {value === 1 ? (lang === 'my' ? 'ရွေးချယ်' : 'Select') : value === 2 ? (lang === 'my' ? 'ငွေပေးချေ' : 'Pay') : (lang === 'my' ? 'အတည်ပြု' : 'Submit')}
                                    </div>
                                ))}
                            </div>

                            {step === 1 && (
                                <div className="mt-6 rounded-2xl bg-white/5 p-4">
                                    <p className="text-sm text-emerald-50/80">{lang === 'my' ? 'ရွေးချယ်ထားသော ပမာဏ' : 'Selected amount'}</p>
                                    <p className="mt-2 text-3xl font-black">{currency.format(Number(selectedAmount) || 0)}</p>
                                    <p className="mt-3 text-sm text-emerald-50/80">
                                        {lang === 'my'
                                            ? `${selectedPool.title_mm || selectedPool.title_en} ကို အကူအညီပေးရန် ${currency.format(Number(selectedAmount) || 0)} ရွေးချယ်ထားပါသည်။`
                                            : `Supporting ${selectedPool.title_en || 'general outreach'} with ${currency.format(Number(selectedAmount) || 0)}.`}
                                    </p>
                                    {fundPools.length === 0 && (
                                        <p role="alert" className="mt-4 rounded-xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">
                                            {lang === 'my' ? 'လက်ရှိ လှူဒါန်းရန် ရန်ပုံငွေ မရှိသေးပါ။ ကျေးဇူးပြု၍ နောက်မှ ပြန်ကြိုးစားပါ။' : 'No donation funds are available right now. Please try again later.'}
                                        </p>
                                    )}
                                </div>
                            )}

                            <DonationFlowSteps
                                step={step}
                                lang={lang}
                                paymentDetails={paymentDetails}
                                selectedPayment={selectedPayment}
                                onPaymentSelect={handlePaymentSelect}
                                onCopyPaymentNumber={() => copyPaymentNumber()}
                                copiedPayment={copiedPayment}
                                donationForm={donationForm}
                                onSubmit={handleSubmit}
                                onSlipChange={handleSlipChange}
                                slipPreview={slipPreview}
                                slipError={slipError}
                            />

                            <div className="mt-6 flex justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep((current) => Math.max(1, current - 1))}
                                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                                >
                                    {lang === 'my' ? 'နောက်သို့' : 'Back'}
                                </button>
                                {step < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep((current) => Math.min(3, current + 1))}
                                        disabled={(step === 1 && (fundPools.length === 0 || Number(selectedAmount) < 1000)) || (step === 2 && !paymentDetails[selectedPayment])}
                                        className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-semibold text-[#065F46] hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {lang === 'my' ? 'ဆက်လုပ်မည်' : 'Next'} <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                            <Landmark className="h-5 w-5 text-emerald-700" />
                            <p className="mt-3 text-2xl font-black text-slate-900">{currency.format(Number(fundPools.reduce((total, pool) => total + Number(pool.total_raised || 0), 0)))}</p>
                            <p className="mt-1 text-sm text-slate-600">{lang === 'my' ? 'စုစုပေါင်းတိုးတက်မှု' : 'Total raised'}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                            <ShieldCheck className="h-5 w-5 text-emerald-700" />
                            <p className="mt-3 text-2xl font-black text-slate-900">{fundPools.length}</p>
                            <p className="mt-1 text-sm text-slate-600">{lang === 'my' ? 'လှူဒါန်းပမာဏ' : 'Active pools'}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                            <HandCoins className="h-5 w-5 text-emerald-700" />
                            <p className="mt-3 text-2xl font-black text-slate-900">{currency.format(Number(selectedPool.unit_cost || 0))}</p>
                            <p className="mt-1 text-sm text-slate-600">{lang === 'my' ? 'တစ်ဦးလျှင် ကုန်ကျစရိတ်' : 'Unit cost'}</p>
                        </div>
                    </div>
            </main>

            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
                        <h2 className="text-2xl font-black text-slate-900">{lang === 'my' ? 'လှူဒါန်းမှု လက်ခံရရှိပါပြီ' : 'Donation submitted'}</h2>
                        <p className="mt-3 text-sm text-slate-600">{lang === 'my' ? 'အဖွဲ့မှ စစ်ဆေးပြီးနောက် အခြေအနေကို update ပြုလုပ်ပါမည်။' : 'Thank you. Your donation has been submitted for review.'}</p>
                        {submittedReceipt?.tracking_token && <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-left"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">{lang === 'my' ? 'လှူဒါန်းမှုအမှတ်' : 'Tracking ID'}</p><p className="mt-1 break-all font-mono text-sm font-bold text-slate-900">{submittedReceipt.tracking_token}</p></div>}
                        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <Link href={route('donations.status-page')} className="rounded-full bg-[#065F46] px-5 py-2 text-sm font-bold text-white">{lang === 'my' ? 'အခြေအနေစစ်ရန်' : 'Track donation'}</Link>
                            <button type="button" onClick={() => setShowSuccess(false)} className="rounded-full bg-[#F59E0B] px-5 py-2 text-sm font-bold text-[#065F46]">OK</button>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
        </>
    );
}
