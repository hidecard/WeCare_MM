import { Head, Link, router, useForm } from '@inertiajs/react';
import { BarChart3, ChevronLeft, ChevronRight, CreditCard, FileText, MapPinned, PencilLine, Plus, ShieldAlert, Trash2, UserRound, Users } from 'lucide-react';
import { useState } from 'react';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

export default function Management({ fundPools = [], volunteers = [], stats = {} }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const poolForm = useForm({
        title_mm: '',
        title_en: '',
        description: '',
        unit_cost: 5000,
        is_active: true,
    });

    const volunteerForm = useForm({
        name: '',
        phone: '',
        township: '',
        available_days: 'Weekdays',
        status: 'available',
    });

    const handlePoolSubmit = (event) => {
        event.preventDefault();
        poolForm.post(route('admin.fund-pools.store'), {
            preserveScroll: true,
            onSuccess: () => poolForm.reset(),
        });
    };

    const handleVolunteerSubmit = (event) => {
        event.preventDefault();
        volunteerForm.post(route('admin.volunteers.store'), {
            preserveScroll: true,
            onSuccess: () => volunteerForm.reset(),
        });
    };

    const togglePoolStatus = (pool) => {
        router.patch(route('admin.fund-pools.update', pool.id), {
            title_mm: pool.title_mm,
            title_en: pool.title_en,
            description: pool.description || '',
            unit_cost: pool.unit_cost,
            is_active: !pool.is_active,
        }, { preserveScroll: true });
    };

    const toggleVolunteerStatus = (volunteer) => {
        const nextStatus = volunteer.status === 'available' ? 'busy' : 'available';
        router.patch(route('admin.volunteers.update', volunteer.id), {
            name: volunteer.name,
            phone: volunteer.phone,
            township: volunteer.township,
            available_days: volunteer.available_days,
            status: nextStatus,
        }, { preserveScroll: true });
    };

    const navItems = [
        { name: 'Overview', href: route('admin.dashboard'), icon: BarChart3 },
        { name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert },
        { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned },
        { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText },
        { name: 'Fund Pools', href: route('admin.fund-pools.index'), icon: BarChart3 },
        { name: 'Volunteers', href: route('admin.volunteers.index'), icon: Users },
        { name: 'Payment Methods', href: route('admin.payment-methods.index'), icon: CreditCard },
    ];

    return (
        <>
            <Head title="Admin Management" />
            <div className="min-h-screen bg-[#FFFBEB] text-slate-800">
                <div className="flex min-h-screen">
                    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-emerald-800/20 bg-[#065F46] p-4 text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">WeCare</p>
                                <h2 className="mt-1 text-xl font-black">Management</h2>
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
                                        ☰
                                    </button>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Operations</p>
                                        <h1 className="text-2xl font-black text-slate-900">Management Center</h1>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={route('admin.dashboard')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Dashboard</Link>
                                    <Link href={route('home')} className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#065F46]">Home</Link>
                                </div>
                            </div>
                        </header>

                        <main className="p-4 md:p-8">
                            <div className="mx-auto max-w-7xl space-y-8">
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Pools</p>
                                        <p className="mt-3 text-3xl font-black text-slate-900">{stats.total_fund_pools ?? fundPools.length}</p>
                                    </div>
                                    <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Volunteers</p>
                                        <p className="mt-3 text-3xl font-black text-slate-900">{volunteers.length}</p>
                                    </div>
                                    <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-4 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Raised</p>
                                        <p className="mt-3 text-2xl font-black text-slate-900">{currency.format(Number(stats.total_raised) || 0)}</p>
                                    </div>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Create</p>
                                                <h2 className="mt-2 text-2xl font-black text-slate-900">Fund pool management</h2>
                                            </div>
                                            <Plus className="h-5 w-5 text-emerald-700" />
                                        </div>

                                        <form onSubmit={handlePoolSubmit} className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <label className="block">
                                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Myanmar title</span>
                                                    <input value={poolForm.data.title_mm} onChange={(event) => poolForm.setData('title_mm', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="မုန့်စားစရိတ်" />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-2 block text-sm font-semibold text-slate-600">English title</span>
                                                    <input value={poolForm.data.title_en} onChange={(event) => poolForm.setData('title_en', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Daily Meals" />
                                                </label>
                                            </div>
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-slate-600">Description</span>
                                                <textarea value={poolForm.data.description} onChange={(event) => poolForm.setData('description', event.target.value)} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="General food support for elderly outreach" />
                                            </label>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <label className="block">
                                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Unit cost</span>
                                                    <input type="number" min="1000" step="500" value={poolForm.data.unit_cost} onChange={(event) => poolForm.setData('unit_cost', Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                                                </label>
                                                <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                                                    <span className="text-sm font-semibold text-slate-600">Active</span>
                                                    <input type="checkbox" checked={poolForm.data.is_active} onChange={(event) => poolForm.setData('is_active', event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-[#F59E0B]" />
                                                </label>
                                            </div>
                                            <button type="submit" disabled={poolForm.processing} className="w-full rounded-full bg-[#F59E0B] px-4 py-3 text-sm font-bold text-[#065F46] hover:bg-amber-400 disabled:opacity-60">Create fund pool</button>
                                        </form>

                                        <div className="mt-6 space-y-3">
                                            {fundPools.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">No fund pools yet.</div>
                                            ) : fundPools.map((pool) => (
                                                <div key={pool.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-lg font-black text-slate-900">{pool.title_mm || pool.title_en}</p>
                                                            <p className="text-xs text-slate-500">{pool.title_en}</p>
                                                        </div>
                                                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${pool.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                            {pool.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <p className="mt-3 text-sm text-slate-600">{pool.description || 'No description yet.'}</p>
                                                    <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                                                        <span>Unit cost: {currency.format(Number(pool.unit_cost) || 0)}</span>
                                                        <span>{currency.format(Number(pool.total_raised) || 0)} raised</span>
                                                    </div>
                                                    <div className="mt-4 flex gap-2">
                                                        <button type="button" onClick={() => togglePoolStatus(pool)} className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">{pool.is_active ? 'Disable' : 'Enable'}</button>
                                                        <button type="button" onClick={() => router.delete(route('admin.fund-pools.destroy', pool.id))} className="flex-1 rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Roster</p>
                                                <h2 className="mt-2 text-2xl font-black text-slate-900">Volunteer coordination</h2>
                                            </div>
                                            <Users className="h-5 w-5 text-emerald-700" />
                                        </div>

                                        <form onSubmit={handleVolunteerSubmit} className="space-y-4">
                                            <label className="block">
                                                <span className="mb-2 block text-sm font-semibold text-slate-600">Name</span>
                                                <input value={volunteerForm.data.name} onChange={(event) => volunteerForm.setData('name', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Volunteer name" />
                                            </label>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <label className="block">
                                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Phone</span>
                                                    <input value={volunteerForm.data.phone} onChange={(event) => volunteerForm.setData('phone', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="09..." />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Township</span>
                                                    <input value={volunteerForm.data.township} onChange={(event) => volunteerForm.setData('township', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Insein" />
                                                </label>
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <label className="block">
                                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Available days</span>
                                                    <input value={volunteerForm.data.available_days} onChange={(event) => volunteerForm.setData('available_days', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="Weekdays / Weekends" />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-2 block text-sm font-semibold text-slate-600">Status</span>
                                                    <select value={volunteerForm.data.status} onChange={(event) => volunteerForm.setData('status', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                                                        <option value="available">Available</option>
                                                        <option value="busy">Busy</option>
                                                        <option value="off">Off</option>
                                                    </select>
                                                </label>
                                            </div>
                                            <button type="submit" disabled={volunteerForm.processing} className="w-full rounded-full bg-[#065F46] px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">Add volunteer</button>
                                        </form>

                                        <div className="mt-6 space-y-3">
                                            {volunteers.length === 0 ? (
                                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">No volunteers registered.</div>
                                            ) : volunteers.map((volunteer) => (
                                                <div key={volunteer.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-lg font-black text-slate-900">{volunteer.name}</p>
                                                            <p className="text-xs text-slate-500">{volunteer.township}</p>
                                                        </div>
                                                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${volunteer.status === 'available' ? 'bg-emerald-100 text-emerald-700' : volunteer.status === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                                            {volunteer.status}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                        <span>{volunteer.phone || 'Phone not set'}</span>
                                                        <span>•</span>
                                                        <span>{volunteer.available_days || 'Flexible'}</span>
                                                    </div>
                                                    <div className="mt-4 flex gap-2">
                                                        <button type="button" onClick={() => toggleVolunteerStatus(volunteer)} className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">Toggle status</button>
                                                        <button type="button" onClick={() => router.delete(route('admin.volunteers.destroy', volunteer.id))} className="flex-1 rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">Remove</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
