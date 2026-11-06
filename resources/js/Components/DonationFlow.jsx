import { HandCoins } from 'lucide-react';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const presetAmounts = [5000, 10000, 30000, 50000];

export default function DonationFlow({
    fundPools = [],
    selectedPoolId,
    selectedAmount,
    onPoolSelect,
    onAmountSelect,
    lang = 'my',
    compact = false,
}) {
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);

    return (
        <section className={`rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 ${compact ? '' : 'lg:min-h-full'}`}>
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><HandCoins className="h-5 w-5" /></div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">{copy('လှူဒါန်းရန်', 'Support now')}</p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">{copy('ရန်ပုံငွေရွေးချယ်ပါ', 'Choose a fund pool')}</h2>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                {fundPools.map((pool) => (
                    <button
                        key={pool.id}
                        type="button"
                        onClick={() => onPoolSelect(pool.id)}
                        aria-pressed={Number(selectedPoolId) === Number(pool.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${Number(selectedPoolId) === Number(pool.id) ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-emerald-50/30'}`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="font-bold text-slate-900">{pool.title_mm || pool.title_en}</p>
                                <p className="text-sm text-slate-600">{pool.description}</p>
                            </div>
                            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">{currency.format(Number(pool.unit_cost || 0))}</span>
                        </div>
                    </button>
                ))}
                {fundPools.length === 0 && <p role="status" className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">{copy('ရန်ပုံငွေများ မရှိသေးပါ။', 'No fund pools are available yet.')}</p>}
            </div>

            <div className="mt-6">
                <p className="text-sm font-semibold text-slate-700">{copy('ပမာဏရွေးချယ်ပါ', 'Choose amount')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {presetAmounts.map((amount) => (
                        <button key={amount} type="button" onClick={() => onAmountSelect(amount)} aria-pressed={Number(selectedAmount) === amount} className={`rounded-full px-4 py-2 text-sm font-semibold ${Number(selectedAmount) === amount ? 'bg-[#F59E0B] text-[#065F46]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                            {currency.format(amount)}
                        </button>
                    ))}
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-3">
                    <label htmlFor={`${compact ? 'home' : 'donate'}-custom-amount`} className="text-sm font-medium text-slate-700">{copy('စိတ်ကြိုက်ပမာဏ', 'Custom amount')}</label>
                    <input id={`${compact ? 'home' : 'donate'}-custom-amount`} type="number" min="1000" step="1000" value={selectedAmount} onChange={(event) => onAmountSelect(event.target.value)} className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-emerald-500" />
                    {Number(selectedAmount) < 1000 && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{copy('အနည်းဆုံး MMK 1,000 ထည့်ပါ။', 'Minimum amount is MMK 1,000.')}</p>}
                </div>
            </div>
        </section>
    );
}
