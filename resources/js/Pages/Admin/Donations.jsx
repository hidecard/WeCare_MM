import { Head, Link, router } from '@inertiajs/react';
import { BarChart3, Check, ChevronLeft, ChevronRight, FileImage, FileText, LayoutDashboard, List, MapPinned, Menu, ShieldAlert, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

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

export default function Donations({ pendingDonations = [] }) {
    const normalizedDonations = Array.isArray(pendingDonations) ? { data: pendingDonations, links: [] } : (pendingDonations ?? {});
    const donations = normalizedDonations.data ?? [];
    const pagination = normalizedDonations;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navItems = [
        { name: 'Overview', href: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert },
        { name: 'Donation List', href: route('admin.donations.list'), icon: List },
        { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned },
        { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText },
        { name: 'Fund Pools', href: route('admin.fund-pools.index'), icon: BarChart3 },
        { name: 'Volunteers', href: route('admin.volunteers.index'), icon: Users },
    ];

    const handleDonationDecision = (donationId, status) => {
        router.patch(route('admin.donations.update-status', donationId), { status }, {
            preserveScroll: true,
        });
    };

    const handlePageChange = (pageUrl) => {
        if (!pageUrl) return;
        router.get(pageUrl, { preserveScroll: true });
    };

    const summaryCards = [
        { label: 'Waiting for review', value: String(donations.length), tone: 'amber' },
        { label: 'Avg. donation', value: currency.format(Number(donations.reduce((sum, item) => sum + Number(item.amount || 0), 0) / Math.max(donations.length, 1)) || 0), tone: 'emerald' },
        { label: 'Payments queued', value: String(new Set(donations.map((donation) => donation.payment_method)).size), tone: 'sky' },
    ];

    return (
        <>
            <Head title="Donation Review" />
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
                                    className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium transition ${href === route('admin.donations.index') ? 'border-emerald-300/30 bg-emerald-500/15 text-white shadow-inner shadow-emerald-900/20' : 'border-white/10 bg-white/5 text-emerald-50/80 hover:bg-white/10 hover:text-white'}`}
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
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Review</p>
                                        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Donation review</h1>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={route('admin.dashboard')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">Dashboard</Link>
                                    <Link href={route('home')} className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#065F46] shadow-sm transition hover:bg-amber-400">Home</Link>
                                </div>
                            </div>
                        </header>

                        <main className="p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl space-y-6">
                                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Verification queue</p>
                                            <h2 className="mt-1 text-2xl font-black text-slate-900">Pending donation slips</h2>
                                        </div>
                                        <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-2 text-xs font-bold text-amber-700">{donations.length} waiting</div>
                                    </div>

                                    <div className="mb-5 grid gap-3 md:grid-cols-3">
                                        {summaryCards.map(({ label, value, tone }) => (
                                            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
                                                <p className={`mt-2 text-2xl font-black ${tone === 'amber' ? 'text-amber-700' : tone === 'emerald' ? 'text-emerald-700' : 'text-sky-700'}`}>
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {donations.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No pending donation slips at the moment.</div>
                                    ) : (
                                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                            <table className="min-w-full text-left">
                                                <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                                    <tr>
                                                        <th className="px-4 py-3 font-semibold">Donor</th>
                                                        <th className="px-4 py-3 font-semibold">Pool</th>
                                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                                        <th className="px-4 py-3 font-semibold">Method</th>
                                                        <th className="px-4 py-3 font-semibold">Slip</th>
                                                        <th className="px-4 py-3 font-semibold">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                                                    {donations.map((donation) => (
                                                        <tr key={donation.id} className="align-top hover:bg-slate-50/80">
                                                            <td className="px-4 py-3">
                                                                <div className="font-semibold text-slate-900">{donation.is_anonymous ? 'Anonymous donor' : donation.donor_name || 'Unknown donor'}</div>
                                                                <div className="mt-1 text-xs text-slate-500">{donation.phone || 'No phone'}</div>
                                                                <div className="mt-1 text-xs text-slate-500">{donation.wish_note || 'No note'}</div>
                                                            </td>
                                                            <td className="px-4 py-3">{donation.fund_pool?.title_mm || donation.fund_pool?.title_en || 'General'}</td>
                                                            <td className="px-4 py-3 font-bold text-emerald-700">{currency.format(Number(donation.amount || 0))}</td>
                                                            <td className="px-4 py-3">{donation.payment_method}</td>
                                                            <td className="px-4 py-3">
                                                                {donation.slip_image_path ? (
                                                                    <a href={route('admin.donations.slip', donation.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                                                                        <FileImage className="h-4 w-4" />
                                                                        View slip
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-slate-400">No slip</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button type="button" onClick={() => handleDonationDecision(donation.id, 'approved')} className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200">
                                                                        <Check className="h-3.5 w-3.5" />
                                                                        Approve
                                                                    </button>
                                                                    <button type="button" onClick={() => handleDonationDecision(donation.id, 'rejected')} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-200">
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                        Reject
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

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
