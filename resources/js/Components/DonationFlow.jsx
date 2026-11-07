import { Check, HandCoins, Utensils, Pill, Layers, AlertTriangle, HeartPulse } from 'lucide-react';

const poolIcon = (pool) => {
    const text = `${pool.title_en || ''} ${pool.title_mm || ''} ${pool.description || ''}`.toLowerCase();
    if (text.includes('meal') || text.includes('food') || text.includes('အစား')) return Utensils;
    if (text.includes('med') || text.includes('health') || text.includes('ဆေး')) return Pill;
    if (text.includes('blanket') || text.includes('cloth') || text.includes('အဝတ်')) return Layers;
    if (text.includes('emergency') || text.includes('urgent')) return AlertTriangle;
    if (text.includes('care') || text.includes('စောင့်')) return HeartPulse;
    return HandCoins;
};

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
    const amountNum = Number(selectedAmount) || 0;
    const amountInvalid = amountNum > 0 && amountNum < 1000;

    return (
        <section className={`rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6 ${compact ? '' : 'lg:min-h-full'}`}>
            <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700"><HandCoins className="h-5 w-5" /></div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">{copy('အဆင့် ၁', 'Step 1')}</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">{copy('ကူညီမည့် အပိုင်းကို ရွေးပါ', 'Choose where to help')}</h2>
                </div>
            </div>

            <div className={`mt-5 grid gap-3 ${fundPools.length > 2 ? 'sm:grid-cols-2' : ''}`} role="radiogroup" aria-label={copy('ရန်ပုံငွေ ရွေးချယ်ရန်', 'Choose a fund pool')}>
                {fundPools.map((pool) => {
                    const selected = Number(selectedPoolId) === Number(pool.id);
                    const Icon = poolIcon(pool);
                    return (
                        <button
                            key={pool.id}
                            type="button"
                            role="radio"
                            onClick={() => onPoolSelect(pool.id)}
                            aria-checked={selected}
                            className={`relative w-full rounded-2xl border-2 p-4 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${selected ? 'border-emerald-600 bg-emerald-50 shadow-md ring-1 ring-emerald-600/15' : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm'}`}
                        >
                            {selected && (
                                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white" aria-hidden="true">
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </span>
                            )}
                            <div className="flex items-start gap-3 pr-8">
                                <div className={`shrink-0 rounded-xl p-2.5 ${selected ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold leading-snug text-slate-900">{lang === 'my' ? (pool.title_mm || pool.title_en) : (pool.title_en || pool.title_mm)}</p>
                                    {pool.description ? <p className="mt-1 text-sm leading-relaxed text-slate-600">{pool.description}</p> : null}
                                    <p className="mt-2 text-xs font-semibold text-emerald-700">{copy('တစ်စုံလျှင်', 'Per unit')} · {currency.format(Number(pool.unit_cost || 0))}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
                {fundPools.length === 0 && (
                    <div role="status" className="col-span-full rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-5 text-center">
                        <p className="font-semibold text-slate-800">{copy('လှူဒါန်းနိုင်သော ရန်ပုံငွေများ မရှိသေးပါ', 'No donation funds are available yet')}</p>
                        <p className="mt-1 text-sm text-slate-600">{copy('ကျေးဇူးပြု၍ နောက်မှ ပြန်ကြိုးစားပါ။ မကြာမီ ကူညီရေးအစီအစဉ်များ စတင်ပါမည်။', 'Please try again later. New outreach funds will open soon.')}</p>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <p className="text-sm font-semibold text-slate-800">{copy('ပမာဏ ရွေးပါ', 'Choose amount')}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {presetAmounts.map((amount) => {
                        const active = Number(selectedAmount) === amount;
                        return (
                            <button key={amount} type="button" onClick={() => onAmountSelect(amount)} aria-pressed={active} className={`rounded-full px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${active ? 'bg-[#F59E0B] text-[#065F46] shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                {currency.format(amount)}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-3 sm:p-4">
                    <label htmlFor={`${compact ? 'home' : 'donate'}-custom-amount`} className="text-sm font-medium text-slate-700">{copy('စိတ်ကြိုက် ပမာဏ', 'Custom amount')}</label>
                    <div className={`mt-2 flex items-center rounded-xl border bg-white px-3 shadow-sm ${amountInvalid ? 'border-red-300 ring-1 ring-red-200' : 'border-amber-200 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100'}`}>
                        <span className="text-sm font-semibold text-slate-500">MMK</span>
                        <input
                            id={`${compact ? 'home' : 'donate'}-custom-amount`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={selectedAmount}
                            onChange={(event) => onAmountSelect(event.target.value.replace(/[^\d]/g, ''))}
                            className="w-full border-0 bg-transparent px-2 py-3 text-base text-slate-900 outline-none focus:ring-0"
                            aria-invalid={amountInvalid}
                            aria-describedby={`${compact ? 'home' : 'donate'}-amount-help`}
                        />
                    </div>
                    <p id={`${compact ? 'home' : 'donate'}-amount-help`} className={`mt-2 text-xs ${amountInvalid ? 'font-semibold text-red-700' : 'text-slate-600'}`} role={amountInvalid ? 'alert' : undefined}>
                        {amountInvalid ? copy('အနည်းဆုံး ၁,၀၀၀ ကျပ် လိုအပ်ပါသည်။', 'Minimum amount is MMK 1,000.') : copy('အနည်းဆုံး ၁,၀၀၀ ကျပ်', 'Minimum MMK 1,000')}
                    </p>
                </div>
            </div>
        </section>
    );
}
