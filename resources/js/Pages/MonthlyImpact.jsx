import { router, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Download, HeartHandshake, MapPinned, Soup, Stethoscope, Wallet } from 'lucide-react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const categoryLabels = {
    my: { food: 'အစားအစာ', medicine: 'ဆေးဝါး', transport: 'သယ်ယူပို့ဆောင်ရေး', supplies: 'ပစ္စည်း', shelter: 'ခိုလှုံရေး', other: 'အခြား' },
    en: { food: 'Food', medicine: 'Medicine', transport: 'Transport', supplies: 'Supplies', shelter: 'Shelter', other: 'Other' },
};

export default function MonthlyImpact({ report = {}, availableMonths = [] }) {
    const [lang, setLang] = useLanguage();
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const showNumber = (value) => new Intl.NumberFormat(lang === 'my' ? 'my-MM' : 'en-US').format(Number(value) || 0);
    const freshness = report.last_updated_at ? new Intl.DateTimeFormat(lang === 'my' ? 'my-MM' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(report.last_updated_at)) : copy('မှတ်တမ်းစတင်နေဆဲ', 'Recording has started');
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const changeMonth = (event) => {
        router.get(route('impact.monthly'), { month: event.target.value }, { preserveState: true, preserveScroll: true });
    };

    return (
        <PublicLayout active="impact" lang={lang} setLang={setLang}>
            <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={route('impact')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"><ArrowLeft className="h-4 w-4" /> {copy('အကျိုးသက်ရောက်မှုသို့', 'Back to impact')}</Link>
                    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><Download className="h-4 w-4" /> {copy('PDF/ပုံနှိပ်ရန်', 'Print / save PDF')}</button>
                </div>

                <section className="mt-8 rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('လစဉ် ပွင့်လင်းမှတ်တမ်း', 'Monthly transparency report')}</p>
                            <h1 className="mt-2 text-3xl font-black md:text-5xl">{report.label || copy('လစဉ် အစီရင်ခံစာ', 'Monthly impact report')}</h1>
                            <p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/85">{copy('အတည်ပြုပြီးသော အလှူနှင့် မှတ်တမ်းတင်ထားသော လုပ်ဆောင်မှုများကို အများပြည်သူ ကြည့်ရှုနိုင်ရန် လစဉ်အလိုက် ဖော်ပြထားပါသည်။', 'Approved donations and recorded activities are published here month by month for public review.')}</p>
                        </div>
                        <label className="flex items-center gap-2 rounded-2xl bg-white/10 p-3 text-sm font-semibold"><CalendarDays className="h-4 w-4" /><span className="sr-only">{copy('လ ရွေးရန်', 'Select month')}</span><select value={report.month || ''} onChange={changeMonth} className="rounded-xl border-0 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-300">{availableMonths.map((month) => <option key={month} value={month}>{month}</option>)}</select></label>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: copy('အတည်ပြုပြီး အလှူ', 'Approved donations'), value: currency.format(Number(report.approved_amount) || 0), icon: Wallet },
                        { label: copy('ကုန်ကျစရိတ်', 'Recorded expenses'), value: currency.format(Number(report.expense_amount) || 0), icon: HeartHandshake },
                        { label: copy('ကူညီခဲ့သူ', 'Elders helped'), value: showNumber(report.elderly_helped), icon: HeartHandshake },
                        { label: copy('ကွင်းဆင်းခရီး', 'Outreach trips'), value: showNumber(report.trip_count), icon: MapPinned },
                    ].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-emerald-700" /><p className="mt-4 text-2xl font-black text-slate-900">{value}</p><p className="mt-2 text-sm text-slate-600">{label}</p></div>)}
                </section>

                <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <h2 className="text-2xl font-black text-slate-900">{copy('ဒီလ လုပ်ဆောင်မှု', 'This month in action')}</h2>
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl bg-emerald-50 p-4"><Soup className="h-5 w-5 text-emerald-700" /><p className="mt-3 text-2xl font-black">{showNumber(report.meals_distributed)}</p><p className="text-sm text-slate-600">{copy('အစားအစာ', 'Meals')}</p></div>
                            <div className="rounded-2xl bg-sky-50 p-4"><Stethoscope className="h-5 w-5 text-sky-700" /><p className="mt-3 text-2xl font-black">{showNumber(report.medical_aid)}</p><p className="text-sm text-slate-600">{copy('ဆေးဝါးကူညီမှု', 'Medical aid')}</p></div>
                            <div className="rounded-2xl bg-amber-50 p-4"><MapPinned className="h-5 w-5 text-amber-700" /><p className="mt-3 text-2xl font-black">{showNumber(report.resolved_reports)}</p><p className="text-sm text-slate-600">{copy('ဖြေရှင်းပြီးသတင်းပေးမှု', 'Resolved reports')}</p></div>
                        </div>
                        <h3 className="mt-7 text-lg font-black text-slate-900">{copy('ရောက်ရှိခဲ့သော မြို့နယ်များ', 'Townships reached')}</h3>
                        <div className="mt-3 flex flex-wrap gap-2">{(report.townships_reached || []).length ? report.townships_reached.map((township) => <span key={township} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{township}</span>) : <span className="text-sm text-slate-500">{copy('မှတ်တမ်းမရှိသေးပါ။', 'No recorded townships yet.')}</span>}</div>
                    </div>
                    <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <h2 className="text-2xl font-black text-slate-900">{copy('ကုန်ကျစရိတ် ခွဲခြမ်း', 'Expense breakdown')}</h2>
                        {(report.expense_breakdown || []).length ? <ul className="mt-5 space-y-4">{report.expense_breakdown.map((row) => <li key={row.category}><div className="flex justify-between gap-3 text-sm"><span className="font-semibold text-slate-700">{(categoryLabels[lang] || categoryLabels.en)[row.category] || row.category}</span><span className="font-black text-slate-900">{currency.format(Number(row.amount) || 0)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#065F46]" style={{ width: `${Math.min(100, Math.max(5, (Number(row.amount) / Math.max(Number(report.expense_amount), 1)) * 100))}%` }} /></div></li>)}</ul> : <p className="mt-5 text-sm text-slate-500">{copy('ဒီလ မှတ်တမ်းတင်ထားသော ကုန်ကျစရိတ် မရှိသေးပါ။', 'No expenses have been recorded for this month yet.')}</p>}
                    </div>
                </section>

                <section className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-5 text-sm leading-relaxed text-emerald-950">
                    <p className="font-black">{copy('မှတ်တမ်းအရင်းအမြစ်နှင့် နောက်ဆုံးပြင်ဆင်ချိန်', 'Data source and freshness')}</p>
                    <p className="mt-2">{copy('ဤအစီရင်ခံစာတွင် အတည်ပြုပြီးသော လှူဒါန်းမှုများ၊ active ကုန်ကျစရိတ်များ၊ မှတ်တမ်းတင်ထားသော ကွင်းဆင်းခရီးများနှင့် ဖြေရှင်းပြီးသတင်းပေးမှုများကိုသာ ထည့်သွင်းထားပါသည်။ နောက်ဆုံးမှတ်တမ်းပြင်ဆင်ချိန် — ', 'This report includes approved donations, active expenses, recorded outreach trips, and resolved reports only. Last recorded update — ')}{freshness}</p>
                    <p className="mt-2 text-xs text-emerald-800">{copy('ပွင့်လင်းမြင်သာမှုအတွက် အချက်အလက်များကို စာရင်းမှတ်တမ်းအတိုင်း ဖော်ပြထားပါသည်။', 'Figures are shown from operational records for transparency; pending donations are not included.')}</p>
                </section>
                {shareUrl && <p className="mt-4 text-center text-xs text-slate-400">{shareUrl}</p>}
            </main>
        </PublicLayout>
    );
}
