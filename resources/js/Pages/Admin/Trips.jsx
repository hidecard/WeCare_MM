import { Head, Link, router, useForm } from '@inertiajs/react';
import { BarChart3, ChevronLeft, ChevronRight, FileText, LayoutDashboard, MapPinned, Menu, ShieldAlert, Users, X } from 'lucide-react';
import { useState } from 'react';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

const formatDisplayDate = (value) => {
    if (!value) return '—';

    const safeDate = typeof value === 'string' && value.includes('T') ? value : `${value}T12:00:00`;
    const parsed = new Date(safeDate);

    if (Number.isNaN(parsed.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(parsed);
};

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

export default function Trips({ trips = [] }) {
    const normalizedTrips = Array.isArray(trips) ? { data: trips, links: [] } : (trips ?? {});
    const rows = normalizedTrips.data ?? [];
    const pagination = normalizedTrips;

    const getTripImages = (trip) => {
        if (!Array.isArray(trip?.photos_json)) {
            return [];
        }

        return trip.photos_json.filter((photo) => typeof photo === 'string' && photo.trim()).slice(0, 4);
    };

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTripId, setEditingTripId] = useState(null);
    const tripForm = useForm({
        trip_date: '',
        township: '',
        elderly_helped_count: 0,
        meals_distributed: 0,
        medical_aid_count: 0,
        total_spent: 0,
        summary_note: '',
        photos: [],
        receipt_images: [],
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
        tripForm.reset();
        setEditingTripId(null);
        setIsFormOpen(false);
    };

    const openCreateTripModal = () => {
        tripForm.reset();
        setEditingTripId(null);
        setIsFormOpen(true);
    };

    const startTripEdit = (trip) => {
        setEditingTripId(trip.id);
        tripForm.setData({
            trip_date: trip.trip_date ?? '',
            township: trip.township ?? '',
            elderly_helped_count: trip.elderly_helped_count ?? 0,
            meals_distributed: trip.meals_distributed ?? 0,
            medical_aid_count: trip.medical_aid_count ?? 0,
            total_spent: trip.total_spent ?? 0,
            summary_note: trip.summary_note ?? '',
            photos: [],
            receipt_images: [],
        });
        setIsFormOpen(true);
    };

    const addFilesToField = (fieldName, files) => {
        const incomingFiles = Array.from(files || []);
        if (incomingFiles.length === 0) {
            return;
        }

        const currentFiles = Array.isArray(tripForm.data[fieldName]) ? tripForm.data[fieldName] : [];
        tripForm.setData(fieldName, [...currentFiles, ...incomingFiles]);
    };

    const handleTripSubmit = (event) => {
        event.preventDefault();

        const payload = {
            trip_date: tripForm.data.trip_date,
            township: tripForm.data.township,
            elderly_helped_count: Number(tripForm.data.elderly_helped_count || 0),
            meals_distributed: Number(tripForm.data.meals_distributed || 0),
            medical_aid_count: Number(tripForm.data.medical_aid_count || 0),
            total_spent: Number(tripForm.data.total_spent || 0),
            summary_note: tripForm.data.summary_note,
            photos: tripForm.data.photos,
            receipt_images: tripForm.data.receipt_images,
        };

        if (editingTripId) {
            router.patch(route('admin.outreach-trips.update', editingTripId), payload, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: closeModal,
            });
            return;
        }

        tripForm.post(route('admin.outreach-trips.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: closeModal,
        });
    };

    const handlePageChange = (pageUrl) => {
        if (!pageUrl) return;
        router.get(pageUrl, { preserveScroll: true });
    };

    const summaryPills = [
        { label: 'Trips logged', value: String(rows.length), tone: 'emerald' },
        { label: 'Avg. spend', value: currency.format(Number(rows.reduce((sum, trip) => sum + Number(trip.total_spent || 0), 0) / Math.max(rows.length, 1)) || 0), tone: 'amber' },
        { label: 'People reached', value: String(rows.reduce((sum, trip) => sum + Number(trip.elderly_helped_count || 0), 0)), tone: 'sky' },
    ];

    return (
        <>
            <Head title="Trip Tracker" />

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">{editingTripId ? 'Edit' : 'Create'}</p>
                                <h2 className="mt-1 text-xl font-black text-slate-900">{editingTripId ? 'Update outreach trip' : 'Log outreach trip'}</h2>
                            </div>
                            <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:text-slate-700">
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form onSubmit={handleTripSubmit} className="space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Trip date</span>
                                    <input type="date" value={tripForm.data.trip_date} onChange={(event) => tripForm.setData('trip_date', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Township</span>
                                    <input value={tripForm.data.township} onChange={(event) => tripForm.setData('township', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="Insein" />
                                </label>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Elderly helped</span>
                                    <input type="number" min="0" value={tripForm.data.elderly_helped_count} onChange={(event) => tripForm.setData('elderly_helped_count', Number(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Total spent</span>
                                    <input type="number" min="0" step="100" value={tripForm.data.total_spent} onChange={(event) => tripForm.setData('total_spent', Number(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                                </label>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Meals distributed</span>
                                    <input type="number" min="0" value={tripForm.data.meals_distributed} onChange={(event) => tripForm.setData('meals_distributed', Number(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Medical aid count</span>
                                    <input type="number" min="0" value={tripForm.data.medical_aid_count} onChange={(event) => tripForm.setData('medical_aid_count', Number(event.target.value))} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                                </label>
                            </div>
                            <label className="block">
                                <span className="mb-1.5 block text-xs font-semibold text-slate-600">Summary note</span>
                                <textarea value={tripForm.data.summary_note} onChange={(event) => tripForm.setData('summary_note', event.target.value)} rows="3" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" placeholder="Meals, medicine and checks completed..." />
                            </label>
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Photos</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(event) => {
                                            addFilesToField('photos', event.target.files);
                                            event.target.value = '';
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1.5 block text-xs font-semibold text-slate-600">Receipts</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(event) => {
                                            addFilesToField('receipt_images', event.target.files);
                                            event.target.value = '';
                                        }}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm"
                                    />
                                </label>
                            </div>

                            {tripForm.data.photos.length > 0 && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">Selected photos</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from(tripForm.data.photos).slice(0, 4).map((photo, index) => (
                                            <div key={`${photo.name || 'photo'}-${index}`} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-[10px] font-semibold text-slate-600">
                                                <img src={URL.createObjectURL(photo)} alt={photo.name} className="h-full w-full object-cover" />
                                            </div>
                                        ))}
                                        {tripForm.data.photos.length > 4 && (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-[10px] font-bold text-slate-600">
                                                +{tripForm.data.photos.length - 4}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={closeModal} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">Cancel</button>
                                <button type="submit" disabled={tripForm.processing} className="rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#065F46] hover:bg-amber-400 disabled:opacity-60">
                                    {editingTripId ? 'Save changes' : 'Create trip'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                    className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium transition ${href === route('admin.trips.index') ? 'border-emerald-300/30 bg-emerald-500/15 text-white shadow-inner shadow-emerald-900/20' : 'border-white/10 bg-white/5 text-emerald-50/80 hover:bg-white/10 hover:text-white'}`}
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
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Field log</p>
                                        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Trip tracker</h1>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Link href={route('admin.dashboard')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700">Dashboard</Link>
                                    <Link href={route('home')} className="rounded-full bg-[#F59E0B] px-4 py-2 text-sm font-bold text-[#065F46] shadow-sm transition hover:bg-amber-400">Home</Link>
                                </div>
                            </div>
                        </header>

                        <main className="p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl">
                                <div className="mb-5 grid gap-3 md:grid-cols-3">
                                    {summaryPills.map(({ label, value, tone }) => (
                                        <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
                                            <p className={`mt-2 text-2xl font-black ${tone === 'amber' ? 'text-amber-700' : tone === 'emerald' ? 'text-emerald-700' : 'text-sky-700'}`}>
                                                {value}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Trip log</p>
                                            <h2 className="mt-1 text-2xl font-black text-slate-900">Street outreach records</h2>
                                        </div>
                                        <button type="button" onClick={openCreateTripModal} className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#065F46] shadow-sm transition hover:bg-amber-400">
                                            <MapPinned className="h-4 w-4" />
                                            Add trip
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                                        <table className="min-w-full text-left">
                                            <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Date</th>
                                                    <th className="px-4 py-3 font-semibold">Township</th>
                                                    <th className="px-4 py-3 font-semibold">Elderly</th>
                                                    <th className="px-4 py-3 font-semibold">Meals</th>
                                                    <th className="px-4 py-3 font-semibold">Medical</th>
                                                    <th className="px-4 py-3 font-semibold">Spent</th>
                                                    <th className="px-4 py-3 font-semibold">Photos</th>
                                                    <th className="px-4 py-3 font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                                                {rows.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="8" className="px-5 py-8 text-center text-sm text-slate-500">No outreach trips recorded yet.</td>
                                                    </tr>
                                                ) : rows.map((trip) => {
                                                    const tripPhotos = getTripImages(trip);

                                                    return (
                                                        <tr key={trip.id} className="hover:bg-slate-50/80">
                                                            <td className="px-4 py-3 font-semibold text-slate-900">{formatDisplayDate(trip.trip_date)}</td>
                                                            <td className="px-4 py-3">{trip.township}</td>
                                                            <td className="px-4 py-3">{trip.elderly_helped_count}</td>
                                                            <td className="px-4 py-3">{trip.meals_distributed}</td>
                                                            <td className="px-4 py-3">{trip.medical_aid_count}</td>
                                                            <td className="px-4 py-3">{currency.format(Number(trip.total_spent || 0))}</td>
                                                            <td className="px-4 py-3">
                                                                {tripPhotos.length > 0 ? (
                                                                    <div className="flex -space-x-2">
                                                                        {tripPhotos.map((photo, index) => (
                                                                            <img
                                                                                key={`${trip.id}-${index}`}
                                                                                src={photo.startsWith('http') ? photo : `/storage/${photo}`}
                                                                                alt={`${trip.township} photo ${index + 1}`}
                                                                                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs text-slate-400">No photos</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-2">
                                                                    <button type="button" onClick={() => startTripEdit(trip)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">Edit</button>
                                                                    <button type="button" onClick={() => router.delete(route('admin.outreach-trips.destroy', trip.id), { preserveScroll: true })} className="rounded-full bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Delete</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
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
