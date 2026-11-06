import { Head, Link, router, useForm } from '@inertiajs/react';
import { BarChart3, ChevronLeft, ChevronRight, FileText, LayoutDashboard, MapPinned, Menu, ShieldAlert, Users, X } from 'lucide-react';
import { useState } from 'react';

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

export default function Volunteers({ volunteers = [] }) {
    const normalizedVolunteers = Array.isArray(volunteers) ? { data: volunteers, links: [] } : (volunteers ?? {});
    const rows = normalizedVolunteers.data ?? [];
    const pagination = normalizedVolunteers;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVolunteerId, setEditingVolunteerId] = useState(null);
    const volunteerForm = useForm({
        name: '',
        phone: '',
        township: '',
        available_days: 'Weekdays',
        status: 'available',
    });

    const navItems = [
        { name: 'Overview', href: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert },
        { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned },
        { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText },
        { name: 'Fund Pools', href: route('admin.fund-pools.index'), icon: BarChart3 },
        { name: 'Volunteers', href: route('admin.volunteers.index'), icon: Users },
    ];

    const closeModal = () => {
        volunteerForm.reset();
        setEditingVolunteerId(null);
        setIsFormOpen(false);
    };

    const resetVolunteerForm = () => {
        closeModal();
    };

    const openCreateVolunteerModal = () => {
        volunteerForm.reset();
        setEditingVolunteerId(null);
        setIsFormOpen(true);
    };

    const startVolunteerEdit = (volunteer) => {
        setEditingVolunteerId(volunteer.id);
        volunteerForm.setData({
            name: volunteer.name ?? '',
            phone: volunteer.phone ?? '',
            township: volunteer.township ?? '',
            available_days: volunteer.available_days ?? 'Weekdays',
            status: volunteer.status ?? 'available',
        });
        setIsFormOpen(true);
    };

    const handleVolunteerSubmit = (event) => {
        event.preventDefault();

        const payload = {
            name: volunteerForm.data.name,
            phone: volunteerForm.data.phone,
            township: volunteerForm.data.township,
            available_days: volunteerForm.data.available_days,
            status: volunteerForm.data.status,
        };

        if (editingVolunteerId) {
            router.patch(route('admin.volunteers.update', editingVolunteerId), payload, {
                preserveScroll: true,
                onSuccess: resetVolunteerForm,
            });
            return;
        }

        volunteerForm.post(route('admin.volunteers.store'), {
            preserveScroll: true,
            onSuccess: resetVolunteerForm,
        });
    };

    const handlePageChange = (pageUrl) => {
        if (!pageUrl) return;
        router.get(pageUrl, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Volunteers" />

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">{editingVolunteerId ? 'Edit' : 'Create'}</p>
                                <h2 className="mt-1 text-xl font-black text-slate-900">{editingVolunteerId ? 'Update volunteer' : 'Register volunteer'}</h2>
                            </div>
                            <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleVolunteerSubmit} className="space-y-3">
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Name</span>
                                <input value={volunteerForm.data.name} onChange={(event) => volunteerForm.setData('name', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="Volunteer name" />
                            </label>
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Phone</span>
                                    <input value={volunteerForm.data.phone} onChange={(event) => volunteerForm.setData('phone', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="09..." />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Township</span>
                                    <input value={volunteerForm.data.township} onChange={(event) => volunteerForm.setData('township', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="Insein" />
                                </label>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Available days</span>
                                    <input value={volunteerForm.data.available_days} onChange={(event) => volunteerForm.setData('available_days', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="Weekdays" />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Status</span>
                                    <select value={volunteerForm.data.status} onChange={(event) => volunteerForm.setData('status', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm">
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="off">Off</option>
                                    </select>
                                </label>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">Cancel</button>
                                <button type="submit" disabled={volunteerForm.processing} className="rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#065F46] hover:bg-amber-400 disabled:opacity-60">
                                    {editingVolunteerId ? 'Save changes' : 'Create volunteer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-[#FFFBEB] text-slate-800">
                <div className="flex min-h-screen">
                    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-emerald-800/20 bg-[#065F46] p-4 text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
                                        <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Roster</p>
                                        <h1 className="text-xl font-black text-slate-900">Volunteers</h1>
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
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Volunteer roster</p>
                                            <h2 className="mt-1 text-xl font-black text-slate-900">Members</h2>
                                        </div>
                                        <button type="button" onClick={openCreateVolunteerModal} className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#065F46] shadow-sm transition hover:bg-amber-400">
                                            <Users className="h-4 w-4" />
                                            Add volunteer
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="min-w-full text-left">
                                            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                                                <tr>
                                                    <th className="px-3 py-2.5 font-semibold">Name</th>
                                                    <th className="px-3 py-2.5 font-semibold">Phone</th>
                                                    <th className="px-3 py-2.5 font-semibold">Township</th>
                                                    <th className="px-3 py-2.5 font-semibold">Available Days</th>
                                                    <th className="px-3 py-2.5 font-semibold">Status</th>
                                                    <th className="px-3 py-2.5 font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                                                {rows.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-5 py-6 text-center text-sm text-slate-500">No volunteers yet.</td>
                                                    </tr>
                                                ) : rows.map((volunteer) => (
                                                    <tr key={volunteer.id} className="hover:bg-slate-50">
                                                        <td className="px-3 py-2.5 font-semibold text-slate-900">{volunteer.name}</td>
                                                        <td className="px-3 py-2.5">{volunteer.phone || '—'}</td>
                                                        <td className="px-3 py-2.5">{volunteer.township}</td>
                                                        <td className="px-3 py-2.5">{volunteer.available_days || 'Not set'}</td>
                                                        <td className="px-3 py-2.5">
                                                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${volunteer.status === 'available' ? 'bg-emerald-100 text-emerald-700' : volunteer.status === 'busy' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                                                                {volunteer.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5">
                                                            <div className="flex flex-col gap-2">
                                                                <button type="button" onClick={() => startVolunteerEdit(volunteer)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Edit</button>
                                                                <button type="button" onClick={() => router.patch(route('admin.volunteers.update', volunteer.id), { name: volunteer.name, phone: volunteer.phone || '', township: volunteer.township, available_days: volunteer.available_days || 'Weekdays', status: volunteer.status === 'available' ? 'busy' : 'available' }, { preserveScroll: true })} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">{volunteer.status === 'available' ? 'Mark busy' : 'Mark available'}</button>
                                                                <button type="button" onClick={() => router.delete(route('admin.volunteers.destroy', volunteer.id), { preserveScroll: true })} className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Delete</button>
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
