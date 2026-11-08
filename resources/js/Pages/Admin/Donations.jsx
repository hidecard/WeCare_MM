import { Link, router, usePage } from '@inertiajs/react';
import { Check, Download, FileImage, Maximize2, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const pagination = (p, onPage) => p?.links?.length ? (<div className="mt-5 flex flex-wrap justify-center gap-2">{p.links.map((l, i) => <button key={i} type="button" disabled={!l.url} onClick={() => onPage(l.url)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${l.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'} disabled:opacity-40`}>{l.label.replace('&laquo;','').replace('&raquo;','')}</button>)}</div>) : null;
const waitingText = (createdAt) => {
    if (!createdAt) return 'Waiting';
    const then = new Date(createdAt);
    if (Number.isNaN(then.getTime())) return 'Waiting';
    const minutes = Math.max(1, Math.floor((Date.now() - then.getTime()) / 60000));
    if (minutes < 60) return `Waiting ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Waiting ${hours} hour${hours === 1 ? '' : 's'}`;
    const days = Math.floor(hours / 24);
    return `Waiting ${days} day${days === 1 ? '' : 's'}`;
};
const APPROVE_TEMPLATES = [
    'Payment slip verified. Thank you for your support.',
    'Amount and payment method matched. Donation approved.',
    'Verified and added to the selected fund pool.',
];
const REJECT_TEMPLATES = [
    'Slip image is unclear. Please submit a clearer payment slip.',
    'Amount on the slip does not match the submitted amount.',
    'Payment method or reference details could not be verified.',
    'Duplicate or incomplete submission. Please resubmit with correct details.',
];

function SlipModal({ donation, onClose }) {
    if (!donation?.slip_image_path) return null;
    const inlineUrl = route('admin.donations.slip', { donation: donation.id, inline: 1 });
    const downloadUrl = route('admin.donations.slip', donation.id);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label="Payment slip">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Payment slip</h2>
                        <p className="text-xs text-slate-500">{donation.is_anonymous ? 'Anonymous donor' : donation.donor_name} · {currency.format(Number(donation.amount || 0))}</p>
                    </div>
                    <div className="flex gap-2">
                        <a href={downloadUrl} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"><Download className="h-3.5 w-3.5" />Download</a>
                        <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500" aria-label="Close"><X className="h-4 w-4" /></button>
                    </div>
                </div>
                <img src={inlineUrl} alt="Payment slip" className="mx-auto max-h-[75vh] w-auto rounded-2xl border border-slate-200 bg-slate-50 object-contain" />
            </div>
        </div>
    );
}

export default function Donations({ pendingDonations = [], auditTrail = [] }) {
    const data = Array.isArray(pendingDonations) ? { data: pendingDonations, links: [] } : (pendingDonations ?? {});
    const donations = data.data ?? [];
    const { errors = {} } = usePage().props;
    const [review, setReview] = useState(null);
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const [slipDonation, setSlipDonation] = useState(null);
    const [selected, setSelected] = useState([]);
    const [bulk, setBulk] = useState({ status: 'approved', note: '' });

    const decide = (id, status) => { setReview({ id, status }); setNote(''); setNoteError(''); };
    const submitReview = (event) => {
        event.preventDefault();
        if (review?.status === 'rejected' && !note.trim()) { setNoteError('A reason is required when a donation is not approved.'); return; }
        router.patch(route('admin.donations.update-status', review.id), { status: review.status, review_note: note }, { preserveScroll: true, onSuccess: () => setReview(null) });
    };
    const toggle = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
    const toggleAll = () => setSelected((s) => s.length === donations.length ? [] : donations.map((d) => d.id));
    const submitBulk = (event) => {
        event.preventDefault();
        if (!selected.length) return;
        if (bulk.status === 'rejected' && !bulk.note.trim()) { setNoteError('A reason is required for bulk rejection.'); return; }
        router.post(route('admin.donations.bulk-status'), { donation_ids: selected, status: bulk.status, review_note: bulk.note }, { preserveScroll: true, onSuccess: () => { setSelected([]); setBulk({ status: 'approved', note: '' }); setNoteError(''); } });
    };
    const summary = useMemo(() => [
        { label: 'Waiting for review', value: donations.length, cls: 'text-amber-700' },
        { label: 'Avg. donation', value: currency.format(Number(donations.reduce((s, i) => s + Number(i.amount || 0), 0) / Math.max(donations.length, 1)) || 0), cls: 'text-emerald-700' },
        { label: 'Selected', value: selected.length, cls: 'text-sky-700' },
    ], [donations, selected.length]);
    const templates = review?.status === 'approved' ? APPROVE_TEMPLATES : REJECT_TEMPLATES;

    return (
        <AdminLayout title="Donation Review" subtitle="Review" heading="Donation review" actions={<Link href={route('admin.donations.list')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">Donation list</Link>}>
            {slipDonation && <SlipModal donation={slipDonation} onClose={() => setSlipDonation(null)} />}
            {review && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <form onSubmit={submitReview} className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900">{review.status === 'approved' ? 'Approve donation' : 'Reject donation'}</h2>
                            <button type="button" onClick={() => setReview(null)} className="rounded-full border border-slate-200 p-2 text-slate-500" aria-label="Close review"><X className="h-4 w-4" /></button>
                        </div>
                        <div className="mb-3 flex flex-wrap gap-2">
                            {templates.map((t) => <button key={t} type="button" onClick={() => setNote(t)} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-emerald-300">{t.length > 46 ? `${t.slice(0, 46)}…` : t}</button>)}
                        </div>
                        <label htmlFor="review-note" className="block text-sm font-semibold text-slate-700">{review.status === 'rejected' ? 'Reason for the donor' : 'Note for the donor (optional)'}</label>
                        <textarea id="review-note" value={note} onChange={(event) => setNote(event.target.value)} rows="4" required={review.status === 'rejected'} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Select a template or write a clear reason" />
                        {(noteError || errors.review_note || errors.status) && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{noteError || errors.review_note || errors.status}</p>}
                        <div className="mt-4 flex justify-end gap-2">
                            <button type="button" onClick={() => setReview(null)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">Cancel</button>
                            <button type="submit" className={`rounded-full px-4 py-2 text-xs font-bold ${review.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{review.status === 'approved' ? 'Confirm approval' : 'Confirm rejection'}</button>
                        </div>
                    </form>
                </div>
            )}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Verification queue</p><h2 className="mt-1 text-2xl font-black text-slate-900">Pending donation slips</h2></div><span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700">{donations.length} waiting</span></div>
                <div className="mb-5 grid gap-3 md:grid-cols-3">{summary.map(({ label, value, cls }) => <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p><p className={`mt-2 text-2xl font-black ${cls}`}>{value}</p></div>)}</div>
                {selected.length > 0 && (
                    <form onSubmit={submitBulk} className="mb-5 rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
                        <p className="text-sm font-bold text-slate-900">Bulk review ({selected.length} selected)</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <select value={bulk.status} onChange={(e) => setBulk((b) => ({ ...b, status: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="approved">Approve selected</option><option value="rejected">Reject selected</option></select>
                            <input value={bulk.note} onChange={(e) => setBulk((b) => ({ ...b, note: e.target.value }))} placeholder={bulk.status === 'rejected' ? 'Reason required for rejection' : 'Optional note'} required={bulk.status === 'rejected'} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm lg:col-span-2" />
                            <button type="submit" className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white ${bulk.status === 'approved' ? 'bg-emerald-600' : 'bg-red-600'}`}>Apply bulk action</button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">{(bulk.status === 'approved' ? APPROVE_TEMPLATES : REJECT_TEMPLATES).map((t) => <button key={t} type="button" onClick={() => setBulk((b) => ({ ...b, note: t }))} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-600">{t.slice(0, 38)}…</button>)}</div>
                        {errors.review_note && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{errors.review_note}</p>}
                    </form>
                )}
                {donations.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No pending donation slips at the moment.</div> : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500"><tr><th className="px-4 py-3"><input type="checkbox" checked={selected.length === donations.length && donations.length > 0} onChange={toggleAll} aria-label="Select all" /></th><th className="px-4 py-3">Donor</th><th className="px-4 py-3">Pool</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Slip</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{donations.map((d) => (<tr key={d.id} className="align-top hover:bg-slate-50/80"><td className="px-4 py-3"><input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggle(d.id)} aria-label={`Select donation ${d.id}`} /></td><td className="px-4 py-3"><div className="font-semibold text-slate-900">{d.is_anonymous ? 'Anonymous donor' : d.donor_name || 'Unknown donor'}</div><div className="mt-1 text-xs text-slate-500">{d.phone || 'No phone'}{d.donor_email ? ` · ${d.donor_email}` : ''}</div><div className="mt-1 text-xs font-semibold text-amber-700">{waitingText(d.created_at)}</div>{d.wish_note && <div className="mt-1 text-xs text-slate-500">{d.wish_note}</div>}</td><td className="px-4 py-3">{d.fund_pool?.title_mm || d.fund_pool?.title_en || 'General'}</td><td className="px-4 py-3 font-bold text-emerald-700">{currency.format(Number(d.amount || 0))}</td><td className="px-4 py-3">{d.payment_method}</td><td className="px-4 py-3">{d.slip_image_path ? <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setSlipDonation(d)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"><Maximize2 className="h-3.5 w-3.5" />Zoom</button><a href={route('admin.donations.slip', d.id)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"><Download className="h-3.5 w-3.5" />Download</a></div> : <span className="text-slate-400">No slip</span>}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => decide(d.id,'approved')} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-200"><Check className="h-3.5 w-3.5" />Approve</button><button type="button" onClick={() => decide(d.id,'rejected')} className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200"><Trash2 className="h-3.5 w-3.5" />Reject</button></div></td></tr>))}</tbody></table></div>
                )}
                {pagination(data, (url) => url && router.get(url, {}, { preserveScroll: true }))}
            </section>
            {auditTrail.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900">Donation audit trail</h2>
                    <p className="mt-1 text-sm text-slate-500">Recent review actions showing which admin acted and when.</p>
                    <ul className="mt-4 divide-y divide-slate-100">{auditTrail.map((log) => (
                        <li key={log.id} className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm">
                            <div><p className="font-semibold text-slate-900">{log.actor?.name || 'System'} <span className="font-normal text-slate-500">· {log.metadata?.status || log.action}</span></p><p className="text-xs text-slate-500">{log.donation?.donor_name} · MMK {Number(log.donation?.amount || 0).toLocaleString()} · {log.donation?.fund_pool}{log.metadata?.review_note ? ` · ${log.metadata.review_note}` : ''}</p></div>
                            <time className="text-xs text-slate-400">{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</time>
                        </li>
                    ))}</ul>
                </section>
            )}
        </AdminLayout>
    );
}
