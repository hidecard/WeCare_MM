import { Link, router } from '@inertiajs/react';
import { Download, Maximize2, X } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const fmt = (v) => { if (!v) return '-'; const d = new Date(typeof v === 'string' && v.includes('T') ? v : `${v}T12:00:00`); return Number.isNaN(d.getTime()) ? String(v) : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d); };
const pagination = (p, onPage) => p?.links?.length ? (<div className="mt-5 flex flex-wrap justify-center gap-2">{p.links.map((l, i) => <button key={i} type="button" disabled={!l.url} onClick={() => onPage(l.url)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${l.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'} disabled:opacity-40`}>{l.label.replace('&laquo;','').replace('&raquo;','')}</button>)}</div>) : null;
const statusStyles = { unread: 'bg-slate-100 text-slate-700', checked: 'bg-amber-100 text-amber-700', in_progress: 'bg-blue-100 text-blue-700', resolved: 'bg-emerald-100 text-emerald-700' };
const NOTE_TEMPLATES = [
    'Team assigned and will verify the location.',
    'Checked on site; support is being arranged.',
    'Resolved after outreach visit. No further action needed now.',
    'Could not verify with provided details; please share a clearer landmark if possible.',
];

function PhotoModal({ report, onClose }) {
    if (!report?.photo_path) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-black text-slate-900">Report photo · {report.township}</h2>
                    <div className="flex gap-2">
                        <a href={route('admin.reports.photo', report.id)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold"><Download className="h-3.5 w-3.5" />Download</a>
                        <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2" aria-label="Close"><X className="h-4 w-4" /></button>
                    </div>
                </div>
                <img src={route('admin.reports.photo', { spotReport: report.id, inline: 1 })} alt="Spot report" className="mx-auto max-h-[75vh] w-auto rounded-2xl border border-slate-200 object-contain" />
            </div>
        </div>
    );
}

function Workflow({ draft, onUpdate, onSave, compact }) {
    const cls = compact ? 'text-[10px]' : 'text-xs';
    return (<div className={`space-y-2 ${compact ? 'min-w-[300px]' : 'rounded-xl bg-slate-50 p-3'}`}>
        <div className="grid grid-cols-2 gap-2">
            <select value={draft.status} onChange={(e) => onUpdate('status', e.target.value)} className={`rounded-full border-0 px-2.5 py-1.5 font-bold uppercase tracking-[0.12em] ${cls} ${statusStyles[draft.status] ?? statusStyles.unread}`}>{['unread','checked','in_progress','resolved'].map((s)=><option key={s} value={s}>{s}</option>)}</select>
            <select value={draft.urgency} onChange={(e) => onUpdate('urgency', e.target.value)} className={`rounded-full border border-slate-200 bg-white px-2.5 py-1.5 font-bold uppercase tracking-[0.12em] text-slate-600 ${cls}`}>{['low','normal','high','urgent'].map((u)=><option key={u} value={u}>{u}</option>)}</select>
        </div>
        <input value={draft.assigned_to} onChange={(e) => onUpdate('assigned_to', e.target.value)} placeholder="Assigned to" className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 ${cls}`} />
        <div className="flex flex-wrap gap-1">{NOTE_TEMPLATES.map((t) => <button key={t} type="button" onClick={() => onUpdate('follow_up_note', t)} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-600">{t.slice(0, 30)}…</button>)}</div>
        <textarea value={draft.follow_up_note} onChange={(e) => onUpdate('follow_up_note', e.target.value)} placeholder="Follow-up note" rows="2" className={`w-full rounded-lg border border-slate-200 px-2 py-1.5 ${cls}`} />
        <button type="button" onClick={onSave} className={`w-full rounded-full bg-emerald-700 px-3 py-2 font-bold text-white ${cls}`}>Save workflow</button>
    </div>);
}

export default function Reports({ spotReports = [], filters = {}, townships = [], auditTrail = [] }) {
    const data = Array.isArray(spotReports) ? { data: spotReports, links: [] } : (spotReports ?? {});
    const reports = data.data ?? [];
    const [drafts, setDrafts] = useState({});
    const [selected, setSelected] = useState([]);
    const [photoReport, setPhotoReport] = useState(null);
    const [bulk, setBulk] = useState({ status: 'checked', urgency: '', assigned_to: '', follow_up_note: '' });
    const [filterState, setFilterState] = useState({ township: filters.township || '', status: filters.status || 'all', urgency: filters.urgency || 'all', assigned_to: filters.assigned_to || '', date_from: filters.date_from || '', date_to: filters.date_to || '' });
    const draftFor = (r) => drafts[r.id] ?? { status: r.status, urgency: r.urgency || 'normal', assigned_to: r.assigned_to || '', follow_up_note: r.follow_up_note || '' };
    const upd = (r, f, v) => setDrafts((c) => ({ ...c, [r.id]: { ...draftFor(r), [f]: v } }));
    const save = (r) => router.patch(route('admin.reports.update', r.id), draftFor(r), { preserveScroll: true, onSuccess: () => setDrafts((c) => { const n = { ...c }; delete n[r.id]; return n; }) });
    const params = () => Object.fromEntries(Object.entries(filterState).filter(([, value]) => value && value !== 'all'));
    const applyFilters = (event) => { event.preventDefault(); router.get(route('admin.reports.index'), params(), { preserveState: true, preserveScroll: true }); };
    const clearFilters = () => { setFilterState({ township: '', status: 'all', urgency: 'all', assigned_to: '', date_from: '', date_to: '' }); router.get(route('admin.reports.index'), {}, { preserveState: true, preserveScroll: true }); };
    const exportCsv = () => { const q = new URLSearchParams(params()).toString(); window.location.href = route('admin.reports.export') + (q ? `?${q}` : ''); };
    const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
    const toggleAll = () => setSelected((s) => s.length === reports.length ? [] : reports.map((r) => r.id));
    const submitBulk = (e) => { e.preventDefault(); if (!selected.length) return; router.post(route('admin.reports.bulk-status'), { report_ids: selected, ...Object.fromEntries(Object.entries(bulk).filter(([, v]) => v !== '')) }, { preserveScroll: true, onSuccess: () => setSelected([]) }); };

    return (
        <AdminLayout title="Spot Reports" subtitle="Private" heading="Spot reports" actions={<><button type="button" onClick={exportCsv} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">Export CSV</button><Link href={route('admin.management')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">Management</Link></>}>
            {photoReport && <PhotoModal report={photoReport} onClose={() => setPhotoReport(null)} />}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Private field reports</p><h2 className="mt-1 text-2xl font-black text-slate-900">Citizen spot reports</h2></div><span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">{reports.length} entries</span></div>
                <form onSubmit={applyFilters} className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <select value={filterState.township} onChange={(e) => setFilterState({ ...filterState, township: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="">All townships</option>{townships.map((township) => <option key={township} value={township}>{township}</option>)}</select>
                    <select value={filterState.status} onChange={(e) => setFilterState({ ...filterState, status: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">All statuses</option>{['unread','checked','in_progress','resolved'].map((status) => <option key={status} value={status}>{status}</option>)}</select>
                    <select value={filterState.urgency} onChange={(e) => setFilterState({ ...filterState, urgency: e.target.value })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">All urgency</option>{['low','normal','high','urgent'].map((urgency) => <option key={urgency} value={urgency}>{urgency}</option>)}</select>
                    <input value={filterState.assigned_to} onChange={(e) => setFilterState({ ...filterState, assigned_to: e.target.value })} placeholder="Assigned to" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                    <input type="date" value={filterState.date_from} onChange={(e) => setFilterState({ ...filterState, date_from: e.target.value })} aria-label="Report date from" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                    <input type="date" value={filterState.date_to} onChange={(e) => setFilterState({ ...filterState, date_to: e.target.value })} aria-label="Report date to" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                    <div className="flex gap-2 sm:col-span-2 lg:col-span-3"><button type="submit" className="rounded-xl bg-[#065F46] px-5 py-2.5 text-sm font-bold text-white">Apply filters</button><button type="button" onClick={clearFilters} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Clear</button></div>
                </form>
                {selected.length > 0 && (
                    <form onSubmit={submitBulk} className="mb-5 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                        <p className="text-sm font-bold text-slate-900">Bulk workflow ({selected.length} selected)</p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                            <select value={bulk.status} onChange={(e) => setBulk((b) => ({ ...b, status: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">{['unread','checked','in_progress','resolved'].map((s) => <option key={s} value={s}>{s}</option>)}</select>
                            <select value={bulk.urgency} onChange={(e) => setBulk((b) => ({ ...b, urgency: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="">Keep urgency</option>{['low','normal','high','urgent'].map((u) => <option key={u} value={u}>{u}</option>)}</select>
                            <input value={bulk.assigned_to} onChange={(e) => setBulk((b) => ({ ...b, assigned_to: e.target.value }))} placeholder="Assigned to" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                            <input value={bulk.follow_up_note} onChange={(e) => setBulk((b) => ({ ...b, follow_up_note: e.target.value }))} placeholder="Follow-up note" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
                            <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Apply</button>
                        </div>
                    </form>
                )}
                <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500"><tr><th className="px-4 py-3"><input type="checkbox" checked={selected.length === reports.length && reports.length > 0} onChange={toggleAll} aria-label="Select all" /></th><th className="px-4 py-3">Township</th><th className="px-4 py-3">Landmark</th><th className="px-4 py-3">Condition</th><th className="px-4 py-3">Seen</th><th className="px-4 py-3">Reporter</th><th className="px-4 py-3">Workflow</th></tr></thead><tbody className="divide-y divide-slate-200">{reports.length === 0 ? <tr><td colSpan="7" className="px-5 py-8 text-center text-slate-500">No confidential reports yet.</td></tr> : reports.map((r) => { const d = draftFor(r); return (<tr key={r.id} className="align-top hover:bg-slate-50/80"><td className="px-4 py-3"><input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} aria-label={`Select report ${r.id}`} /></td><td className="px-4 py-3 font-semibold text-slate-900">{r.township}</td><td className="px-4 py-3">{r.street_landmark}</td><td className="px-4 py-3">{r.condition_note}{r.photo_path ? <button type="button" onClick={() => setPhotoReport(r)} className="ml-2 inline-flex items-center gap-1 font-semibold text-emerald-700"><Maximize2 className="h-3.5 w-3.5" />Photo</button> : null}</td><td className="px-4 py-3">{fmt(r.time_seen)}</td><td className="px-4 py-3">{r.reporter_phone || 'Anonymous'}</td><td className="px-4 py-3"><Workflow draft={d} onUpdate={(f,v)=>upd(r,f,v)} onSave={()=>save(r)} compact /></td></tr>); })}</tbody></table></div>
                {pagination(data, (url) => url && router.get(url, {}, { preserveScroll: true }))}
            </section>
            {auditTrail.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900">Report audit trail</h2>
                    <ul className="mt-4 divide-y divide-slate-100">{auditTrail.map((log) => (
                        <li key={log.id} className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm">
                            <div><p className="font-semibold text-slate-900">{log.actor?.name || 'System'} <span className="font-normal text-slate-500">· {log.metadata?.status || log.action}</span></p><p className="text-xs text-slate-500">{log.report?.reference_code} · {log.report?.township}{log.metadata?.follow_up_note ? ` · ${log.metadata.follow_up_note}` : ''}</p></div>
                            <time className="text-xs text-slate-400">{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</time>
                        </li>
                    ))}</ul>
                </section>
            )}
        </AdminLayout>
    );
}
