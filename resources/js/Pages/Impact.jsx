import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, HandCoins, MapPinned, Soup, Stethoscope, Users, Wallet } from 'lucide-react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';
import { formatDisplayDate, formatMonthLabel } from '../lib/formatDisplayDate';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

const categoryLabels = {
    my: { food: 'အစားအစာ', medicine: 'ဆေးဝါး', transport: 'သယ်ယူပို့ဆောင်ရေး', supplies: 'ပစ္စည်း', shelter: 'ခိုလှုံရေး', other: 'အခြား' },
    en: { food: 'Food', medicine: 'Medicine', transport: 'Transport', supplies: 'Supplies', shelter: 'Shelter', other: 'Other' },
};

export default function Impact({ impact = {}, financialSummary = {}, recentTrips = [], monthlySummary = [], expenseBreakdown = [], dataFreshness = null }) {
    const [lang, setLang] = useLanguage();
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);

    const currentMonth = monthlySummary[monthlySummary.length - 1] ?? {};
    const starting = copy('စတင်မှတ်တမ်းတင်နေဆဲ', 'Starting to record');
    const moneyOrStarting = (value) => (Number(value) > 0 ? currency.format(Number(value)) : starting);
    const countOrStarting = (value) => (Number(value) > 0 ? value : starting);
    const monthBalance = Number(currentMonth.approved_amount || 0) - Number(currentMonth.expense_amount || 0);
    const totalReceived = Number(financialSummary.total_received ?? 0);
    const totalSpent = Number(financialSummary.total_spent ?? 0);
    const balanceGap = currency.format(Math.abs(totalReceived - totalSpent));
    const balanceSentence = totalReceived === 0 && totalSpent === 0
        ? ''
        : totalSpent > totalReceived
            ? copy(`ကုန်ကျစရိတ်က အတည်ပြုပြီး အလှူထက် ${balanceGap} ပိုနေပါသည်။`, `Recorded expenses are ${balanceGap} more than approved donations.`)
            : totalReceived > totalSpent
                ? copy(`အတည်ပြုပြီး အလှူက ကုန်ကျစရိတ်ထက် ${balanceGap} ပိုနေပါသည်။`, `Approved donations are ${balanceGap} more than recorded expenses.`)
                : copy('အတည်ပြုပြီး အလှူနဲ့ ကုန်ကျစရိတ် ညီနေပါသည်။', 'Approved donations and recorded expenses match.');
    const monthGap = currency.format(Math.abs(monthBalance));
    const monthSentence = Number(currentMonth.approved_amount || 0) === 0 && Number(currentMonth.expense_amount || 0) === 0
        ? ''
        : monthBalance < 0
            ? copy(`ဒီလ ကုန်ကျစရိတ်က အလှူထက် ${monthGap} ပိုနေပါသည်။`, `This month, expenses are ${monthGap} more than donations.`)
            : monthBalance > 0
                ? copy(`ဒီလ အလှူက ကုန်ကျစရိတ်ထက် ${monthGap} ပိုနေပါသည်။`, `This month, donations are ${monthGap} more than expenses.`)
                : copy('ဒီလ အလှူနဲ့ ကုန်ကျစရိတ် ညီနေပါသည်။', 'This month, donations and expenses match.');
    const stats = [
        { label: copy('ဒီလ အလှူ', 'Donations this month'), value: moneyOrStarting(currentMonth.approved_amount), icon: HandCoins },
        { label: copy('ဒီလ ကုန်ကျစရိတ်', 'Expenses this month'), value: moneyOrStarting(currentMonth.expense_amount), icon: Wallet },
        { label: copy('ဒီလ လက်ကျန်', 'Balance this month'), value: Number(currentMonth.approved_amount || 0) === 0 && Number(currentMonth.expense_amount || 0) === 0 ? starting : currency.format(monthBalance), note: monthSentence, icon: CheckCircle2 },
        { label: copy('ဒီလ ကွင်းဆင်းခရီး', 'Trips this month'), value: countOrStarting(currentMonth.trip_count), icon: MapPinned },
    ];
    const tripPhotos = recentTrips.flatMap((trip) => (Array.isArray(trip.photos_json) ? trip.photos_json : []).map((photo) => ({
        src: String(photo).startsWith('http') ? photo : `/storage/${photo}`,
        township: trip.township,
    }))).slice(0, 3);
    const freshnessLabel = dataFreshness ? new Intl.DateTimeFormat(lang === 'my' ? 'my-MM' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dataFreshness)) : starting;

    const outreachStats = [
        { label: copy('အသက်ကြီးသူများ', 'Elderly helped'), value: impact.total_elderly_helped ?? 0, icon: Users },
        { label: copy('အစားအစာ', 'Meals distributed'), value: impact.meals_distributed ?? 0, icon: Soup },
        { label: copy('ဆေးဝါးကူညီမှု', 'Medical aid'), value: impact.medical_aid_provided ?? 0, icon: Stethoscope },
        { label: copy('မြို့နယ်များ', 'Townships reached'), value: impact.townships_reached ?? 0, icon: MapPinned },
    ];

    return (
        <>
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
                        <p className="mt-3 max-w-2xl text-base text-emerald-50/80">
                            {lang === 'my'
                                ? 'လှူဒါန်းထားသော ငွေများကို တိုက်ရိုက်မူဝါဒနှင့်အညီ သက်ဆိုင်ရာ လုပ်ဆောင်မှုများအတွက် အသုံးပြုပါသည်။'
                                : 'Funds are directed to direct outreach care, daily meals, medicine, and presence for vulnerable elders in the community.'}
                        </p>
                    </section>

                    <div className="mt-8 grid gap-4 md:grid-cols-4">
                        {stats.map(({ label, value, note, icon: Icon }) => (
                            <div key={label} className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700"><Icon className="h-5 w-5" /></div>
                                <p className="text-3xl font-black text-slate-900">{value}</p>
                                <p className="mt-2 text-base text-slate-600">{label}</p>
                                {note && <p className="mt-2 text-base leading-relaxed text-slate-700">{note}</p>}
                            </div>
                        ))}
                    </div>

                    <section className="mt-8">
                        <h2 className="text-2xl font-black text-slate-900">{copy('နောက်ဆုံးခရီး ဓာတ်ပုံ', 'Latest trip photos')}</h2>
                        {tripPhotos.length === 0 ? (
                            <p className="mt-4 rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-base text-slate-600">{starting}</p>
                        ) : (
                            <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                {tripPhotos.map((photo) => (
                                    <figure key={photo.src} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
                                        <img src={photo.src} alt={photo.township || copy('ကွင်းဆင်းဓာတ်ပုံ', 'Outreach photo')} className="h-52 w-full object-cover" />
                                        <figcaption className="p-3 text-base font-semibold text-slate-800">{photo.township}</figcaption>
                                    </figure>
                                ))}
                            </div>
                        )}
                    </section>

                    <div className="mt-4 grid gap-4 md:grid-cols-4">
                        {outreachStats.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 inline-flex rounded-2xl bg-slate-50 p-3 text-slate-700"><Icon className="h-5 w-5" /></div>
                                <p className="text-2xl font-black text-slate-900">{value}</p>
                                <p className="mt-2 text-base text-slate-600">{label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl bg-emerald-50 p-5">
                            <p className="text-sm text-emerald-700">{lang === 'my' ? 'လက်ခံရရှိမှု' : 'Total received'}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{moneyOrStarting(totalReceived)}</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-5">
                            <p className="text-sm text-amber-700">{copy('မှတ်တမ်းတင်ထားသော ကုန်ကျစရိတ်', 'Recorded expenses')}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{moneyOrStarting(totalSpent)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-sm text-slate-700">{lang === 'my' ? 'လက်ကျန်ငွေ' : 'Current balance'}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{totalReceived === 0 && totalSpent === 0 ? starting : currency.format(Number(financialSummary.current_balance ?? 0))}</p>
                            {balanceSentence && <p className="mt-3 text-base leading-relaxed text-slate-700">{balanceSentence}</p>}
                        </div>
                    </div>

                    <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-2xl font-black text-slate-900">{copy('ကုန်ကျစရိတ် ခွဲခြမ်း', 'Where the money went')}</h2><p className="mt-2 text-sm text-slate-600">{copy('အတည်ပြုပြီးသော အလှူနှင့် active ကုန်ကျစရိတ်မှတ်တမ်းများကိုသာ ထည့်သွင်းထားပါသည်။', 'Only approved donations and active expense records are included.')}</p></div><Link href={route('impact.monthly')} className="inline-flex rounded-full bg-[#065F46] px-4 py-2 text-sm font-bold text-white">{copy('လစဉ်အစီရင်ခံစာ', 'Monthly report')}</Link></div>
                        {expenseBreakdown.length === 0 ? (
                            <p className="mt-4 text-base text-slate-600">{starting}</p>
                        ) : (
                            <ul className="mt-5 space-y-4">
                                {expenseBreakdown.map((row) => {
                                    const amount = Number(row.amount) || 0;
                                    const width = totalSpent > 0 ? Math.max(8, Math.round((amount / totalSpent) * 100)) : 0;
                                    const label = (categoryLabels[lang] ?? categoryLabels.en)[row.category] || row.category;

                                    return (
                                        <li key={row.category}>
                                            <div className="flex items-baseline justify-between gap-3">
                                                <p className="text-base font-semibold text-slate-800">{label}</p>
                                                <p className="text-base font-black text-slate-900">{currency.format(amount)}</p>
                                            </div>
                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                                                <div className="h-2 rounded-full bg-[#065F46]" style={{ width: `${width}%` }} />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>

                    <p className="mt-5 text-center text-sm text-slate-500">{copy('နောက်ဆုံးမှတ်တမ်းပြင်ဆင်ချိန်', 'Last recorded update')}: {freshnessLabel}</p>

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
                                            <td className="px-3 py-3 font-semibold text-slate-900">{formatMonthLabel(month.month, lang)}</td>
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
                                        <p className="text-sm text-slate-600">{formatDisplayDate(trip.trip_date, lang)}</p>
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
