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

const ReportCard = ({ report, draft, statusStyles, onUpdate, onSave }) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
            <div><p className="font-bold text-slate-900">{report.township}</p><p className="mt-1 text-xs text-slate-500">{formatDateTime(report.time_seen)}</p></div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyles[draft.status] ?? 'bg-slate-100 text-slate-700'}`}>{draft.status}</span>
        </div>
        <div className="mt-4 space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-500">Landmark:</span> {report.street_landmark}</p>
            <p><span className="font-semibold text-slate-500">Condition:</span> {report.condition_note}</p>
            <p><span className="font-semibold text-slate-500">Reporter:</span> {report.reporter_phone || 'Anonymous'}</p>
        </div>
        <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
            <div className="grid grid-cols-2 gap-2">
                <select aria-label="Report status" value={draft.status} onChange={(event) => onUpdate('status', event.target.value)} className={`rounded-full border-0 px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyles[draft.status] ?? 'bg-slate-100 text-slate-700'}`}>{['unread', 'checked', 'in_progress', 'resolved'].map((status) => <option key={status} value={status}>{status}</option>)}</select>
                <select aria-label="Report urgency" value={draft.urgency} onChange={(event) => onUpdate('urgency', event.target.value)} className="rounded-full border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">{['low', 'normal', 'high', 'urgent'].map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}</select>
            </div>
            <input aria-label="Assigned to" value={draft.assigned_to} onChange={(event) => onUpdate('assigned_to', event.target.value)} placeholder="Assigned to" className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs" />
            <textarea aria-label="Follow-up note" value={draft.follow_up_note} onChange={(event) => onUpdate('follow_up_note', event.target.value)} placeholder="Follow-up note" rows="2" className="w-full rounded-lg border border-slate-200 px-2 py-2 text-xs" />
            <button type="button" onClick={onSave} className="w-full rounded-full bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Save workflow</button>
        </div>
    </article>
);

export default function Reports({ spotReports = [] }) {
    const normalizedReports = Array.isArray(spotReports) ? { data: spotReports, links: [] } : (spotReports ?? {});
    const reports = normalizedReports.data ?? [];
    const pagination = normalizedReports;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [drafts, setDrafts] = useState({});
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
        in_progress: 'bg-blue-100 text-blue-700',
        resolved: 'bg-emerald-100 text-emerald-700',
    };

    const handlePageChange = (pageUrl) => {
        if (!pageUrl) return;
        router.get(pageUrl, { preserveScroll: true });
    };

    const draftFor = (report) => drafts[report.id] ?? {
        status: report.status,
        urgency: report.urgency || 'normal',
        assigned_to: report.assigned_to || '',
        follow_up_note: report.follow_up_note || '',
    };

    const updateDraft = (report, field, value) => setDrafts((current) => ({
        ...current,
        [report.id]: { ...draftFor(report), [field]: value },
    }));

    const saveWorkflow = (report) => router.patch(route('admin.reports.update', report.id), draftFor(report), {
        preserveScroll: true,
        onSuccess: () => setDrafts((current) => {
            const next = { ...current };
            delete next[report.id];
            return next;
        }),
    });

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

                                    <>
                                    <div className="space-y-3 md:hidden">
                                        {reports.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No confidential reports yet.</div> : reports.map((report) => <ReportCard key={`mobile-${report.id}`} report={report} draft={draftFor(report)} statusStyles={statusStyles} onUpdate={(field, value) => updateDraft(report, field, value)} onSave={() => saveWorkflow(report)} />)}
                                    </div>
                                    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
                                        <table className="min-w-full text-left">
                                            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Township</th>
                                                    <th className="px-4 py-3 font-semibold">Landmark</th>
                                                    <th className="px-4 py-3 font-semibold">Condition</th>
                                                    <th className="px-4 py-3 font-semibold">Seen</th>
                                                    <th className="px-4 py-3 font-semibold">Reporter</th>
                                                    <th className="px-4 py-3 font-semibold">Workflow</th>
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
                                                        <td className="min-w-[280px] px-4 py-3">
                                                            <div className="space-y-2">
                                                                <div className="flex flex-wrap gap-2">
                                                                    <select value={draftFor(report).status} onChange={(event) => updateDraft(report, 'status', event.target.value)} className={`rounded-full border-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyles[draftFor(report).status] ?? 'bg-slate-100 text-slate-700'}`}>
                                                                        {['unread', 'checked', 'in_progress', 'resolved'].map((status) => <option key={status} value={status}>{status}</option>)}
                                                                    </select>
                                                                    <select value={draftFor(report).urgency} onChange={(event) => updateDraft(report, 'urgency', event.target.value)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                                                                        {['low', 'normal', 'high', 'urgent'].map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}
                                                                    </select>
                                                                </div>
                                                                <input value={draftFor(report).assigned_to} onChange={(event) => updateDraft(report, 'assigned_to', event.target.value)} placeholder="Assigned to" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
                                                                <textarea value={draftFor(report).follow_up_note} onChange={(event) => updateDraft(report, 'follow_up_note', event.target.value)} placeholder="Follow-up note" rows="2" className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs" />
                                                                <button type="button" onClick={() => saveWorkflow(report)} className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white">Save workflow</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    </>

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
