import { Link } from '@inertiajs/react';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPinned, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';
import { formatDisplayDate } from '../lib/formatDisplayDate';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

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
                    className={`rounded-full border px-4 py-2 text-base font-semibold transition ${currentPage === pageNumber ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'}`}
                >
                    {pageNumber}
                </button>
            ))}
        </div>
    );
};

export default function Outreach({ recentTrips = [] }) {
    const [lang, setLang] = useLanguage();
    const [tripPage, setTripPage] = useState(1);
    const [selectedTownship, setSelectedTownship] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [viewer, setViewer] = useState(null);
    const photoUrl = (photo) => (String(photo).startsWith('http') ? photo : `/storage/${photo}`);
    const townships = [...new Set((recentTrips ?? []).map((trip) => trip.township).filter(Boolean))].sort();
    const filteredTrips = (recentTrips ?? []).filter((trip) => {
        const townshipMatches = selectedTownship === 'all' || trip.township === selectedTownship;
        const monthMatches = !selectedMonth || String(trip.trip_date ?? '').startsWith(selectedMonth);
        return townshipMatches && monthMatches;
    });
    const tripPageSize = 6;
    const tripPageCount = Math.max(1, Math.ceil((filteredTrips.length ?? 0) / tripPageSize));
    const tripPageStart = (tripPage - 1) * tripPageSize;
    const visibleTrips = filteredTrips.slice(tripPageStart, tripPageStart + tripPageSize);

    return (
        <>
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
                        <p className="mt-3 max-w-2xl text-base leading-relaxed text-emerald-50">{lang === 'my' ? 'ကွင်းဆင်းမှတ်တမ်းနဲ့ ဓာတ်ပုံအစစ်တွေကို ဒီမှာ ကြည့်နိုင်ပါတယ်။' : 'See the real outreach records and photos here.'}</p>
                        <Link href={route('donate')} className="mt-6 inline-flex rounded-full bg-[#F59E0B] px-6 py-4 text-lg font-bold text-[#065F46] hover:bg-amber-400">{lang === 'my' ? 'ဒီခရီးတွေအတွက် လှူမည်' : 'Donate for these trips'}</Link>
                    </section>

                    <section className="mt-6 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5" aria-label={lang === 'my' ? 'စစ်ထုတ်ရန်' : 'Filter outreach activity'}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <label htmlFor="outreach-township" className="flex-1 text-base font-semibold text-slate-700">{lang === 'my' ? 'မြို့နယ်ဖြင့် စစ်ထုတ်ရန်' : 'Filter by township'}
                                <select id="outreach-township" value={selectedTownship} onChange={(event) => { setSelectedTownship(event.target.value); setTripPage(1); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-normal text-slate-800">
                                    <option value="all">{lang === 'my' ? 'မြို့နယ်အားလုံး' : 'All townships'}</option>
                                    {townships.map((township) => <option key={township} value={township}>{township}</option>)}
                                </select>
                            </label>
                            <label htmlFor="outreach-month" className="flex-1 text-base font-semibold text-slate-700">{lang === 'my' ? 'လအလိုက် စစ်ထုတ်ရန်' : 'Filter by month'}
                                <input id="outreach-month" type="month" value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setTripPage(1); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-normal text-slate-800" />
                            </label>
                            {(selectedTownship !== 'all' || selectedMonth) && <button type="button" onClick={() => { setSelectedTownship('all'); setSelectedMonth(''); setTripPage(1); }} className="rounded-full border border-slate-200 px-4 py-3 text-base font-semibold text-slate-600 hover:bg-slate-50">{lang === 'my' ? 'ပြန်ရှင်းရန်' : 'Clear filters'}</button>}
                        </div>
                    </section>

                    <div className="mt-8 grid gap-5">
                        {visibleTrips.map((trip) => {
                            const tripPhotos = Array.isArray(trip.photos_json)
                                ? trip.photos_json.filter((photo) => typeof photo === 'string' && photo.trim())
                                : [];
                            const note = String(trip.summary_note || '').trim();
                            const showNote = note && (lang !== 'my' || /[\u1000-\u109F]/.test(note));
                            const spent = Number(trip.ledger_spent ?? trip.total_spent) || 0;

                            return (
                                <article key={trip.id} className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100">
                                    {tripPhotos.length === 0 ? (
                                        <div className="flex h-40 items-center justify-center bg-emerald-50 text-base text-emerald-800">
                                            {lang === 'my' ? 'ဓာတ်ပုံ မရှိသေးပါ' : 'No photo yet'}
                                        </div>
                                    ) : (
                                        <div className={`grid gap-1 ${tripPhotos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                            {tripPhotos.map((photo, index) => (
                                                <button
                                                    key={`${trip.id}-${photo}`}
                                                    type="button"
                                                    onClick={() => setViewer({ photos: tripPhotos, index, township: trip.township })}
                                                    className={`overflow-hidden bg-slate-100 ${tripPhotos.length > 2 && index === 0 ? 'col-span-2' : ''}`}
                                                >
                                                    <img src={photoUrl(photo)} alt={trip.township} className={`w-full object-cover ${tripPhotos.length === 1 ? 'h-80' : index === 0 && tripPhotos.length > 2 ? 'h-72' : 'h-44'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center justify-between gap-3 text-emerald-700">
                                            <div className="flex items-center gap-2">
                                                <MapPinned className="h-4 w-4" />
                                                <p className="text-base font-semibold">{trip.township}</p>
                                            </div>
                                            <p className="text-base text-slate-500">{tripPhotos.length > 0 ? (lang === 'my' ? `ဓာတ်ပုံ ${tripPhotos.length} ပုံ` : `${tripPhotos.length} photo${tripPhotos.length === 1 ? '' : 's'}`) : ''}</p>
                                        </div>
                                        <h2 className="mt-2 text-2xl font-black text-slate-900">{formatDisplayDate(trip.trip_date, lang)}</h2>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-2xl bg-slate-50 p-4">
                                                <p className="text-base text-slate-600">{lang === 'my' ? 'ကူညီခဲ့သူ' : 'People helped'}</p>
                                                <p className="mt-1 text-2xl font-black text-slate-900">{trip.elderly_helped_count} {lang === 'my' ? 'ဦး' : 'elders'}</p>
                                            </div>
                                            <div className="rounded-2xl bg-amber-50 p-4">
                                                <p className="text-base text-amber-800">{lang === 'my' ? 'ဒီခရီးအတွက် သုံးခဲ့သော ငွေ' : 'Spent on this trip'}</p>
                                                <p className="mt-1 text-2xl font-black text-slate-900">{spent > 0 ? currency.format(spent) : (lang === 'my' ? 'စတင်မှတ်တမ်းတင်နေဆဲ' : 'Starting to record')}</p>
                                            </div>
                                        </div>
                                        {showNote && <p className="mt-4 text-base leading-relaxed text-slate-700">{note}</p>}
                                    </div>
                                </article>
                            );
                        })}
                        {visibleTrips.length === 0 && <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-10 text-center text-base text-slate-500">{lang === 'my' ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် ကွင်းဆင်းမှတ်တမ်း မရှိသေးပါ။' : 'No outreach activity matches these filters yet.'}</div>}
                    </div>

                    {renderPagination(tripPageCount, tripPage, setTripPage)}

                    {viewer && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4" onClick={() => setViewer(null)}>
                            <div className="w-full max-w-4xl" onClick={(event) => event.stopPropagation()}>
                                <img src={photoUrl(viewer.photos[viewer.index])} alt={viewer.township} className="max-h-[75vh] w-full rounded-3xl bg-black object-contain" />
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-white">
                                    <p className="text-base font-semibold">{viewer.township} · {viewer.index + 1} / {viewer.photos.length}</p>
                                    <div className="flex gap-2">
                                        <button type="button" disabled={viewer.index === 0} onClick={() => setViewer({ ...viewer, index: viewer.index - 1 })} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-base font-semibold text-slate-900 disabled:opacity-40"><ChevronLeft className="h-4 w-4" />{lang === 'my' ? 'ရှေ့' : 'Previous'}</button>
                                        <button type="button" disabled={viewer.index === viewer.photos.length - 1} onClick={() => setViewer({ ...viewer, index: viewer.index + 1 })} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-base font-semibold text-slate-900 disabled:opacity-40">{lang === 'my' ? 'နောက်' : 'Next'}<ChevronRight className="h-4 w-4" /></button>
                                        <button type="button" onClick={() => setViewer(null)} className="inline-flex items-center gap-1 rounded-full bg-[#F59E0B] px-4 py-2 text-base font-bold text-[#065F46]"><X className="h-4 w-4" />{lang === 'my' ? 'ပိတ်ရန်' : 'Close'}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-10 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center gap-2 text-emerald-700"><ShieldCheck className="h-5 w-5" /> <p className="font-bold">{lang === 'my' ? 'အာမခံလွယ်ကူစွာ' : 'Privacy safe and direct'}</p></div>
                        <p className="mt-3 text-base text-slate-700">{lang === 'my' ? 'သက်ဆိုင်သူအမည်တွေကို မဖော်ပြဘဲ ဂုဏ်သိက္ခာရှိအောင် တင်ထားပါတယ်။' : 'Personal names stay private. These records show pooled, direct support.'}</p>
                    </div>
                </main>
            </PublicLayout>
        </>
    );
}
