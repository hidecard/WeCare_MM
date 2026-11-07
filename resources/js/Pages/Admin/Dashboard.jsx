import { Head, Link } from '@inertiajs/react';
import { BarChart3, ChevronRight, FileText, List, MapPinned, ShieldAlert, Users } from 'lucide-react';
import AdminLayout from '../../Layouts/AdminLayout';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

const formatDateTime = (value) => {
    if (!value) return '—';
    const safeValue = typeof value === 'string' && value.includes('T') ? value : `${value}T12:00:00`;
    const parsed = new Date(safeValue);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(parsed);
};

export default function Dashboard({ pendingDonations = [], spotReports = [], fundPools = [], recentTrips = [], tripSummary = {} }) {
    const galleryImages = recentTrips.flatMap((trip) => (Array.isArray(trip?.photos_json) ? trip.photos_json.filter((p) => typeof p === 'string' && p.trim()).slice(0, 3) : [])).slice(0, 12);
    const metricCards = [
        { label: 'Pending slips', value: String(pendingDonations.length), tone: 'amber', icon: ShieldAlert },
        { label: 'Trips logged', value: String(tripSummary.total_trips ?? 0), tone: 'emerald', icon: MapPinned },
        { label: 'Elders served', value: String(tripSummary.total_elderly ?? 0), tone: 'sky', icon: Users },
        { label: 'Active pools', value: String(fundPools.length), tone: 'violet', icon: BarChart3 },
    ];
    const tone = (t) => (t === 'amber' ? 'bg-amber-100 text-amber-700' : t === 'emerald' ? 'bg-emerald-100 text-emerald-700' : t === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700');

    return (
        <AdminLayout title="Admin Dashboard" subtitle="Field admin" heading="Volunteer Response Dashboard" actions={<Link href={route('admin.management')} className="rounded-full bg-[#F59E0B] px-3 py-2 text-xs font-bold text-[#065F46] transition hover:bg-amber-400 sm:px-4 sm:text-sm">Management</Link>}>
            <section className="rounded-3xl bg-gradient-to-r from-[#065F46] via-[#0d7b61] to-[#0f766e] p-5 text-white shadow-xl md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div><p className="text-[10px] uppercase tracking-[0.28em] text-emerald-100">Operations overview</p><h2 className="mt-1 text-2xl font-black md:text-3xl">Street outreach command center</h2></div>
                    <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />Live operations</div>
                </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map(({ label, value, tone: t, icon: Icon }) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className={`inline-flex rounded-xl p-2 ${tone(t)}`}><Icon className="h-4 w-4" /></span><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Today</span></div><div className="mt-4"><p className="text-3xl font-black text-slate-900">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div></div>
                ))}
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Operations</p><h3 className="mt-1 text-xl font-black text-slate-900">Admin modules</h3></div><Link href={route('admin.management')} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">Open all</Link></div>
                    <div className="space-y-3">
                        {[{ name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert, count: pendingDonations.length, t: 'amber' }, { name: 'Donation List', href: route('admin.donations.list'), icon: List, count: 'All', t: 'violet' }, { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned, count: tripSummary.total_trips ?? 0, t: 'emerald' }, { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText, count: spotReports.length, t: 'sky' }].map(({ name, href, icon: Icon, count, t }) => (
                            <Link key={name} href={href} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50"><div className="flex items-center gap-3"><span className={`inline-flex rounded-xl p-2 ${tone(t)}`}><Icon className="h-4 w-4" /></span><div><p className="text-sm font-bold text-slate-800">{name}</p><p className="text-xs text-slate-500">Review and follow up</p></div></div><div className="flex items-center gap-3"><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">{count}</span><ChevronRight className="h-4 w-4 text-slate-400" /></div></Link>
                        ))}
                    </div>
                </section>
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Funds</p><h3 className="mt-1 text-xl font-black text-slate-900">Pool activity</h3>
                    <div className="mt-4 space-y-3">{fundPools.map((pool) => (<div key={pool.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-slate-800">{pool.title_mm || pool.title_en}</p><p className="text-xs text-slate-500">{pool.title_en}</p></div><span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">{currency.format(Number(pool.unit_cost) || 0)}</span></div><div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>Raised</span><span className="font-bold text-emerald-700">{currency.format(Number(pool.total_raised) || 0)}</span></div></div>))}{fundPools.length === 0 && <p className="text-sm text-slate-500">No fund pools yet.</p>}</div>
                </section>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Donation list</p><h3 className="mt-1 text-xl font-black text-slate-900">Pending donation slips</h3></div><Link href={route('admin.donations.index')} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">Open review</Link></div>
                {pendingDonations.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No pending donation slips.</div> : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-3 py-3 font-semibold">Donor</th><th className="px-3 py-3 font-semibold">Pool</th><th className="px-3 py-3 font-semibold">Amount</th><th className="px-3 py-3 font-semibold">Method</th><th className="px-3 py-3 font-semibold">Date</th></tr></thead><tbody>{pendingDonations.slice(0, 5).map((d) => (<tr key={d.id} className="border-t border-slate-200 bg-white"><td className="px-3 py-3 font-medium text-slate-800">{d.is_anonymous ? 'Anonymous donor' : (d.donor_name || 'Anonymous donor')}</td><td className="px-3 py-3 text-slate-600">{d.fund_pool?.title_mm || d.fund_pool?.title_en || 'General fund'}</td><td className="px-3 py-3 font-bold text-emerald-700">{currency.format(Number(d.amount || 0))}</td><td className="px-3 py-3 text-slate-600">{d.payment_method}</td><td className="px-3 py-3 text-slate-500">{formatDateTime(d.created_at)}</td></tr>))}</tbody></table></div>
                )}
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <section className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-amber-700">Reports</p><h3 className="mt-1 text-xl font-black text-slate-900">Recent spot reports</h3></div><Link href={route('admin.reports.index')} className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700">View all</Link></div>
                    <div className="space-y-3">{spotReports.length === 0 ? <div className="rounded-2xl border border-dashed border-amber-300 bg-white/60 p-4 text-sm text-slate-500">No recent spot reports.</div> : spotReports.map((r) => (<div key={r.id} className="rounded-2xl border border-amber-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-slate-900">{r.township}</p><span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">{r.status}</span></div><p className="mt-2 text-sm text-slate-600">{r.condition_note}</p><div className="mt-2 flex items-center justify-between text-xs text-slate-500"><span>{r.street_landmark}</span><span>{formatDateTime(r.time_seen)}</span></div></div>))}</div>
                </section>
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Gallery</p><h3 className="mt-1 text-xl font-black text-slate-900">Recent trip photos</h3>
                    {galleryImages.length > 0 ? <div className="mt-4 grid grid-cols-3 gap-2">{galleryImages.map((photo, i) => <img key={`${photo}-${i}`} src={photo.startsWith('http') ? photo : `/storage/${photo}`} alt={`Trip photo ${i + 1}`} className="h-20 w-full rounded-xl object-cover ring-1 ring-slate-200" loading="lazy" />)}</div> : <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No trip photos uploaded yet.</div>}
                </section>
            </div>
        </AdminLayout>
    );
}
