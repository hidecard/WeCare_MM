import { Head, Link, router, useForm } from '@inertiajs/react';
import { BarChart3, ChevronLeft, ChevronRight, FileText, LayoutDashboard, MapPinned, Menu, PencilLine, Plus, ShieldAlert, Users, X } from 'lucide-react';
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

export default function FundPools({ fundPools = [] }) {
    const normalizedFundPools = Array.isArray(fundPools) ? { data: fundPools, links: [] } : (fundPools ?? {});
    const pools = normalizedFundPools.data ?? [];
    const pagination = normalizedFundPools;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPoolId, setEditingPoolId] = useState(null);
    const poolForm = useForm({
        title_mm: '',
        title_en: '',
        description: '',
        unit_cost: 5000,
        is_active: true,
    });

    const navItems = [
        { name: 'Overview', href: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert },
        { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned },
        { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText },
        { name: 'Fund Pools', href: route('admin.fund-pools.index'), icon: PencilLine },
        { name: 'Volunteers', href: route('admin.volunteers.index'), icon: Users },
    ];

    const closeModal = () => {
        poolForm.reset();
        setEditingPoolId(null);
        setIsFormOpen(false);
    };

    const resetPoolForm = () => {
        poolForm.reset();
        setEditingPoolId(null);
        setIsFormOpen(false);
    };

    const openCreatePoolModal = () => {
        resetPoolForm();
        setIsFormOpen(true);
    };

    const startPoolEdit = (pool) => {
        setEditingPoolId(pool.id);
        poolForm.setData({
            title_mm: pool.title_mm ?? '',
            title_en: pool.title_en ?? '',
            description: pool.description ?? '',
            unit_cost: Number(pool.unit_cost ?? 5000),
            is_active: Boolean(pool.is_active),
        });
        setIsFormOpen(true);
    };

    const handlePoolSubmit = (event) => {
        event.preventDefault();

        const payload = {
            title_mm: poolForm.data.title_mm,
            title_en: poolForm.data.title_en,
            description: poolForm.data.description,
            unit_cost: Number(poolForm.data.unit_cost || 0),
            is_active: Boolean(poolForm.data.is_active),
        };

        if (editingPoolId) {
            router.patch(route('admin.fund-pools.update', editingPoolId), payload, {
                preserveScroll: true,
                onSuccess: resetPoolForm,
            });
            return;
        }

        poolForm.post(route('admin.fund-pools.store'), {
            preserveScroll: true,
            onSuccess: resetPoolForm,
        });
    };

    const handlePageChange = (pageUrl) => {
        if (!pageUrl) return;
        router.get(pageUrl, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Fund Pools" />

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">{editingPoolId ? 'Edit' : 'Create'}</p>
                                <h2 className="mt-1 text-xl font-black text-slate-900">{editingPoolId ? 'Update fund pool' : 'Add fund pool'}</h2>
                            </div>
                            <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handlePoolSubmit} className="space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Myanmar title</span>
                                    <input value={poolForm.data.title_mm} onChange={(event) => poolForm.setData('title_mm', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="မုန့်စားစရိတ်" />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">English title</span>
                                    <input value={poolForm.data.title_en} onChange={(event) => poolForm.setData('title_en', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="Daily Meals" />
                                </label>
                            </div>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Description</span>
                                <textarea value={poolForm.data.description} onChange={(event) => poolForm.setData('description', event.target.value)} rows="3" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="General food support for elderly outreach" />
                            </label>
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Unit cost</span>
                                    <input type="number" min="1000" step="500" value={poolForm.data.unit_cost} onChange={(event) => poolForm.setData('unit_cost', Number(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                                </label>
                                <label className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
                                    <span className="text-xs font-semibold text-slate-600">Active</span>
                                    <input type="checkbox" checked={poolForm.data.is_active} onChange={(event) => poolForm.setData('is_active', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[#F59E0B]" />
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={resetPoolForm} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">Cancel</button>
                                <button type="submit" disabled={poolForm.processing} className="rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#065F46] hover:bg-amber-400 disabled:opacity-60">
                                    {editingPoolId ? 'Save changes' : 'Create pool'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#FFFBEB] text-slate-800">
                <div className="flex min-h-screen">
                    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-emerald-900/10 bg-[#0b3b2f] p-4 text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">WeCare</p>
                                <h2 className="mt-1 text-xl font-black">Admin</h2>
                            </div>
                            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-full border border-white/20 p-2 md:hidden">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="mt-6 space-y-2">
                            {navItems.map(({ name, href, icon: Icon }) => (
                                <Link key={name} href={href} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-emerald-50 transition hover:bg-white/10">
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
                        <header className="sticky top-0 z-30 border-b border-slate-200 bg-[#FFFBEB]/90 backdrop-blur">
                            <div className="flex items-center justify-between px-4 py-4 md:px-8">
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 md:hidden">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Support pool</p>
                                        <h1 className="text-xl font-black text-slate-900">Fund Pools</h1>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={route('admin.dashboard')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Dashboard</Link>
                                    <Link href={route('home')} className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#065F46]">Home</Link>
                                </div>
                            </div>
                        </header>

                        <main className="p-3 md:p-5">
                            <div className="mx-auto max-w-7xl space-y-4">
                                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Pool management</p>
                                            <h2 className="mt-1 text-xl font-black text-slate-900">Fund pools</h2>
                                        </div>
                                        <button type="button" onClick={openCreatePoolModal} className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#065F46] shadow-sm transition hover:bg-amber-400">
                                            <Plus className="h-4 w-4" />
                                            Add pool
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="min-w-full text-left">
                                            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                                                <tr>
                                                    <th className="px-3 py-2.5 font-semibold">Pool</th>
                                                    <th className="px-3 py-2.5 font-semibold">Description</th>
                                                    <th className="px-3 py-2.5 font-semibold">Unit cost</th>
                                                    <th className="px-3 py-2.5 font-semibold">Raised</th>
                                                    <th className="px-3 py-2.5 font-semibold">Status</th>
                                                    <th className="px-3 py-2.5 font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                                                {pools.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-5 py-6 text-center text-sm text-slate-500">No fund pools yet.</td>
                                                    </tr>
                                                ) : pools.map((pool) => (
                                                    <tr key={pool.id} className="hover:bg-slate-50">
                                                        <td className="px-3 py-2.5">
                                                            <div className="font-semibold text-slate-900">{pool.title_mm || pool.title_en}</div>
                                                            <div className="text-xs text-slate-500">{pool.title_en}</div>
                                                        </td>
                                                        <td className="px-3 py-2.5">{pool.description || 'No description yet.'}</td>
                                                        <td className="px-3 py-2.5">{currency.format(Number(pool.unit_cost) || 0)}</td>
                                                        <td className="px-3 py-2.5 font-bold text-emerald-700">{currency.format(Number(pool.total_raised) || 0)}</td>
                                                        <td className="px-3 py-2.5">
                                                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${pool.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                                {pool.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex flex-col gap-2">
                                                                <button type="button" onClick={() => startPoolEdit(pool)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Edit</button>
                                                                <button type="button" onClick={() => router.patch(route('admin.fund-pools.update', pool.id), { title_mm: pool.title_mm, title_en: pool.title_en, description: pool.description || '', unit_cost: pool.unit_cost, is_active: !pool.is_active }, { preserveScroll: true })} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">{pool.is_active ? 'Disable' : 'Enable'}</button>
                                                                <button type="button" onClick={() => router.delete(route('admin.fund-pools.destroy', pool.id), { preserveScroll: true })} className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Delete</button>
                                                            </div>
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
