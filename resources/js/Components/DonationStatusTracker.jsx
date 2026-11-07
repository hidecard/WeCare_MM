import { useEffect, useState } from 'react';
import { DONATION_RECEIPT_EVENT, readDonationReceipts, removeDonationReceipt, writeDonationReceipts } from '../lib/donationReceipts';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

export default function DonationStatusTracker({ lang = 'my' }) {
    const [receipts, setReceipts] = useState(readDonationReceipts);

    useEffect(() => {
        let checking = false;
        const syncFromStorage = () => setReceipts(readDonationReceipts());

        const refreshStatuses = async () => {
            if (checking || document.visibilityState === 'hidden') return;
            checking = true;

            try {
                const saved = readDonationReceipts();
                const updated = await Promise.all(saved.map(async (receipt) => {
                    if (receipt.status !== 'pending') return receipt;

                    try {
                        const response = await fetch(route('donations.status', receipt.tracking_token), {
                            headers: { Accept: 'application/json' },
                            cache: 'no-store',
                        });
                        if (!response.ok) return receipt;

                        const status = await response.json();
                        return {
                            ...receipt,
                            donor_name: status.donor_name || receipt.donor_name,
                            amount: String(status.amount ?? receipt.amount),
                            status: status.status || receipt.status,
                            certificate_url: status.certificate_url || null,
                        };
                    } catch {
                        return receipt;
                    }
                }));

                writeDonationReceipts(updated);
                setReceipts(updated);
            } finally {
                checking = false;
            }
        };

        window.addEventListener(DONATION_RECEIPT_EVENT, syncFromStorage);
        window.addEventListener('storage', syncFromStorage);
        window.addEventListener('focus', refreshStatuses);
        document.addEventListener('visibilitychange', refreshStatuses);
        refreshStatuses();
        const timer = window.setInterval(refreshStatuses, 15000);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener(DONATION_RECEIPT_EVENT, syncFromStorage);
            window.removeEventListener('storage', syncFromStorage);
            window.removeEventListener('focus', refreshStatuses);
            document.removeEventListener('visibilitychange', refreshStatuses);
        };
    }, []);

    if (receipts.length === 0) return null;

    const copy = lang === 'my'
        ? {
            heading: 'သင့်လှူဒါန်းမှုများ',
            pending: 'အက်ဒမင် စစ်ဆေးနေဆဲဖြစ်သည်။ အတည်ပြုပြီးပါက ကျေးဇူးတင်လွှာကို ဤနေရာတွင် အလိုအလျောက် ရရှိပါမည်။',
            approved: 'လှူဒါန်းမှုကို အတည်ပြုပြီးပါပြီ။ ကျေးဇူးတင်လွှာ ရရှိနိုင်ပါပြီ။',
            rejected: 'ဤလှူဒါန်းမှုကို အတည်မပြုနိုင်ခဲ့ပါ။ အသေးစိတ်အတွက် WeCare အဖွဲ့ကို ဆက်သွယ်ပါ။',
            certificate: 'လက်မှတ်ပုံ (PNG) ရယူရန်',
            remove: 'ဖယ်ရှားရန်',
            approvedLabel: 'အတည်ပြုပြီး',
            rejectedLabel: 'အတည်မပြု',
            pendingLabel: 'စစ်ဆေးဆဲ',
        }
        : {
            heading: 'Your donations',
            pending: 'Waiting for admin review. Your appreciation certificate will appear here automatically after approval.',
            approved: 'Your donation is approved. Your appreciation certificate is ready.',
            rejected: 'This donation could not be approved. Please contact the WeCare team for details.',
            certificate: 'Download certificate image (PNG)',
            remove: 'Remove',
            approvedLabel: 'Approved',
            rejectedLabel: 'Not approved',
            pendingLabel: 'Under review',
        };

    return (
        <section className="mx-auto max-w-7xl space-y-3 px-4 pt-4 sm:px-6 lg:px-8" aria-live="polite">
            {receipts.map((receipt) => (
                <article key={receipt.tracking_token} className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-5">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-bold text-slate-900">{copy.heading}</h2>
                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${receipt.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : receipt.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                {receipt.status === 'approved' ? copy.approvedLabel : receipt.status === 'rejected' ? copy.rejectedLabel : copy.pendingLabel}
                            </span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-slate-700">{receipt.donor_name} · {currency.format(Number(receipt.amount) || 0)}</p>
                        <p className="mt-1 text-sm text-slate-600">{receipt.status === 'approved' ? copy.approved : receipt.status === 'rejected' ? copy.rejected : copy.pending}</p>
                    </div>
                    <div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">
                        {receipt.status === 'approved' && receipt.certificate_url && (
                            <a href={receipt.certificate_url} target="_blank" rel="noreferrer" className="rounded-full bg-[#065F46] px-4 py-2 text-center text-sm font-bold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300">
                                {copy.certificate}
                            </a>
                        )}
                        <button type="button" onClick={() => removeDonationReceipt(receipt.tracking_token)} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200">
                            {copy.remove}
                        </button>
                    </div>
                </article>
            ))}
        </section>
    );
}
