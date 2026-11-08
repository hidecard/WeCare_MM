import { Link, router } from '@inertiajs/react';
import { Download, FileImage, Maximize2, X } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const pagination = (data, onChange) => data?.links?.length ? (<div className="mt-5 flex flex-wrap justify-center gap-2">{data.links.map((link, i) => <button key={i} type="button" disabled={!link.url} onClick={() => link.url && onChange(link.url)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${link.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'} disabled:opacity-40`}>{link.label.replace('&laquo;','').replace('&raquo;','')}</button>)}</div>) : null;

function SlipModal({ donation, onClose }) {
    if (!donation?.slip_image_path) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between gap-2">
                    <h2 className="text-lg font-black text-slate-900">Payment slip</h2>
                    <div className="flex gap-2">
                        <a href={route('admin.donations.slip', donation.id)} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold"><Download className="h-3.5 w-3.5" />Download</a>
                        <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2" aria-label="Close"><X className="h-4 w-4" /></button>
                    </div>
                </div>
                <img src={route('admin.donations.slip', { donation: donation.id, inline: 1 })} alt="Payment slip" className="mx-auto max-h-[75vh] w-auto rounded-2xl border border-slate-200 object-contain" />
            </div>
        </div>
    );
}

export default function DonationList({ donations = {}, filters = {}, paymentMethods = [], fundPools = [], summary = {}, auditTrail = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');
    const [fundPoolId, setFundPoolId] = useState(filters.fund_pool_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [amountMin, setAmountMin] = useState(filters.amount_min || '');
    const [amountMax, setAmountMax] = useState(filters.amount_max || '');
    const [slipDonation, setSlipDonation] = useState(null);
    const rows = donations.data || [];
    const params = () => ({ search: search || undefined, status, payment_method: paymentMethod, fund_pool_id: fundPoolId || undefined, date_from: dateFrom || undefined, date_to: dateTo || undefined, amount_min: amountMin || undefined, amount_max: amountMax || undefined });
    const apply = (e) => { e.preventDefault(); router.get(route('admin.donations.list'), params(), { preserveState: true, preserveScroll: true }); };
    const clearFilters = () => { setSearch(''); setStatus('all'); setPaymentMethod('all'); setFundPoolId(''); setDateFrom(''); setDateTo(''); setAmountMin(''); setAmountMax(''); router.get(route('admin.donations.list'), {}, { preserveState: true, preserveScroll: true }); };
    const exportCsv = () => { const q = new URLSearchParams(Object.entries(params()).filter(([, v]) => v !== undefined && v !== 'all' && v !== '')).toString(); window.location.href = route('admin.donations.export') + (q ? `?${q}` : ''); };

    return (
        <AdminLayout title="Donation List" subtitle="All records" heading="Donation list" actions={<><button type="button" onClick={exportCsv} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">Export CSV</button><Link href={route('admin.donations.index')} className="rounded-full bg-[#065F46] px-3 py-2 text-xs font-semibold text-white sm:px-4 sm:text-sm">Review queue</Link></>}>
            {slipDonation && <SlipModal donation={slipDonation} onClose={() => setSlipDonation(null)} />}
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[{ l: 'Total donations', v: summary.total ?? 0, c: 'text-slate-900' }, { l: 'Pending', v: summary.pending ?? 0, c: 'text-amber-700' }, { l: 'Approved', v: summary.approved ?? 0, c: 'text-emerald-700' }, { l: 'Approved amount', v: currency.format(Number(summary.approved_amount || 0)), c: 'text-emerald-700' }].map((s) => <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{s.l}</p><p className={`mt-2 text-2xl font-black ${s.c}`}>{s.v}</p></div>)}
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <form onSubmit={apply} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search donor, phone, tracking ID" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm lg:col-span-2" />
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">All payment methods</option>{paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                    <select value={fundPoolId} onChange={(e) => setFundPoolId(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="">All fund pools</option>{fundPools.map((pool) => <option key={pool.id} value={pool.id}>{pool.title_mm || pool.title_en}</option>)}</select>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Date from" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label="Date to" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                    <input type="number" min="0" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} placeholder="Min MMK" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                    <input type="number" min="0" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="Max MMK" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                    <div className="flex gap-2 sm:col-span-2 lg:col-span-4"><button type="submit" className="rounded-xl bg-[#065F46] px-5 py-2.5 text-sm font-bold text-white">Apply filters</button><button type="button" onClick={clearFilters} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">Clear</button></div>
                </form>
                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.15em] text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Donor</th><th className="px-4 py-3">Fund pool</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status / Review</th><th className="px-4 py-3">Slip</th></tr></thead><tbody className="divide-y divide-slate-200">{rows.length === 0 ? <tr><td colSpan="7" className="px-5 py-10 text-center text-slate-500">No donations found.</td></tr> : rows.map((d) => <tr key={d.id} className="align-top hover:bg-slate-50"><td className="px-4 py-3 text-xs text-slate-500">{d.created_at ? new Date(d.created_at).toLocaleString() : '-'}</td><td className="px-4 py-3"><p className="font-semibold text-slate-900">{d.is_anonymous ? 'Anonymous donor' : d.donor_name}</p><p className="text-xs text-slate-500">{d.phone || 'No phone'}</p></td><td className="px-4 py-3">{d.fund_pool?.title_mm || d.fund_pool?.title_en || 'General'}</td><td className="px-4 py-3 font-bold text-emerald-700">{currency.format(Number(d.amount || 0))}</td><td className="px-4 py-3">{d.payment_method}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</span>{d.review_note && <p className="mt-1 max-w-[220px] text-xs text-slate-500">{d.review_note}</p>}</td><td className="px-4 py-3">{d.slip_image_path ? <div className="flex flex-wrap gap-1.5"><button type="button" onClick={() => setSlipDonation(d)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"><Maximize2 className="h-3.5 w-3.5" />Zoom</button><a href={route('admin.donations.slip', d.id)} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"><Download className="h-3.5 w-3.5" />Slip</a></div> : '-'}</td></tr>)}</tbody></table></div>
                {pagination(donations, (url) => router.get(url, {}, { preserveState: true }))}
            </section>
            {auditTrail.length > 0 && (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-black text-slate-900">Donation audit trail</h2>
                    <ul className="mt-4 divide-y divide-slate-100">{auditTrail.map((log) => (
                        <li key={log.id} className="flex flex-wrap items-start justify-between gap-2 py-3 text-sm">
                            <div><p className="font-semibold text-slate-900">{log.actor?.name || 'System'} <span className="font-normal text-slate-500">· {log.metadata?.status || log.action}</span></p><p className="text-xs text-slate-500">{log.donation?.donor_name} · MMK {Number(log.donation?.amount || 0).toLocaleString()}{log.metadata?.review_note ? ` · ${log.metadata.review_note}` : ''}</p></div>
                            <time className="text-xs text-slate-400">{log.created_at ? new Date(log.created_at).toLocaleString() : ''}</time>
                        </li>
                    ))}</ul>
                </section>
            )}
        </AdminLayout>
    );
}
