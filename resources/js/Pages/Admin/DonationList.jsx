import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, ChevronLeft, ChevronRight, FileImage, FileText, LayoutDashboard, List, MapPinned, Menu, ShieldAlert, Users } from 'lucide-react';
import { useState } from 'react';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

const pagination = (data, onChange) => data?.links?.length ? (
    <div className="mt-5 flex flex-wrap justify-center gap-2">
        {data.links.map((link, index) => <button key={`${link.label}-${index}`} type="button" disabled={!link.url} onClick={() => link.url && onChange(link.url)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${link.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'} ${!link.url ? 'opacity-40' : ''}`}>{link.label.replace('&laquo;', '').replace('&raquo;', '')}</button>)}
    </div>
) : null;

export default function DonationList({ donations = {}, filters = {}, paymentMethods = [], summary = {} }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');
    const rows = donations.data || [];
    const navItems = [
        { name: 'Overview', href: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert },
        { name: 'Donation List', href: route('admin.donations.list'), icon: List },
        { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned },
        { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText },
        { name: 'Fund Pools', href: route('admin.fund-pools.index'), icon: BarChart3 },
        { name: 'Volunteers', href: route('admin.volunteers.index'), icon: Users },
    ];

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route('admin.donations.list'), { search, status, payment_method: paymentMethod }, { preserveState: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Donation List" />
            <div className="min-h-screen bg-slate-100 text-slate-800"><div className="flex min-h-screen">
                <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-[#0b3b2f] p-4 text-white shadow-2xl transition-transform md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-[10px] uppercase tracking-[0.28em] text-emerald-200">WeCare</p><h2 className="mt-2 text-xl font-black">Admin</h2></div><button type="button" onClick={() => setSidebarOpen(false)} className="rounded-full border border-white/15 p-2 md:hidden"><ChevronLeft className="h-4 w-4" /></button></div>
                    <nav className="mt-6 space-y-2">{navItems.map(({ name, href, icon: Icon }) => <Link key={name} href={href} className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium ${href === route('admin.donations.list') ? 'border-emerald-300/30 bg-emerald-500/15 text-white' : 'border-white/10 bg-white/5 text-emerald-50/80'}`}><span className="flex items-center gap-3"><Icon className="h-4 w-4" />{name}</span><ChevronRight className="h-4 w-4 text-emerald-200" /></Link>)}</nav>
                </aside>
                <div className="flex-1"><header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur"><div className="flex items-center justify-between px-4 py-4 md:px-8"><div className="flex items-center gap-3"><button type="button" onClick={() => setSidebarOpen(true)} className="rounded-full border border-slate-200 bg-white p-2 md:hidden"><Menu className="h-5 w-5" /></button><div><p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">All records</p><h1 className="text-xl font-black text-slate-900 md:text-2xl">Donation list</h1></div></div><div className="flex gap-3"><Link href={route('admin.donations.index')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Review queue</Link><Link href={route('home')} className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#065F46]">Home</Link></div></div></header>
                    <main className="p-4 md:p-8"><div className="mx-auto max-w-7xl space-y-6">
                        <section className="grid gap-3 md:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Total donations</p><p className="mt-2 text-2xl font-black">{summary.total ?? 0}</p></div><div className="rounded-2xl border border-amber-200 bg-white p-4"><p className="text-xs text-slate-500">Pending</p><p className="mt-2 text-2xl font-black text-amber-700">{summary.pending ?? 0}</p></div><div className="rounded-2xl border border-emerald-200 bg-white p-4"><p className="text-xs text-slate-500">Approved</p><p className="mt-2 text-2xl font-black text-emerald-700">{summary.approved ?? 0}</p></div><div className="rounded-2xl border border-emerald-200 bg-white p-4"><p className="text-xs text-slate-500">Approved amount</p><p className="mt-2 text-xl font-black text-emerald-700">{currency.format(Number(summary.approved_amount || 0))}</p></div></section>
                        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search donor, phone, certificate" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" /><select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm"><option value="all">All payment methods</option>{paymentMethods.map((method) => <option key={method} value={method}>{method}</option>)}</select><button type="submit" className="rounded-xl bg-[#065F46] px-5 py-2.5 text-sm font-bold text-white">Filter</button></form>
                            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-[10px] uppercase tracking-[0.15em] text-slate-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Donor</th><th className="px-4 py-3">Fund pool</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Slip</th></tr></thead><tbody className="divide-y divide-slate-200">{rows.length === 0 ? <tr><td colSpan="7" className="px-5 py-10 text-center text-slate-500">No donations found.</td></tr> : rows.map((donation) => <tr key={donation.id} className="align-top hover:bg-slate-50"><td className="px-4 py-3 text-xs text-slate-500">{donation.created_at ? new Date(donation.created_at).toLocaleString() : '—'}</td><td className="px-4 py-3"><p className="font-semibold text-slate-900">{donation.is_anonymous ? 'Anonymous donor' : donation.donor_name}</p><p className="text-xs text-slate-500">{donation.phone || 'No phone'}</p></td><td className="px-4 py-3">{donation.fund_pool?.title_mm || donation.fund_pool?.title_en || 'General'}</td><td className="px-4 py-3 font-bold text-emerald-700">{currency.format(Number(donation.amount || 0))}</td><td className="px-4 py-3">{donation.payment_method}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${donation.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : donation.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{donation.status}</span></td><td className="px-4 py-3">{donation.slip_image_path ? <a href={route('admin.donations.slip', donation.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold"><FileImage className="h-3.5 w-3.5" /> View</a> : '—'}</td></tr>)}</tbody></table></div>{pagination(donations, (url) => router.get(url, {}, { preserveState: true }))}</section>
                    </div></main></div>
            </div></div>
        </>
    );
}
