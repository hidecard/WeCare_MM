import { Link, router, usePage } from '@inertiajs/react';
import { Check, FileImage, Trash2, X } from 'lucide-react';
import { useState } from 'react';
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

const Card = ({ donation, onDecision }) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3"><div><p className="font-bold text-slate-900">{donation.is_anonymous ? 'Anonymous donor' : donation.donor_name || 'Unknown donor'}</p><p className="mt-1 text-xs text-slate-500">{donation.phone || 'No phone'}</p><p className="mt-1 text-xs font-semibold text-amber-700">{waitingText(donation.created_at)}</p></div><p className="font-black text-emerald-700">{currency.format(Number(donation.amount || 0))}</p></div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-2.5"><dt className="text-slate-500">Pool</dt><dd className="mt-1 font-semibold text-slate-800">{donation.fund_pool?.title_mm || donation.fund_pool?.title_en || 'General'}</dd></div><div className="rounded-xl bg-slate-50 p-2.5"><dt className="text-slate-500">Method</dt><dd className="mt-1 font-semibold text-slate-800">{donation.payment_method}</dd></div></dl>
        {donation.wish_note && <p className="mt-2 rounded-xl bg-amber-50 p-2.5 text-xs text-slate-600">{donation.wish_note}</p>}
        {donation.donor_email && <p className="mt-2 text-xs text-slate-500">{donation.donor_email}</p>}
        <div className="mt-3 flex flex-wrap gap-2">{donation.slip_image_path ? <a href={route('admin.donations.slip', donation.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"><FileImage className="h-3.5 w-3.5" />Slip</a> : <span className="rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-400">No slip</span>}<button type="button" onClick={() => onDecision(donation.id,'approved')} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700"><Check className="h-3.5 w-3.5" />Approve</button><button type="button" onClick={() => onDecision(donation.id,'rejected')} className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"><Trash2 className="h-3.5 w-3.5" />Reject</button></div>
    </article>
);

export default function Donations({ pendingDonations = [] }) {
    const data = Array.isArray(pendingDonations) ? { data: pendingDonations, links: [] } : (pendingDonations ?? {});
    const donations = data.data ?? [];
    const { errors = {} } = usePage().props;
    const [review, setReview] = useState(null);
    const [note, setNote] = useState('');
    const [noteError, setNoteError] = useState('');
    const decide = (id, status) => { setReview({ id, status }); setNote(''); setNoteError(''); };
    const submitReview = (event) => {
        event.preventDefault();
        if (review?.status === 'rejected' && !note.trim()) {
            setNoteError('A reason is required when a donation is not approved.');
            return;
        }
        router.patch(route('admin.donations.update-status', review.id), { status: review.status, review_note: note }, {
            preserveScroll: true,
            onSuccess: () => setReview(null),
        });
    };
    const summary = [
        { label: 'Waiting for review', value: donations.length, cls: 'text-amber-700' },
        { label: 'Avg. donation', value: currency.format(Number(donations.reduce((s, i) => s + Number(i.amount || 0), 0) / Math.max(donations.length, 1)) || 0), cls: 'text-emerald-700' },
        { label: 'Payment methods', value: new Set(donations.map((d) => d.payment_method)).size, cls: 'text-sky-700' },
    ];
    return (
        <AdminLayout title="Donation Review" subtitle="Review" heading="Donation review" actions={<Link href={route('admin.donations.list')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">Donation list</Link>}>
            {review && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <form onSubmit={submitReview} className="w-full max-w-lg rounded-3xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-black text-slate-900">{review.status === 'approved' ? 'Approve donation' : 'Reject donation'}</h2>
                            <button type="button" onClick={() => setReview(null)} className="rounded-full border border-slate-200 p-2 text-slate-500" aria-label="Close review"><X className="h-4 w-4" /></button>
                        </div>
                        <label htmlFor="review-note" className="block text-sm font-semibold text-slate-700">{review.status === 'rejected' ? 'Reason for the donor' : 'Note for the donor (optional)'}</label>
                        <textarea id="review-note" value={note} onChange={(event) => setNote(event.target.value)} rows="4" required={review.status === 'rejected'} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Explain what the donor should know" />
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
                {donations.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No pending donation slips at the moment.</div> : (<>
                    <div className="space-y-3 md:hidden">{donations.map((d) => <Card key={d.id} donation={d} onDecision={decide} />)}</div>
                    <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500"><tr><th className="px-4 py-3">Donor</th><th className="px-4 py-3">Pool</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Slip</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{donations.map((d) => (<tr key={d.id} className="align-top hover:bg-slate-50/80"><td className="px-4 py-3"><div className="font-semibold text-slate-900">{d.is_anonymous ? 'Anonymous donor' : d.donor_name || 'Unknown donor'}</div><div className="mt-1 text-xs text-slate-500">{d.phone || 'No phone'}{d.donor_email ? ` · ${d.donor_email}` : ''}</div><div className="mt-1 text-xs font-semibold text-amber-700">{waitingText(d.created_at)}</div>{d.wish_note && <div className="mt-1 text-xs text-slate-500">{d.wish_note}</div>}</td><td className="px-4 py-3">{d.fund_pool?.title_mm || d.fund_pool?.title_en || 'General'}</td><td className="px-4 py-3 font-bold text-emerald-700">{currency.format(Number(d.amount || 0))}</td><td className="px-4 py-3">{d.payment_method}</td><td className="px-4 py-3">{d.slip_image_path ? <a href={route('admin.donations.slip', d.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700"><FileImage className="h-4 w-4" />View slip</a> : <span className="text-slate-400">No slip</span>}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => decide(d.id,'approved')} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-200"><Check className="h-3.5 w-3.5" />Approve</button><button type="button" onClick={() => decide(d.id,'rejected')} className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-200"><Trash2 className="h-3.5 w-3.5" />Reject</button></div></td></tr>))}</tbody></table></div>
                </>)}
                {pagination(data, (url) => url && router.get(url, {}, { preserveScroll: true }))}
            </section>
        </AdminLayout>
    );
}
