import { Head, Link } from '@inertiajs/react';
import { BarChart3, ChevronLeft, ChevronRight, CreditCard, FileText, HeartHandshake, LayoutDashboard, List, MapPinned, Menu, ShieldAlert, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

const formatDateTime = (value) => {
    if (!value) return '—';

    const safeValue = typeof value === 'string' && value.includes('T') ? value : `${value}T12:00:00`;
    const parsed = new Date(safeValue);

    if (Number.isNaN(parsed.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(parsed);
};

export default function Dashboard({ pendingDonations = [], spotReports = [], fundPools = [], recentTrips = [], tripSummary = {} }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const galleryImages = recentTrips.flatMap((trip) => {
        if (!Array.isArray(trip?.photos_json)) {
            return [];
        }

        return trip.photos_json.filter((photo) => typeof photo === 'string' && photo.trim()).slice(0, 3);
    }).slice(0, 12);

    const navItems = [
        { name: 'Overview', href: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert },
        { name: 'Donation List', href: route('admin.donations.list'), icon: List },
        { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned },
        { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText },
        { name: 'Fund Pools', href: route('admin.fund-pools.index'), icon: BarChart3 },
        { name: 'Volunteers', href: route('admin.volunteers.index'), icon: Users },
        { name: 'Payment Methods', href: route('admin.payment-methods.index'), icon: CreditCard },
    ];

    const metricCards = [
        { label: 'Pending slips', value: String(pendingDonations.length), tone: 'amber', icon: ShieldAlert },
        { label: 'Trips logged', value: String(tripSummary.total_trips ?? 0), tone: 'emerald', icon: MapPinned },
        { label: 'Elders served', value: String(tripSummary.total_elderly ?? 0), tone: 'sky', icon: Users },
        { label: 'Active pools', value: String(fundPools.length), tone: 'violet', icon: BarChart3 },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="min-h-screen bg-slate-100 text-slate-800">
                <div className="flex min-h-screen">
                    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-emerald-900/10 bg-[#0b3b2f] p-4 text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <Link href={route('home')} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F59E0B] text-[#065F46] shadow-lg shadow-amber-900/20 transition hover:scale-[1.02]">
                                    <HeartHandshake className="h-5 w-5" />
                                </Link>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-200">WeCare</p>
                                    <h2 className="mt-1 text-xl font-black">Admin Panel</h2>
                                </div>
                            </div>
                            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-full border border-white/15 p-2 md:hidden">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="mt-6 space-y-2">
                            {navItems.map(({ name, href, icon: Icon }) => (
                                <Link
                                    key={name}
                                    href={href}
                                    className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium transition ${href === route('admin.dashboard') ? 'border-emerald-300/30 bg-emerald-500/15 text-white shadow-inner shadow-emerald-900/20' : 'border-white/10 bg-white/5 text-emerald-50/80 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className="h-4 w-4" />
                                        {name}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-emerald-200" />
                                </Link>
                            ))}
                        </nav>

                        <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-50 shadow-lg shadow-amber-950/10">
                            <div className="flex items-center gap-2 font-semibold">
                                <ShieldCheck className="h-4 w-4" />
                                Private operations panel
                            </div>
                            <p className="mt-2 text-xs text-emerald-100">Field team and donation oversight</p>
                        </div>
                    </aside>

                    <div className="flex-1">
                        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
                            <div className="flex items-center justify-between px-4 py-4 md:px-8">
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 md:hidden">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Field admin</p>
                                        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Volunteer Response Dashboard</h1>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={route('home')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">Home</Link>
                                    <Link href={route('admin.management')} className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#065F46] shadow-sm transition hover:bg-amber-400">Management</Link>
                                    <Link href={route('logout')} method="post" as="button" className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100">Log Out</Link>
                                </div>
                            </div>
                        </header>

                        <main className="p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl space-y-6">
                                <section className="rounded-3xl bg-gradient-to-r from-[#065F46] via-[#0d7b61] to-[#0f766e] p-5 text-white shadow-xl shadow-emerald-900/15 md:p-6">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-100">Operations overview</p>
                                            <h2 className="mt-2 text-2xl font-black md:text-3xl">Street outreach command center</h2>
                                        </div>
                                        <div className="flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold text-emerald-50">
                                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
                                            Live operations
                                        </div>
                                    </div>
                                </section>

                                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {metricCards.map(({ label, value, tone, icon: Icon }) => (
                                        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <span className={`inline-flex rounded-xl p-2 ${tone === 'amber' ? 'bg-amber-100 text-amber-700' : tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' : tone === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'}`}>
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Today</span>
                                            </div>
                                            <div className="mt-5">
                                                <p className="text-3xl font-black text-slate-900">{value}</p>
                                                <p className="mt-1 text-sm text-slate-500">{label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </section>

                                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Operations</p>
                                                <h3 className="mt-1 text-xl font-black text-slate-900">Admin modules</h3>
                                            </div>
                                            <Link href={route('admin.management')} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">Open all</Link>
                                        </div>

                                        <div className="space-y-3">
                                            {[{ name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert, count: pendingDonations.length, accent: 'amber' }, { name: 'Donation List', href: route('admin.donations.list'), icon: List, count: 'All', accent: 'violet' }, { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned, count: tripSummary.total_trips ?? 0, accent: 'emerald' }, { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText, count: spotReports.length, accent: 'sky' }].map(({ name, href, icon: Icon, count, accent }) => (
                                                <Link key={name} href={href} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/50">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`inline-flex rounded-xl p-2 ${accent === 'amber' ? 'bg-amber-100 text-amber-700' : accent === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                                                            <Icon className="h-4 w-4" />
                                                        </span>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{name}</p>
                                                            <p className="text-xs text-slate-500">Review and follow up</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-sm">{count}</span>
                                                        <ChevronRight className="h-4 w-4 text-slate-400" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Funds</p>
                                                <h3 className="mt-1 text-xl font-black text-slate-900">Pool activity</h3>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {fundPools.map((pool) => (
                                                <div key={pool.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-800">{pool.title_mm || pool.title_en}</p>
                                                            <p className="text-xs text-slate-500">{pool.title_en}</p>
                                                        </div>
                                                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">{currency.format(Number(pool.unit_cost) || 0)}</span>
                                                    </div>
                                                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                                        <span>Raised</span>
                                                        <span className="font-bold text-emerald-700">{currency.format(Number(pool.total_raised) || 0)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Donation list</p>
                                            <h3 className="mt-1 text-xl font-black text-slate-900">Pending donation slips</h3>
                                        </div>
                                        <Link href={route('admin.donations.index')} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">Open review</Link>
                                    </div>

                                    {pendingDonations.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No pending donation slips.</div>
                                    ) : (
                                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                                            <table className="min-w-full text-left text-sm">
                                                <thead className="bg-slate-50 text-slate-600">
                                                    <tr>
                                                        <th className="px-3 py-3 font-semibold">Donor</th>
                                                        <th className="px-3 py-3 font-semibold">Pool</th>
                                                        <th className="px-3 py-3 font-semibold">Amount</th>
                                                        <th className="px-3 py-3 font-semibold">Method</th>
                                                        <th className="px-3 py-3 font-semibold">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingDonations.slice(0, 5).map((donation) => (
                                                        <tr key={donation.id} className="border-t border-slate-200 bg-white">
                                                            <td className="px-3 py-3 font-medium text-slate-800">{donation.is_anonymous ? 'Anonymous donor' : (donation.donor_name || 'Anonymous donor')}</td>
                                                            <td className="px-3 py-3 text-slate-600">{donation.fund_pool?.title_mm || donation.fund_pool?.title_en || 'General fund'}</td>
                                                            <td className="px-3 py-3 font-bold text-emerald-700">{currency.format(Number(donation.amount || 0))}</td>
                                                            <td className="px-3 py-3 text-slate-600">{donation.payment_method}</td>
                                                            <td className="px-3 py-3 text-slate-500">{formatDateTime(donation.created_at)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </section>

                                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                                    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-amber-700">Reports</p>
                                                <h3 className="mt-1 text-xl font-black text-slate-900">Recent spot reports</h3>
                                            </div>
                                            <Link href={route('admin.reports.index')} className="rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700">View all</Link>
                                        </div>

                                        <div className="space-y-3">
                                            {spotReports.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed border-amber-300 bg-white/60 p-4 text-sm text-slate-500">No recent spot reports.</div>
                                            ) : spotReports.map((report) => (
                                                <div key={report.id} className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <p className="text-sm font-bold text-slate-900">{report.township}</p>
                                                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">{report.status}</span>
                                                    </div>
                                                    <p className="mt-3 text-sm text-slate-600">{report.condition_note}</p>
                                                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                                        <span>{report.street_landmark}</span>
                                                        <span>{formatDateTime(report.time_seen)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Gallery</p>
                                                <h3 className="mt-1 text-xl font-black text-slate-900">Recent trip photos</h3>
                                            </div>
                                        </div>

                                        {galleryImages.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-2">
                                                {galleryImages.map((photo, index) => (
                                                    <img
                                                        key={`${photo}-${index}`}
                                                        src={photo.startsWith('http') ? photo : `/storage/${photo}`}
                                                        alt={`Recent trip photo ${index + 1}`}
                                                        className="h-20 w-full rounded-xl object-cover ring-1 ring-slate-200"
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No trip photos uploaded yet.</div>
                                        )}
                                    </section>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                                    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Accountability</p>
                                                <h3 className="mt-1 text-xl font-black text-slate-900">Health snapshot</h3>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                <div className="flex items-center justify-between text-sm text-slate-500">
                                                    <span>Pending slips</span>
                                                    <span className="font-bold text-slate-900">{pendingDonations.length}</span>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                <div className="flex items-center justify-between text-sm text-slate-500">
                                                    <span>Trips this cycle</span>
                                                    <span className="font-bold text-slate-900">{tripSummary.total_trips ?? 0}</span>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                <div className="flex items-center justify-between text-sm text-slate-500">
                                                    <span>Support spent</span>
                                                    <span className="font-bold text-slate-900">{currency.format(Number(tripSummary.total_spent ?? 0))}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
