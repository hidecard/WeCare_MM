import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPinned, Soup, Stethoscope, Users } from 'lucide-react';
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

export default function Impact({ impact = {}, financialSummary = {}, recentTrips = [] }) {
    const [lang, setLang] = useLanguage();

    const stats = [
        { label: lang === 'my' ? 'အသက်ကြီးသူများ' : 'Elderly helped', value: impact.total_elderly_helped ?? 0, icon: Users },
        { label: lang === 'my' ? 'အစားအစာ' : 'Meals distributed', value: impact.meals_distributed ?? 0, icon: Soup },
        { label: lang === 'my' ? 'ဆေးဝါးကူညီမှု' : 'Medical aid', value: impact.medical_aid_provided ?? 0, icon: Stethoscope },
        { label: lang === 'my' ? 'မြို့နယ်များ' : 'Townships reached', value: impact.townships_reached ?? 0, icon: MapPinned },
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

                    <div className="mt-8 grid gap-6 lg:grid-cols-3">
                        <div className="rounded-2xl bg-emerald-50 p-5">
                            <p className="text-sm text-emerald-700">{lang === 'my' ? 'လက်ခံရရှိမှု' : 'Total received'}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{currency.format(Number(financialSummary.total_received ?? 0))}</p>
                        </div>
                        <div className="rounded-2xl bg-amber-50 p-5">
                            <p className="text-sm text-amber-700">{lang === 'my' ? 'အသုံးပြုမှု' : 'Total spent'}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{currency.format(Number(financialSummary.total_spent ?? 0))}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-5">
                            <p className="text-sm text-slate-700">{lang === 'my' ? 'လက်ကျန်ငွေ' : 'Current balance'}</p>
                            <p className="mt-2 text-3xl font-black text-slate-900">{currency.format(Number(financialSummary.current_balance ?? 0))}</p>
                        </div>
                    </div>

                    <section className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <h2 className="text-2xl font-black text-slate-900">{lang === 'my' ? 'မကြာမီရောက်ရှိလာမည့် စစ်ဆင်မှုများ' : 'Recent outreach activity'}</h2>
                        <div className="mt-6 space-y-4">
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
