import { Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, HeartHandshake, MapPinned, ShieldCheck, Soup, Stethoscope, Users } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';
import { formatDisplayDate } from '../lib/formatDisplayDate';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const numberFormat = new Intl.NumberFormat('en-MM');

export default function Home({ impact = {}, recentTrips = [], financialSummary = {} }) {
    const [lang, setLang] = useLanguage();
    const [selectedTrip, setSelectedTrip] = useState(null);
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const starting = copy('စတင်မှတ်တမ်းတင်နေဆဲ', 'Starting to record');
    const showCount = (value) => (Number(value) > 0 ? numberFormat.format(value) : starting);
    const showMoney = (value) => (Number(value) > 0 ? currency.format(Number(value)) : starting);
    const received = Number(financialSummary.total_received) || 0;
    const spent = Number(financialSummary.total_spent) || 0;
    const showBalance = received === 0 && spent === 0
        ? starting
        : currency.format(Number(financialSummary.current_balance) || 0);
    const balanceGap = currency.format(Math.abs(received - spent));
    const balanceSentence = received === 0 && spent === 0
        ? ''
        : spent > received
            ? copy(`ကုန်ကျစရိတ်က အတည်ပြုပြီး အလှူထက် ${balanceGap} ပိုနေပါသည်။`, `Recorded expenses are ${balanceGap} more than approved donations.`)
            : received > spent
                ? copy(`အတည်ပြုပြီး အလှူက ကုန်ကျစရိတ်ထက် ${balanceGap} ပိုနေပါသည်။`, `Approved donations are ${balanceGap} more than recorded expenses.`)
                : copy('အတည်ပြုပြီး အလှူနဲ့ ကုန်ကျစရိတ် ညီနေပါသည်။', 'Approved donations and recorded expenses match.');
    const storyNote = (note) => {
        const text = String(note || '').trim();
        if (!text) return '';
        if (lang === 'my' && !/[\u1000-\u109F]/.test(text)) return '';
        return text;
    };

    const statCards = [
        { label: copy('ကူညီခဲ့သော သက်ကြီးရွယ်အို', 'Elders helped'), value: showCount(impact.total_elderly_helped), icon: Users },
        { label: copy('အစားအစာ ထုပ်ပိုးမှု', 'Meal boxes'), value: showCount(impact.meals_distributed), icon: Soup },
        { label: copy('ဆေးဝါး ကူညီမှု', 'Medical aid'), value: showCount(impact.medical_aid_provided), icon: Stethoscope },
        { label: copy('ရောက်ရှိသော မြို့နယ်', 'Townships reached'), value: showCount(impact.townships_reached), icon: MapPinned },
    ];

    return (
        <>
            <PublicLayout active="home" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 text-base sm:px-6 lg:px-8">
                    <section className="overflow-hidden rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg md:p-10">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-base font-semibold text-emerald-50">
                            <ShieldCheck className="h-4 w-4" /> {copy('ယုံကြည်စိတ်ချရသော ဒေသခံ ကူညီရေး', 'Trusted local outreach')}
                        </span>
                        <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                            {copy('လမ်းဘေးရှိ သက်ကြီးရွယ်အိုများအတွက် နွေးထွေးစောင့်ရှောက်မှု', 'Warm care for elders living on the street')}
                        </h1>
                        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-emerald-50">
                            {copy('သင့်လှူဒါန်းမှုကို စေတနာ့ဝန်ထမ်းတွေက အစားအစာ၊ ဆေးဝါးနဲ့ စောင့်ရှောက်မှုအဖြစ် တိုက်ရိုက်ပို့ပါတယ်။', 'Volunteers turn your gift into meals, medicine, and direct care.')}
                        </p>
                        <div className="mt-8">
                            <Link href={route('donate')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-6 py-4 text-lg font-bold text-[#065F46] hover:bg-amber-400">
                                {copy('ယခု လှူဒါန်းမည်', 'Donate now')} <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </section>

                    <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {statCards.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                                <Icon className="h-5 w-5 text-emerald-700" />
                                <p className="mt-4 text-2xl font-black text-slate-900">{value}</p>
                                <p className="mt-2 text-base text-slate-600">{label}</p>
                            </div>
                        ))}
                    </section>

                    <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex items-center justify-between gap-3">
                                <h2 className="text-2xl font-black text-slate-900">{copy('မကြာသေးမီ ကူညီရေးခရီး', 'Recent outreach')}</h2>
                                <Link href={route('outreach')} className="text-base font-semibold text-emerald-700">{copy('အားလုံး', 'View all')}</Link>
                            </div>
                            <div className="mt-5 space-y-3">
                                {recentTrips.slice(0, 3).map((trip) => (
                                    <button key={trip.id} type="button" onClick={() => setSelectedTrip(trip)} className="flex w-full items-center justify-between rounded-2xl bg-slate-50 p-4 text-left">
                                        <div>
                                            <p className="text-lg font-bold text-slate-900">{trip.township}</p>
                                            <p className="text-base text-slate-600">{formatDisplayDate(trip.trip_date, lang)}</p>
                                        </div>
                                        <p className="text-lg font-black text-slate-900">{trip.elderly_helped_count}</p>
                                    </button>
                                ))}
                                {recentTrips.length === 0 && (
                                    <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                                        <HeartHandshake className="mx-auto h-8 w-8 text-emerald-300" />
                                        <p className="mt-3 text-lg font-semibold text-slate-800">{starting}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <h2 className="text-2xl font-black text-slate-900">{copy('ငွေစာရင်း', 'Money in and out')}</h2>
                            <div className="mt-5 space-y-3">
                                <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-base text-emerald-800">{copy('အတည်ပြုပြီး အလှူ', 'Approved donations')}</p><p className="mt-1 text-2xl font-black">{showMoney(financialSummary.total_received)}</p></div>
                                <div className="rounded-2xl bg-amber-50 p-4"><p className="text-base text-amber-800">{copy('ကုန်ကျစရိတ်', 'Expenses')}</p><p className="mt-1 text-2xl font-black">{showMoney(financialSummary.total_spent)}</p></div>
                                <div className="rounded-2xl bg-slate-50 p-4"><p className="text-base text-slate-700">{copy('လက်ကျန်', 'Balance')}</p><p className="mt-1 text-2xl font-black">{showBalance}</p>{balanceSentence && <p className="mt-2 text-base leading-relaxed text-slate-700">{balanceSentence}</p>}</div>
                            </div>
                            <Link href={route('impact')} className="mt-5 inline-flex text-base font-semibold text-emerald-700">{copy('အသေးစိတ်ကြည့်ရန်', 'See the impact page')} <BadgeCheck className="ml-2 h-4 w-4" /></Link>
                        </div>
                    </section>

                    <section className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <h2 className="text-2xl font-black text-slate-900">{copy('လမ်းဘေးမှာ တွေ့ရင် ပြောပြပါ', 'Tell us when you see someone who needs help')}</h2>
                        <p className="mt-3 max-w-2xl text-lg text-slate-600">{copy('မြို့နယ်၊ နေရာ၊ ဓာတ်ပုံတစ်ပုံနဲ့ ဖုန်းနံပါတ်ပဲ လိုပါတယ်။', 'A township, a place, one photo, and a phone number are enough.')}</p>
                        <Link href={route('community')} className="mt-6 inline-flex rounded-full bg-[#065F46] px-6 py-4 text-lg font-bold text-white">{copy('သတင်းပေးရန်', 'Send a report')}</Link>
                    </section>
                </main>
                {selectedTrip && (
                    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
                        <div className="w-full max-w-lg rounded-3xl bg-white p-6">
                            <p className="text-2xl font-black text-slate-900">{selectedTrip.township}</p>
                            <p className="mt-2 text-base text-slate-600">{formatDisplayDate(selectedTrip.trip_date, lang)} · {selectedTrip.elderly_helped_count} {copy('ဦး', 'elders')}</p>
                            {storyNote(selectedTrip.summary_note) && <p className="mt-4 text-base leading-relaxed text-slate-700">{storyNote(selectedTrip.summary_note)}</p>}
                            <button type="button" onClick={() => setSelectedTrip(null)} className="mt-6 rounded-full bg-[#F59E0B] px-5 py-3 text-base font-bold text-[#065F46]">{copy('ပိတ်ရန်', 'Close')}</button>
                        </div>
                    </div>
                )}
            </PublicLayout>
        </>
    );
}
