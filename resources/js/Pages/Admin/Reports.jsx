import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, ChevronLeft, ChevronRight, FileText, LayoutDashboard, MapPinned, Menu, ShieldAlert, Users } from 'lucide-react';
import { useState } from 'react';

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

const renderPagination = (pagination, onPageChange) => {
    if (!pagination || !Array.isArray(pagination.links) || pagination.links.length <= 0) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {pagination.links.map((link, index) => (
                <button
                    key={`${link.label || 'page'}-${index}`}
                    type="button"
                    onClick={() => onPageChange(link.url)}
                    disabled={!link.url}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${link.active ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                    {link.label.replace('&laquo;', '').replace('&raquo;', '')}
                </button>
            ))}
        </div>
    );
};

export default function Reports({ spotReports = [] }) {
    const normalizedReports = Array.isArray(spotReports) ? { data: spotReports, links: [] } : (spotReports ?? {});
    const reports = normalizedReports.data ?? [];
    const pagination = normalizedReports;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navItems = [
        { name: 'Overview', href: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert },
        { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned },
        { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText },
        { name: 'Fund Pools', href: route('admin.fund-pools.index'), icon: BarChart3 },
        { name: 'Volunteers', href: route('admin.volunteers.index'), icon: Users },
    ];

    const statusStyles = {
        unread: 'bg-slate-100 text-slate-700',
        checked: 'bg-amber-100 text-amber-700',
        resolved: 'bg-emerald-100 text-emerald-700',
    };

    const handlePageChange = (pageUrl) => {
        if (!pageUrl) return;
        router.get(pageUrl, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Spot Reports" />
            <div className="min-h-screen bg-slate-100 text-slate-800">
                <div className="flex min-h-screen">
                    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-emerald-900/10 bg-[#0b3b2f] p-4 text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-200">WeCare</p>
                                <h2 className="mt-2 text-xl font-black">Admin</h2>
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
                                    className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium transition ${href === route('admin.reports.index') ? 'border-emerald-300/30 bg-emerald-500/15 text-white shadow-inner shadow-emerald-900/20' : 'border-white/10 bg-white/5 text-emerald-50/80 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon className="h-4 w-4" />
                                        {name}
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-emerald-200" />
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    <div className="flex-1">
                        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
                            <div className="flex items-center justify-between px-4 py-4 md:px-8">
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 md:hidden">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Private</p>
                                        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Spot reports</h1>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={route('admin.dashboard')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">Dashboard</Link>
                                    <Link href={route('home')} className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#065F46] shadow-sm transition hover:bg-amber-400">Home</Link>
                                </div>
                            </div>
                        </header>

                        <main className="p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl">
                                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Private field reports</p>
                                            <h2 className="mt-1 text-2xl font-black text-slate-900">Citizen spot reports</h2>
                                        </div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                                            <FileText className="h-4 w-4" />
                                            {reports.length} entries
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="min-w-full text-left">
                                            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Township</th>
                                                    <th className="px-4 py-3 font-semibold">Landmark</th>
                                                    <th className="px-4 py-3 font-semibold">Condition</th>
                                                    <th className="px-4 py-3 font-semibold">Seen</th>
                                                    <th className="px-4 py-3 font-semibold">Reporter</th>
                                                    <th className="px-4 py-3 font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                                                {reports.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-5 py-8 text-center text-sm text-slate-500">No confidential reports yet.</td>
                                                    </tr>
                                                ) : reports.map((report) => (
                                                    <tr key={report.id} className="hover:bg-slate-50/80">
                                                        <td className="px-4 py-3 font-semibold text-slate-900">{report.township}</td>
                                                        <td className="px-4 py-3">{report.street_landmark}</td>
                                                        <td className="px-4 py-3">{report.condition_note}</td>
                                                        <td className="px-4 py-3">{formatDateTime(report.time_seen)}</td>
                                                        <td className="px-4 py-3">{report.reporter_phone || 'Anonymous'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyles[report.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                                                {report.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {renderPagination(pagination, handlePageChange)}
                                </section>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
