import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, Copy, CreditCard, HandCoins, Landmark, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
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
        donationForm.setData('slip_image', file || null);
        setSlipPreview(file ? URL.createObjectURL(file) : '');
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
                        <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><HandCoins className="h-5 w-5" /></div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">{lang === 'my' ? 'လှူဒါန်းရန်' : 'Support now'}</p>
                                    <h1 className="mt-1 text-3xl font-black text-slate-900">{lang === 'my' ? 'အရင်းအမြစ်ရွေးချယ်ပါ' : 'Choose a fund pool'}</h1>
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
                                    <label htmlFor="custom-amount" className="text-sm font-medium text-slate-700">{lang === 'my' ? 'စိတ်ကြိုက်ပမာဏ' : 'Custom amount'}</label>
                                    <input
                                        id="custom-amount"
                                        type="number"
                                        min="1000"
                                        step="1000"
                                        value={selectedAmount}
                                        onChange={(event) => handleAmountSelect(event.target.value)}
                                        className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-emerald-500"
                                    />
                                    {Number(selectedAmount) < 1000 && <p className="mt-2 text-xs font-semibold text-red-700">{lang === 'my' ? 'အနည်းဆုံး MMK 1,000 ထည့်ပါ။' : 'Minimum amount is MMK 1,000.'}</p>}
                                </div>
                            </div>
                        </section>

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
                                                <p className="font-semibold">{method}</p>
                                                <p className="text-xs text-emerald-50/80">{details.label}</p>
                                                {details.qr_url && <img src={details.qr_url} alt={`${method} QR`} className="mt-2 h-20 w-20 rounded-lg bg-white object-contain p-1" />}
                                            </div>
                                            <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium">{details.phone}</span>
                                        </button>
                                    ))}
                                    {Object.keys(paymentDetails).length === 0 && (
                                        <p role="alert" className="rounded-xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">
                                            {lang === 'my' ? 'ငွေပေးချေမှုနည်းလမ်း မသတ်မှတ်ရသေးပါ။ အုပ်ချုပ်သူထံ ဆက်သွယ်ပါ။' : 'No payment methods are configured yet. Please contact the administrator.'}
                                        </p>
                                    )}
                                        <div className="rounded-2xl bg-white/5 p-4">
                                            <div className="flex items-center gap-2 text-emerald-50"><CreditCard className="h-4 w-4" /> {selectedPayment}</div>
                                        <p className="mt-2 text-sm text-emerald-50/80">{paymentDetails[selectedPayment]?.account_name}</p>
                                        <p className="mt-1 text-sm font-semibold text-white">{paymentDetails[selectedPayment]?.phone}</p>
                                        <button type="button" onClick={copyPaymentNumber} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-3 py-2 text-sm font-semibold text-[#065F46]">
                                            {copiedPayment ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            {copiedPayment ? (lang === 'my' ? 'ကူးယူပြီးပါပြီ' : 'Copied') : (lang === 'my' ? 'အကောင့်နံပါတ်ကူးယူရန်' : 'Copy account number')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                                    {Object.keys(donationForm.errors).length > 0 && (
                                        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                                            {Object.entries(donationForm.errors).map(([field, message]) => (
                                                <p key={field}>{message}</p>
                                            ))}
                                        </div>
                                    )}
                                    <div className="rounded-2xl bg-white/10 p-4 text-sm text-emerald-50">
                                        <p className="font-semibold text-white">{lang === 'my' ? 'လှူဒါန်းမှုအကျဉ်းချုပ်' : 'Donation summary'}</p>
                                        <p className="mt-2">{selectedPool.title_mm || selectedPool.title_en || 'General outreach'} · {currency.format(Number(selectedAmount) || 0)}</p>
                                        <p className="mt-1">{selectedPayment || (lang === 'my' ? 'ငွေပေးချေမှု မရွေးချယ်ရသေးပါ' : 'Payment method not selected')}</p>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <label htmlFor="donor-name" className="text-sm font-semibold text-emerald-50">{lang === 'my' ? 'လှူဒါန်းသူအမည်' : 'Donor name'}
                                        <input
                                            id="donor-name"
                                            type="text"
                                            value={donationForm.data.donor_name}
                                            onChange={(event) => donationForm.setData('donor_name', event.target.value)}
                                            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-normal text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]"
                                        />
                                        </label>
                                        <label htmlFor="donor-phone" className="text-sm font-semibold text-emerald-50">{lang === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone'}
                                        <input
                                            id="donor-phone"
                                            type="tel"
                                            value={donationForm.data.phone}
                                            onChange={(event) => donationForm.setData('phone', event.target.value)}
                                            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-normal text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]"
                                        />
                                        </label>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-emerald-50/90">
                                        <input
                                            type="checkbox"
                                            checked={donationForm.data.is_anonymous}
                                            onChange={(event) => donationForm.setData('is_anonymous', event.target.checked)}
                                            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-400"
                                        />
                                        {lang === 'my' ? 'အမည်မဖော်ပြဘဲ လှူဒါန်းမည်' : 'Donate anonymously'}
                                    </label>
                                    <label htmlFor="wish-note" className="block text-sm font-semibold text-emerald-50">{lang === 'my' ? 'မေတ္တာစာ / အကြံပြုချက်' : 'Wish note or encouragement'}
                                    <textarea
                                        id="wish-note"
                                        value={donationForm.data.wish_note}
                                        onChange={(event) => donationForm.setData('wish_note', event.target.value)}
                                        rows="3"
                                        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-normal text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]"
                                    />
                                    </label>
                                    <label htmlFor="slip-image" className="block text-sm font-semibold text-emerald-50">{lang === 'my' ? 'ငွေလွှဲပြေစာပုံ' : 'Payment slip'}
                                    <input
                                        id="slip-image"
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                        required
                                        onChange={handleSlipChange}
                                        className="mt-1 block w-full rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2 text-sm font-normal text-emerald-50/70 file:mr-3 file:rounded-full file:border-0 file:bg-[#F59E0B] file:px-3 file:py-2 file:text-[#065F46] file:font-semibold"
                                    />
                                    </label>
                                    {slipPreview && <img src={slipPreview} alt={lang === 'my' ? 'ငွေလွှဲပြေစာ preview' : 'Payment slip preview'} className="h-40 w-full rounded-xl object-contain bg-white/10 p-2" />}
                                    <p className="-mt-2 text-xs text-emerald-50/70">{lang === 'my' ? 'ငွေလွှဲပြေစာပုံ (JPG, PNG, WEBP; 4 MB အထိ) ထည့်ပါ။' : 'Upload your payment slip (JPG, PNG, WEBP; up to 4 MB).'}</p>
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
                        <button type="button" onClick={() => setShowSuccess(false)} className="mt-5 rounded-full bg-[#F59E0B] px-5 py-2 text-sm font-bold text-[#065F46]">OK</button>
                    </div>
                </div>
            )}
        </PublicLayout>
        </>
    );
}
