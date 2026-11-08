import { Check, Copy, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { myanmarMobileError } from '../lib/myanmarMobile';

export default function DonationFlowSteps({
    step,
    lang = 'my',
    paymentDetails = {},
    selectedPayment = '',
    onPaymentSelect,
    onCopyPaymentNumber,
    copiedPayment = false,
    donationForm,
    onSubmit,
    onSlipChange,
    slipPreview = '',
    slipError = '',
    slipProcessing = false,
    review = null,
    onEditPool,
    onEditAmount,
}) {
    const [showQr, setShowQr] = useState(false);
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const phoneError = myanmarMobileError(donationForm.data.phone, lang) || donationForm.errors.phone || '';

    if (step === 2) {
        const methods = Object.entries(paymentDetails);
        return (
            <div className="mt-6 space-y-4">
                {methods.map(([method, details]) => {
                    const active = selectedPayment === method;
                    return (
                        <button key={method} type="button" onClick={() => onPaymentSelect(method)} aria-pressed={active} className={`relative flex w-full items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${active ? 'border-[#F59E0B] bg-[#F59E0B]/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                            <div className="min-w-0">
                                <p className="font-semibold">{method}</p>
                                <p className="text-xs text-emerald-50/85">{details.label}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                {active && <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F59E0B] text-[#065F46]"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>}
                            </div>
                        </button>
                    );
                })}
                {methods.length === 0 && (
                    <p role="alert" className="rounded-xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">{copy('ငွေပေးချေမှုနည်းလမ်း မသတ်မှတ်ရသေးပါ။ အုပ်ချုပ်သူထံ ဆက်သွယ်ပါ။', 'No payment methods are configured yet. Please contact the administrator.')}</p>
                )}
                {paymentDetails[selectedPayment] && (
                    <div className="rounded-2xl bg-white p-5 text-slate-900">
                        <div className="flex items-center gap-2 text-base font-semibold text-emerald-800"><CreditCard className="h-5 w-5" /> {selectedPayment}</div>
                        <p className="mt-3 text-base text-slate-600">{paymentDetails[selectedPayment]?.account_name}</p>
                        <p className="mt-1 break-all text-3xl font-black tracking-wide text-slate-900">{paymentDetails[selectedPayment]?.phone}</p>
                        {String(paymentDetails[selectedPayment]?.phone || '').replace(/\D/g, '').length > 0 && String(paymentDetails[selectedPayment]?.phone || '').replace(/\D/g, '').length < 9 && (
                            <p role="alert" className="mt-2 text-base font-semibold text-red-700">{copy('နံပါတ်စစ်ပါ။ ဒီအကောင့်နံပါတ်က မပြည့်သေးပါ။', 'Check this number. It looks incomplete.')}</p>
                        )}
                        {paymentDetails[selectedPayment]?.qr_url && (
                            <button type="button" onClick={() => setShowQr(true)} className="mx-auto mt-4 block rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300" aria-label={copy('QR ကုဒ်ကို အကြီးချဲ့ကြည့်ရန်', 'Enlarge payment QR code')}><img src={paymentDetails[selectedPayment].qr_url} alt={`${selectedPayment} QR`} className="h-56 w-56 rounded-2xl bg-white object-contain p-3 ring-1 ring-slate-200" /></button>
                        )}
                        <button type="button" disabled={String(paymentDetails[selectedPayment]?.phone || '').replace(/\D/g, '').length < 9} onClick={() => onCopyPaymentNumber(selectedPayment)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-4 py-3 text-base font-bold text-[#065F46] transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50">
                            {copiedPayment ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copiedPayment ? copy('ကူးပြီးပါပြီ', 'Copied') : copy('အကောင့်နံပါတ် ကူးရန်', 'Copy account number')}
                        </button>
                        {copiedPayment && (
                            <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4" role="status">
                                <p className="text-base font-semibold text-emerald-800">{copy('နံပါတ်ကို ကူးပြီးပါပြီ။ ငွေလွှဲပြီးနောက် ငွေလွှဲပြေစာ (slip) ကို အဆင့် ၃ တွင် တင်ပါ။', 'Number copied. After transferring, upload your payment slip in step 3.')}</p>
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-emerald-900">
                                    <li>{copy('ရွေးထားသော လှူဒါန်းငွေပမာဏအတိုင်း တိတိကျကျ လွှဲပါ။', 'Transfer the exact donation amount you selected.')}</li>
                                    <li>{copy('မှတ်ချက်/reference ထည့်ရန် မလိုအပ်ပါ (အဖွဲ့မှ တောင်းဆိုထားခြင်း မရှိလျှင်)။', 'A transfer note/reference is not required unless the team asks for it.')}</li>
                                    <li>{copy('မှားယွင်းသော အကောင့်သို့ လွှဲမိခြင်း ရှောင်ရန် အကောင့်နံပါတ်ကို ပြန်စစ်ပါ။', 'Double-check the account number before sending.')}</li>
                                </ul>
                            </div>
                        )}
                        {showQr && paymentDetails[selectedPayment]?.qr_url && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-5" role="dialog" aria-modal="true" aria-label={copy('ငွေပေးချေမှု QR ကုဒ်', 'Payment QR code')} onClick={() => setShowQr(false)}>
                                <div className="relative rounded-3xl bg-white p-4 shadow-2xl" onClick={(event) => event.stopPropagation()}>
                                    <img src={paymentDetails[selectedPayment].qr_url} alt={`${selectedPayment} enlarged QR`} className="max-h-[75vh] max-w-[85vw] rounded-2xl object-contain" />
                                    <button type="button" onClick={() => setShowQr(false)} className="mt-3 w-full rounded-full bg-[#065F46] px-4 py-3 text-sm font-bold text-white">{copy('ပိတ်ရန်', 'Close')}</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (step !== 3) return null;

    const paymentMethods = Object.entries(paymentDetails);

    return (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {paymentMethods.length === 0 ? (
                <p role="alert" className="rounded-xl bg-amber-100 p-4 text-base font-semibold text-amber-900">{copy('ငွေပေးချေမှု မဖွင့်ရသေးပါ။ လှူဒါန်းခလုတ်ကို ခဏပိတ်ထားပါတယ်။', 'Payments are not open yet, so donating is paused.')}</p>
            ) : null}
            {Object.keys(donationForm.errors).length > 0 && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                    {Object.entries(donationForm.errors).map(([field, message]) => <p key={field}>{message}</p>)}
                </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
                <label htmlFor="shared-donor-name" className="text-base font-semibold text-emerald-50">{copy('လှူဒါန်းသူအမည်', 'Donor name')}<input id="shared-donor-name" type="text" autoComplete="name" value={donationForm.data.donor_name} onChange={(event) => donationForm.setData('donor_name', event.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-base font-normal text-white placeholder:text-emerald-50/50 outline-none transition focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30" /></label>
                <label htmlFor="shared-donor-phone" className="text-base font-semibold text-emerald-50">{copy('ဖုန်းနံပါတ်', 'Phone')}<input id="shared-donor-phone" type="tel" inputMode="tel" autoComplete="tel" value={donationForm.data.phone} onChange={(event) => donationForm.setData('phone', event.target.value)} aria-invalid={Boolean(phoneError)} placeholder="09..." className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-base font-normal text-white placeholder:text-emerald-50/50 outline-none transition focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30" /></label>
            </div>
            <label htmlFor="shared-donor-email" className="block text-base font-semibold text-emerald-50">{copy('အီးမေးလ် (အတည်ပြုချက် ပို့ရန်)', 'Email for the review result')}<input id="shared-donor-email" type="email" autoComplete="email" value={donationForm.data.donor_email ?? ''} onChange={(event) => donationForm.setData('donor_email', event.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-base font-normal text-white placeholder:text-emerald-50/50 outline-none transition focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30" placeholder="name@email.com" /></label>
            <label className="flex items-center gap-2 text-base text-emerald-50/90"><input type="checkbox" checked={donationForm.data.is_anonymous} onChange={(event) => donationForm.setData('is_anonymous', event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-white/5 text-amber-500 accent-amber-400 focus:ring-amber-300" />{copy('အမည်မဖော်ပြဘဲ လှူဒါန်းမည်', 'Donate anonymously')}</label>
            <label htmlFor="shared-wish-note" className="block text-base font-semibold text-emerald-50">{copy('ဆုတောင်းစကား / အကြံပြုချက်', 'Wish note or encouragement')}<textarea id="shared-wish-note" value={donationForm.data.wish_note} onChange={(event) => donationForm.setData('wish_note', event.target.value)} rows="3" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-base font-normal text-white placeholder:text-emerald-50/50 outline-none transition focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/30" placeholder={copy('ဥပမာ - သက်ကြီးရွယ်အိုများ ကျန်းမာချမ်းသာပါစေ', 'e.g. Wishing health and comfort to the elders')} /></label>
            <label htmlFor="shared-slip-image" className="block text-base font-semibold text-emerald-50">{copy('ငွေလွှဲပြေစာပုံ', 'Payment slip')}<input id="shared-slip-image" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required onChange={onSlipChange} className="mt-1 block w-full rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-3 text-sm font-normal text-emerald-50/70 file:mr-3 file:rounded-full file:border-0 file:bg-[#F59E0B] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#065F46]" /></label>
            {slipPreview && <img src={slipPreview} alt={copy('ငွေလွှဲပြေစာ ကြိုတင်ကြည့်ရှုမှု', 'Payment slip preview')} className="h-40 w-full rounded-xl bg-white object-contain p-2" />}
            <p className="text-base text-emerald-50/80">{copy('JPG, PNG, WEBP (4 MB အထိ) တင်ပါ။', 'Upload JPG, PNG, or WEBP (up to 4 MB).')}</p>
            <div className="rounded-2xl border border-amber-200/40 bg-amber-300/10 p-4 text-sm text-emerald-50">
                <p className="font-semibold text-amber-100">{copy('မတင်မီ သတိပြုရန်', 'Before you submit')}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-emerald-50/90">
                    <li>{copy('ငွေလွှဲပမာဏသည် အောက်ပါ ရွေးချယ်ထားသော ပမာဏနှင့် ကိုက်ညီရပါမည်။', 'The transferred amount must match the selected amount below.')}</li>
                    <li>{copy('ပြေစာပုံတွင် ပမာဏ/ရက်စွဲ/အကောင့်အချက်အလက် မြင်ရရှင်းလင်းပါစေ။', 'Make sure the slip clearly shows the amount, date, and account details.')}</li>
                    <li>{copy('မှတ်ချက်/reference မှားရေးခြင်းဖြင့် စစ်ဆေးမှုနှောင့်နှေးနိုင်သော်လည်း အဓိကမှာ ပြေစာနှင့် ပမာဏ မှန်ကန်ခြင်း ဖြစ်ပါသည်။', 'A wrong note/reference can slow review, but the slip and amount are most important.')}</li>
                    <li>{copy('အီးမေးလ် မထည့်ထားပါက တင်သွင်းပြီးနောက် ရရှိမည့် ခြေရာခံအမှတ် (tracking ID) ကို ကူးယူ/သိမ်းဆည်းထားပါ။', 'If you do not provide an email, save the tracking ID shown after submission.')}</li>
                </ul>
            </div>
            {review && (
                <div className="rounded-2xl bg-white p-4 text-slate-900">
                    <p className="text-base font-semibold text-emerald-800">{copy('မပို့မီ စစ်ပါ', 'Check before you send')}</p>
                    <p className="mt-2 text-lg font-black">{review.pool}</p>
                    <p className="mt-1 text-2xl font-black">{review.amount}</p>
                    <p className="mt-1 text-base text-slate-700">{review.payment || '—'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {onEditPool && <button type="button" onClick={onEditPool} className="rounded-full bg-slate-100 px-4 py-2 text-base font-semibold text-slate-800">{copy('ရန်ပုံငွေ ပြင်ရန်', 'Change fund')}</button>}
                        {onEditAmount && <button type="button" onClick={onEditAmount} className="rounded-full bg-slate-100 px-4 py-2 text-base font-semibold text-slate-800">{copy('ပမာဏ ပြင်ရန်', 'Change amount')}</button>}
                    </div>
                </div>
            )}
            <label className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/5 p-4 text-base text-emerald-50"><input type="checkbox" checked={Boolean(donationForm.data.information_confirmed)} onChange={(event) => donationForm.setData('information_confirmed', event.target.checked)} className="mt-1 h-4 w-4 rounded border-white/20 accent-amber-400" />{copy('လှူဒါန်းငွေပမာဏ၊ ငွေလွှဲနည်းလမ်းနှင့် ကိုယ်ရေးအချက်အလက်များ မှန်ကန်ကြောင်း အတည်ပြုပါသည်။', 'I confirm that the donation amount, payment method, and donor information are correct.')}</label>
            {slipProcessing && <p role="status" className="rounded-xl bg-emerald-100 p-3 text-sm font-semibold text-emerald-900">{copy('ပြေစာပုံကို အရွယ်အစားလျှော့နေသည်...', 'Optimizing the payment slip...')}</p>}
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-4 py-3.5 text-base font-bold text-[#065F46] shadow-sm transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-60" disabled={slipProcessing || donationForm.processing || !!slipError || !!phoneError || paymentMethods.length === 0 || !donationForm.data.slip_image || !donationForm.data.information_confirmed}>
                {donationForm.processing && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#065F46]/30 border-t-[#065F46]" aria-hidden="true" />}
                {donationForm.processing ? copy('တင်သွင်းနေသည်…', 'Submitting…') : copy('လှူဒါန်းမှု အတည်ပြုမည်', 'Confirm donation')}
            </button>
            {slipError && <p role="alert" className="rounded-xl bg-red-100 p-3 text-base font-semibold text-red-800">{slipError}</p>}
            {phoneError && <p role="alert" className="text-base font-semibold text-red-100">{phoneError}</p>}
        </form>
    );
}
