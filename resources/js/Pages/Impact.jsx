import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, HandCoins, MapPinned, Soup, Stethoscope, Users, Wallet } from 'lucide-react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

const formatDisplayDate = (value) => {
    if (!value) return '—';

    const safeDate = typeof value === 'string' && value.includes('T') ? value : `${value}T12:00:00`;
    const parsed = new Date(safeDate);

    if (Number.isNaN(parsed.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
};

export default function Impact({ impact = {}, financialSummary = {}, recentTrips = [], monthlySummary = [] }) {
    const [lang, setLang] = useLanguage();
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);

    const stats = [
        { label: copy('အတည်ပြုပြီး အလှူ', 'Approved donations'), value: financialSummary.approved_donations ?? 0, icon: HandCoins },
        { label: copy('ကုန်ကျစရိတ်', 'Recorded expenses'), value: currency.format(Number(financialSummary.total_spent ?? 0)), icon: Wallet },
        { label: copy('ကွင်းဆင်းခရီး', 'Outreach trips'), value: financialSummary.outreach_trips ?? 0, icon: MapPinned },
        { label: copy('ဖြေရှင်းပြီး တိုင်ကြားချက်', 'Resolved reports'), value: financialSummary.resolved_reports ?? 0, icon: CheckCircle2 },
    ];

    const outreachStats = [
        { label: copy('အသက်ကြီးသူများ', 'Elderly helped'), value: impact.total_elderly_helped ?? 0, icon: Users },
        { label: copy('အစားအစာ', 'Meals distributed'), value: impact.meals_distributed ?? 0, icon: Soup },
        { label: copy('ဆေးဝါးကူညီမှု', 'Medical aid'), value: impact.medical_aid_provided ?? 0, icon: Stethoscope },
        { label: copy('မြို့နယ်များ', 'Townships reached'), value: impact.townships_reached ?? 0, icon: MapPinned },
    ];

    return (
        <>
            <Head title={lang === 'my' ? 'အကျိုးသက်ရောက်မှု' : 'Impact'} />
            <PublicLayout active="impact" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-3">
                        <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                            <ArrowLeft className="h-4 w-4" /> {lang === 'my' ? 'မူလသို့' : 'Back home'}
                        </Link>
                    </div>

                    <section className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{lang === 'my' ? 'အကောင်းဆုံးကိုင်ဆောင်မှု' : 'Our outcome'}</p>
                        <h1 className="mt-2 text-3xl font-black md:text-4xl">{lang === 'my' ? 'လမ်းဘေးထဲက အသက်ကြီးသူများကို ကြည့်ရှုပေးနေခြင်း' : 'Street outreach making everyday care possible'}</h1>
                        <p className="mt-3 max-w-2xl text-sm text-emerald-50/80">
                            {lang === 'my'
                                ? 'လှူဒါန်းထားသော ငွေများကို တိုက်ရိုက်မူဝါဒနှင့်အညီ သက်ဆိုင်ရာ လုပ်ဆောင်မှုများအတွက် အသုံးပြုပါသည်။'
                                : 'Funds are directed to direct outreach care, daily meals, medicine, and presence for vulnerable elders in the community.'}
                        </p>
                    </section>

                    <div className="mt-8 grid gap-4 md:grid-cols-4">
                        {stats.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Icon className="h-5 w-5" /></div>
                                <p className="text-3xl font-black text-slate-900">{value}</p>
                                <p className="mt-2 text-sm text-slate-600">{label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                        {outreachStats.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 inline-flex rounded-2xl bg-slate-50 p-3 text-slate-700"><Icon className="h-5 w-5" /></div>
                                <p className="text-2xl font-black text-slate-900">{value}</p>
                                <p className="mt-2 text-sm text-slate-600">{label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl bg-emerald-50 p-5">
                            <p className="text-sm text-emerald-700">{lang === 'my' ? 'လက်ခံရရှိမှု' : 'Total received'}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{currency.format(Number(financialSummary.total_received ?? 0))}</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-5">
                            <p className="text-sm text-amber-700">{copy('မှတ်တမ်းတင်ထားသော ကုန်ကျစရိတ်', 'Recorded expenses')}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{currency.format(Number(financialSummary.total_spent ?? 0))}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-sm text-slate-700">{lang === 'my' ? 'လက်ကျန်ငွေ' : 'Current balance'}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{currency.format(Number(financialSummary.current_balance ?? 0))}</p>
                        </div>
                    </div>

                    <section className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <h2 className="text-2xl font-black text-slate-900">{copy('လစဉ် အကျဉ်းချုပ်', 'Monthly summary')}</h2>
                        <p className="mt-2 text-sm text-slate-600">{copy('လွန်ခဲ့သော ၆ လအတွင်း အတည်ပြုထားသော အလှူ၊ ကုန်ကျစရိတ်၊ ကွင်းဆင်းခရီးနှင့် ဖြေရှင်းပြီး တိုင်ကြားချက်များ။', 'Approved donations, expenses, outreach trips, and resolved reports for the last six months.')}</p>
                        <div className="mt-6 overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                    <tr>
                                        <th className="px-3 py-2">{copy('လ', 'Month')}</th>
                                        <th className="px-3 py-2">{copy('အလှူ', 'Donations')}</th>
                                        <th className="px-3 py-2">{copy('ကုန်ကျ', 'Expenses')}</th>
                                        <th className="px-3 py-2">{copy('ခရီး', 'Trips')}</th>
                                        <th className="px-3 py-2">{copy('ဖြေရှင်းပြီး', 'Resolved')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {monthlySummary.map((month) => (
                                        <tr key={month.month}>
                                            <td className="px-3 py-3 font-semibold text-slate-900">{month.label}</td>
                                            <td className="px-3 py-3">{currency.format(Number(month.approved_amount) || 0)} <span className="text-xs text-slate-500">({month.approved_count})</span></td>
                                            <td className="px-3 py-3">{currency.format(Number(month.expense_amount) || 0)}</td>
                                            <td className="px-3 py-3">{month.trip_count}</td>
                                            <td className="px-3 py-3">{month.resolved_reports}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <h2 className="text-2xl font-black text-slate-900">{copy('မကြာသေးမီက ပြုလုပ်ခဲ့သော ကူညီမှုများ', 'Recent outreach activity')}</h2>
                        <div className="mt-6 space-y-4">
                            {recentTrips.length === 0 && <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">{copy('ကွင်းဆင်းမှတ်တမ်း မရှိသေးပါ။', 'No outreach trips have been recorded yet.')}</p>}
                            {recentTrips.map((trip) => (
                                <div key={trip.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <div>
                                        <p className="font-bold text-slate-900">{trip.township}</p>
                                        <p className="text-sm text-slate-600">{formatDisplayDate(trip.trip_date)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">{trip.elderly_helped_count}</p>
                                        <p className="text-xs text-slate-500">{lang === 'my' ? 'အသက်ကြီးသူများ' : 'elders helped'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </PublicLayout>
        </>
    );
}
