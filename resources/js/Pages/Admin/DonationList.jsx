import { Link, router } from '@inertiajs/react';
import { FileImage } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const pagination = (data, onChange) => data?.links?.length ? (<div className="mt-5 flex flex-wrap justify-center gap-2">{data.links.map((link, i) => <button key={i} type="button" disabled={!link.url} onClick={() => link.url && onChange(link.url)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${link.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'} disabled:opacity-40`}>{link.label.replace('&laquo;','').replace('&raquo;','')}</button>)}</div>) : null;

export default function DonationList({ donations = {}, filters = {}, paymentMethods = [], summary = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');
    const rows = donations.data || [];
    const apply = (e) => { e.preventDefault(); router.get(route('admin.donations.list'), { search, status, payment_method: paymentMethod }, { preserveState: true, preserveScroll: true }); };
    return (
        <AdminLayout title="Donation List" subtitle="All records" heading="Donation list" actions={<Link href={route('admin.donations.index')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">Review queue</Link>}>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[{ l: 'Total donations', v: summary.total ?? 0, c: 'text-slate-900' }, { l: 'Pending', v: summary.pending ?? 0, c: 'text-amber-700' }, { l: 'Approved', v: summary.approved ?? 0, c: 'text-emerald-700' }, { l: 'Approved amount', v: currency.format(Number(summary.approved_amount || 0)), c: 'text-emerald-700' }].map((s) => <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">{s.l}</p><p className={`mt-2 text-2xl font-black ${s.c}`}>{s.v}</p></div>)}
            </section>
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <form onSubmit={apply} className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search donor, phone, certificate" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">All payment methods</option>{paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                    <button type="submit" className="rounded-xl bg-[#065F46] px-5 py-2.5 text-sm font-bold text-white">Filter</button>
                </form>
                <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.15em] text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Donor</th><th className="px-4 py-3">Fund pool</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Slip</th></tr></thead><tbody className="divide-y divide-slate-200">{rows.length === 0 ? <tr><td colSpan="7" className="px-5 py-10 text-center text-slate-500">No donations found.</td></tr> : rows.map((d) => <tr key={d.id} className="align-top hover:bg-slate-50"><td className="px-4 py-3 text-xs text-slate-500">{d.created_at ? new Date(d.created_at).toLocaleString() : '—'}</td><td className="px-4 py-3"><p className="font-semibold text-slate-900">{d.is_anonymous ? 'Anonymous donor' : d.donor_name}</p><p className="text-xs text-slate-500">{d.phone || 'No phone'}</p></td><td className="px-4 py-3">{d.fund_pool?.title_mm || d.fund_pool?.title_en || 'General'}</td><td className="px-4 py-3 font-bold text-emerald-700">{currency.format(Number(d.amount || 0))}</td><td className="px-4 py-3">{d.payment_method}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${d.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : d.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</span></td><td className="px-4 py-3">{d.slip_image_path ? <a href={route('admin.donations.slip', d.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold"><FileImage className="h-3.5 w-3.5" />View</a> : '—'}</td></tr>)}</tbody></table></div>
                {pagination(donations, (url) => router.get(url, {}, { preserveState: true }))}
            </section>
        </AdminLayout>
    );
}
