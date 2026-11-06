import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MapPinned, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../Components/PublicLayout';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const fallbackTripPhotos = [
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
];

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

const renderPagination = (pageCount, currentPage, onPageChange) => {
    if (pageCount <= 1) {
        return null;
    }

    return (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => (
                <button
                    key={pageNumber}
                    type="button"
                    onClick={() => onPageChange(pageNumber)}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${currentPage === pageNumber ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'}`}
                >
                    {pageNumber}
                </button>
            ))}
        </div>
    );
};

export default function Outreach({ recentTrips = [] }) {
    const [lang, setLang] = useState('my');
    const [tripPage, setTripPage] = useState(1);
    const tripPageSize = 6;
    const tripPageCount = Math.max(1, Math.ceil((recentTrips?.length ?? 0) / tripPageSize));
    const tripPageStart = (tripPage - 1) * tripPageSize;
    const visibleTrips = (recentTrips ?? []).slice(tripPageStart, tripPageStart + tripPageSize);

    return (
        <>
            <Head title={lang === 'my' ? 'လမ်းဘေးစစ်ဆင်မှု' : 'Outreach'} />
            <PublicLayout active="outreach" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-3">
                        <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                            <ArrowLeft className="h-4 w-4" /> {lang === 'my' ? 'မူလသို့' : 'Back home'}
                        </Link>
                    </div>

                    <section className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{lang === 'my' ? 'လမ်းဘေးသွားလာမှု' : 'Street outreach'}</p>
                        <h1 className="mt-2 text-3xl font-black md:text-4xl">{lang === 'my' ? 'မြို့နယ်အလိုက် အကူအညီပေးသွားမှု' : 'Direct support across townships'}</h1>
                    </section>

                    <div className="mt-8 grid gap-5">
                        {visibleTrips.map((trip) => {
                            const tripPhotos = Array.isArray(trip.photos_json)
                                ? trip.photos_json.filter((photo) => typeof photo === 'string' && photo.trim())
                                : [];
                            const galleryImages = tripPhotos.length > 0 ? tripPhotos : fallbackTripPhotos;

                            return (
                                <article key={trip.id} className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 text-emerald-700">
                                                <MapPinned className="h-4 w-4" />
                                                <p className="text-sm font-semibold uppercase tracking-[0.2em]">{trip.township}</p>
                                            </div>
                                            <h2 className="mt-2 text-2xl font-black text-slate-900">{formatDisplayDate(trip.trip_date)}</h2>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                                                <p className="text-lg font-black text-slate-900">{trip.elderly_helped_count}</p>
                                                <p className="text-xs text-slate-500">{lang === 'my' ? 'အသက်ကြီးသူ' : 'elders'}</p>
                                            </div>
                                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                                                <p className="text-lg font-black text-slate-900">{trip.meals_distributed}</p>
                                                <p className="text-xs text-slate-500">{lang === 'my' ? 'အစားအစာ' : 'meals'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {galleryImages.length > 0 ? (
                                        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                            {galleryImages.slice(0, 6).map((photo, index) => {
                                                const photoUrl = photo.startsWith('http') ? photo : `/storage/${photo}`;

                                                return (
                                                    <img
                                                        key={`${trip.id}-${index}`}
                                                        src={photoUrl}
                                                        alt={`${trip.township} outreach ${index + 1}`}
                                                        className="h-48 w-full rounded-2xl object-cover shadow-sm ring-1 ring-slate-200"
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                                            {lang === 'my' ? 'ဓာတ်ပုံများ မရရှိသေးပါ' : 'No photos available for this outreach trip yet.'}
                                        </div>
                                    )}

                                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                                        <div className="rounded-2xl bg-emerald-50 p-4">
                                            <p className="text-sm text-emerald-700">{lang === 'my' ? 'ဆေးဝါးကူညီမှု' : 'Medical aid'}</p>
                                            <p className="mt-2 text-2xl font-black text-slate-900">{trip.medical_aid_count}</p>
                                        </div>
                                        <div className="rounded-2xl bg-amber-50 p-4">
                                            <p className="text-sm text-amber-700">{lang === 'my' ? 'ကုန်ကျစရိတ်' : 'Total spent'}</p>
                                            <p className="mt-2 text-2xl font-black text-slate-900">{currency.format(Number(trip.total_spent ?? 0))}</p>
                                        </div>
                                        <div className="rounded-2xl bg-slate-100 p-4">
                                            <p className="text-sm text-slate-700">{lang === 'my' ? 'အကျိုးသက်ရောက်မှု' : 'Summary'}</p>
                                            <p className="mt-2 text-sm text-slate-700">{trip.summary_note || (lang === 'my' ? 'အကျိုးသက်ရောက်မှုကို အချက်အလက်ပေးနေပါသည်။' : 'Support was delivered directly to vulnerable elders in need.')}</p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {renderPagination(tripPageCount, tripPage, setTripPage)}

                    <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center gap-2 text-emerald-700"><ShieldCheck className="h-5 w-5" /> <p className="font-bold">{lang === 'my' ? 'အာမခံလွယ်ကူစွာ' : 'Privacy safe and direct'}</p></div>
                        <p className="mt-3 text-slate-700">{lang === 'my' ? 'အကယ်၍ သက်ဆိုင်သူအချက်အလက်များကို မဖော်ပြဘဲ ဂုဏ်သိက္ခာအရ တင်ပေးထားပါသည်။' : 'No personal beneficiary records are stored; the program focuses on pooled support and direct outreach.'}</p>
                    </div>
                </main>
            </PublicLayout>
        </>
    );
}
