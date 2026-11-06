import { Check, Copy, CreditCard } from 'lucide-react';

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
}) {
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);

    if (step === 2) {
        return (
            <div className="mt-6 space-y-4">
                {Object.entries(paymentDetails).map(([method, details]) => (
                    <button key={method} type="button" onClick={() => onPaymentSelect(method)} aria-pressed={selectedPayment === method} className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left ${selectedPayment === method ? 'border-[#F59E0B] bg-[#F59E0B]/10' : 'border-white/10 bg-white/5'}`}>
                        <div><p className="font-semibold">{method}</p><p className="text-xs text-emerald-50/80">{details.label}</p>{details.qr_url && <img src={details.qr_url} alt={`${method} QR`} className="mt-2 h-20 w-20 rounded-lg bg-white object-contain p-1" />}</div>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-medium">{details.phone}</span>
                    </button>
                ))}
                {Object.keys(paymentDetails).length === 0 && <p role="alert" className="rounded-xl bg-amber-100 p-3 text-sm font-semibold text-amber-900">{copy('ငွေပေးချေမှုနည်းလမ်း မသတ်မှတ်ရသေးပါ။ အုပ်ချုပ်သူထံ ဆက်သွယ်ပါ။', 'No payment methods are configured yet. Please contact the administrator.')}</p>}
                <div className="rounded-2xl bg-white/5 p-4"><div className="flex items-center gap-2 text-emerald-50"><CreditCard className="h-4 w-4" /> {selectedPayment}</div><p className="mt-2 text-sm text-emerald-50/80">{paymentDetails[selectedPayment]?.account_name}</p><p className="mt-1 text-sm font-semibold text-white">{paymentDetails[selectedPayment]?.phone}</p><button type="button" onClick={() => onCopyPaymentNumber(selectedPayment)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-3 py-2 text-sm font-semibold text-[#065F46]">{copiedPayment ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copiedPayment ? copy('ကူးယူပြီးပါပြီ', 'Copied') : copy('အကောင့်နံပါတ်ကူးယူရန်', 'Copy account number')}</button></div>
            </div>
        );
    }

    if (step !== 3) return null;

    return (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {Object.keys(donationForm.errors).length > 0 && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{Object.entries(donationForm.errors).map(([field, message]) => <p key={field}>{message}</p>)}</div>}
            <div className="grid gap-3 sm:grid-cols-2">
                <label htmlFor="shared-donor-name" className="text-sm font-semibold text-emerald-50">{copy('လှူဒါန်းသူအမည်', 'Donor name')}<input id="shared-donor-name" type="text" value={donationForm.data.donor_name} onChange={(event) => donationForm.setData('donor_name', event.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-normal text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]" /></label>
                <label htmlFor="shared-donor-phone" className="text-sm font-semibold text-emerald-50">{copy('ဖုန်းနံပါတ်', 'Phone')}<input id="shared-donor-phone" type="tel" value={donationForm.data.phone} onChange={(event) => donationForm.setData('phone', event.target.value)} className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-normal text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]" /></label>
            </div>
            <label className="flex items-center gap-2 text-sm text-emerald-50/90"><input type="checkbox" checked={donationForm.data.is_anonymous} onChange={(event) => donationForm.setData('is_anonymous', event.target.checked)} className="h-4 w-4 rounded border-white/20 bg-white/5 accent-amber-400" />{copy('အမည်မဖော်ပြဘဲ လှူဒါန်းမည်', 'Donate anonymously')}</label>
            <label htmlFor="shared-wish-note" className="block text-sm font-semibold text-emerald-50">{copy('မေတ္တာစာ / အကြံပြုချက်', 'Wish note or encouragement')}<textarea id="shared-wish-note" value={donationForm.data.wish_note} onChange={(event) => donationForm.setData('wish_note', event.target.value)} rows="3" className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-normal text-white placeholder:text-emerald-50/60 outline-none focus:border-[#F59E0B]" /></label>
            <label htmlFor="shared-slip-image" className="block text-sm font-semibold text-emerald-50">{copy('ငွေလွှဲပြေစာပုံ', 'Payment slip')}<input id="shared-slip-image" type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" required onChange={onSlipChange} className="mt-1 block w-full rounded-xl border border-dashed border-white/15 bg-white/5 px-3 py-2 text-sm font-normal text-emerald-50/70 file:mr-3 file:rounded-full file:border-0 file:bg-[#F59E0B] file:px-3 file:py-2 file:text-[#065F46] file:font-semibold" /></label>
            {slipError && <p role="alert" className="rounded-xl bg-red-100 p-3 text-xs font-semibold text-red-800">{slipError}</p>}
            {slipPreview && <img src={slipPreview} alt={copy('ငွေလွှဲပြေစာ preview', 'Payment slip preview')} className="h-40 w-full rounded-xl object-contain bg-white/10 p-2" />}
            <p className="-mt-2 text-xs text-emerald-50/70">{copy('ငွေလွှဲပြေစာပုံ (JPG, PNG, WEBP; 4 MB အထိ) ထည့်ပါ။', 'Upload your payment slip (JPG, PNG, WEBP; up to 4 MB).')}</p>
            <button type="submit" className="w-full rounded-full bg-[#F59E0B] px-4 py-3 text-base font-bold text-[#065F46] hover:bg-amber-400" disabled={donationForm.processing}>{donationForm.processing ? copy('တင်သွင်းနေသည်...', 'Submitting...') : copy('လှူဒါန်းမှုတင်သွင်းရန်', 'Submit donation')}</button>
        </form>
    );
}
