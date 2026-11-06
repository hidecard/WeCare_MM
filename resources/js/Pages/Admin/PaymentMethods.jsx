import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    FileText,
    LayoutDashboard,
    MapPinned,
    Menu,
    Pencil,
    Plus,
    ShieldAlert,
    Trash2,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const emptyForm = {
    name: '',
    account_name: '',
    account_number: '',
    qr_image: null,
    remove_qr_image: false,
    is_active: true,
    sort_order: 0,
};

const ErrorMessage = ({ message }) => (
    message ? <p className="mt-1 text-xs font-semibold text-red-600" role="alert">{message}</p> : null
);

export default function PaymentMethods({ paymentMethods = [] }) {
    const [editingId, setEditingId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash = {} } = usePage().props;
    const form = useForm(emptyForm);
    const editingMethod = paymentMethods.find((method) => method.id === editingId);

    const navItems = [
        { name: 'Overview', href: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Donation Review', href: route('admin.donations.index'), icon: ShieldAlert },
        { name: 'Donation List', href: route('admin.donations.list'), icon: FileText },
        { name: 'Trip Tracker', href: route('admin.trips.index'), icon: MapPinned },
        { name: 'Spot Reports', href: route('admin.reports.index'), icon: FileText },
        { name: 'Fund Pools', href: route('admin.fund-pools.index'), icon: BarChart3 },
        { name: 'Volunteers', href: route('admin.volunteers.index'), icon: Users },
        { name: 'Payment Methods', href: route('admin.payment-methods.index'), icon: CreditCard },
    ];

    const resetForm = () => {
        setEditingId(null);
        form.reset();
        form.clearErrors();
        form.setData({ ...emptyForm });
    };

    const startEdit = (method) => {
        setEditingId(method.id);
        form.clearErrors();
        form.setData({
            name: method.name,
            account_name: method.account_name || '',
            account_number: method.account_number,
            qr_image: null,
            remove_qr_image: false,
            is_active: Boolean(method.is_active),
            sort_order: Number(method.sort_order) || 0,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (event) => {
        event.preventDefault();
        const url = editingId
            ? route('admin.payment-methods.update', editingId)
            : route('admin.payment-methods.store');

        form.transform((data) => ({ ...data, _method: editingId ? 'patch' : undefined }));
        form.post(url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    const deleteMethod = (method) => {
        if (window.confirm(`Delete ${method.name}? This also removes its QR image.`)) {
            router.delete(route('admin.payment-methods.destroy', method.id), { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Payment Methods" />
            <div className="min-h-screen bg-slate-100 text-slate-800">
                <div className="flex min-h-screen">
                    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-emerald-900/10 bg-[#0b3b2f] p-4 text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-200">WeCare</p>
                                <h2 className="mt-2 text-xl font-black">Admin Panel</h2>
                            </div>
                            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-full border border-white/15 p-2 md:hidden" aria-label="Close admin menu">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </div>
                        <nav className="mt-6 space-y-2" aria-label="Admin navigation">
                            {navItems.map(({ name, href, icon: Icon }) => (
                                <Link
                                    key={name}
                                    href={href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium transition ${name === 'Payment Methods' ? 'border-emerald-300/30 bg-emerald-500/15 text-white' : 'border-white/10 bg-white/5 text-emerald-50/80 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{name}</span>
                                    <ChevronRight className="h-4 w-4 text-emerald-200" />
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
                            <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-8">
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 md:hidden" aria-label="Open admin menu">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Admin settings</p>
                                        <h1 className="text-xl font-black text-slate-900 md:text-2xl">Payment methods</h1>
                                    </div>
                                </div>
                                <div className="flex gap-2 sm:gap-3">
                                    <Link href={route('admin.management')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:px-4 sm:text-sm">Management</Link>
                                    <Link href={route('home')} className="rounded-full bg-[#F59E0B] px-3 py-2 text-xs font-bold text-[#065F46] sm:px-4 sm:text-sm">Home</Link>
                                </div>
                            </div>
                        </header>

                        <main className="p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl space-y-6">
                                {flash.success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800" role="status">{flash.success}</div>}

                                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">{editingId ? 'Edit existing method' : 'Create new method'}</p>
                                            <h2 className="mt-2 text-2xl font-black text-slate-900">{editingId ? `Update ${editingMethod?.name || 'payment method'}` : 'Add a payment account'}</h2>
                                            <p className="mt-1 text-sm text-slate-500">Active methods appear in the donor payment form.</p>
                                        </div>
                                        <CreditCard className="hidden h-7 w-7 text-emerald-700 sm:block" />
                                    </div>

                                    <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" encType="multipart/form-data" noValidate>
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">Payment name <span className="text-red-600">*</span></span>
                                            <input required maxLength="100" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} aria-invalid={Boolean(form.errors.name)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="e.g. KBZPay, WavePay, or a new method" />
                                            <ErrorMessage message={form.errors.name} />
                                        </label>
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">Account name</span>
                                            <input maxLength="255" value={form.data.account_name} onChange={(event) => form.setData('account_name', event.target.value)} aria-invalid={Boolean(form.errors.account_name)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="WeCare Myanmar" />
                                            <ErrorMessage message={form.errors.account_name} />
                                        </label>
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">Account number / phone <span className="text-red-600">*</span></span>
                                            <input required maxLength="100" value={form.data.account_number} onChange={(event) => form.setData('account_number', event.target.value)} aria-invalid={Boolean(form.errors.account_number)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" placeholder="09xxxxxxxxx" />
                                            <ErrorMessage message={form.errors.account_number} />
                                        </label>
                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">QR image (PNG, JPG, WEBP; max 4 MB)</span>
                                            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => {
                                                form.setData('qr_image', event.target.files?.[0] || null);
                                                if (event.target.files?.[0]) form.setData('remove_qr_image', false);
                                            }} aria-invalid={Boolean(form.errors.qr_image)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:font-semibold file:text-emerald-800" />
                                            <ErrorMessage message={form.errors.qr_image} />
                                        </label>

                                        {editingMethod?.qr_url && (
                                            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                                                <img src={editingMethod.qr_url} alt={`${editingMethod.name} current QR code`} className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-contain p-1" />
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700">Current QR code</p>
                                                    <label className="mt-2 inline-flex items-center gap-2 text-sm text-red-700">
                                                        <input type="checkbox" checked={form.data.remove_qr_image} onChange={(event) => form.setData('remove_qr_image', event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-red-600" />
                                                        Remove current QR image
                                                    </label>
                                                </div>
                                            </div>
                                        )}

                                        <label className="block">
                                            <span className="mb-2 block text-sm font-semibold text-slate-700">Display order</span>
                                            <input type="number" min="0" max="9999" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} aria-invalid={Boolean(form.errors.sort_order)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
                                            <ErrorMessage message={form.errors.sort_order} />
                                        </label>
                                        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700">
                                            <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-emerald-700" />
                                            Active — show this payment method to donors
                                        </label>
                                        <ErrorMessage message={form.errors.is_active} />

                                        <div className="flex gap-3 md:col-span-2">
                                            <button type="submit" disabled={form.processing} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-4 py-3 text-sm font-bold text-[#065F46] hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60">
                                                {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                {form.processing ? 'Saving…' : editingId ? 'Save changes' : 'Add payment method'}
                                            </button>
                                            {editingId && <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"><XCircle className="h-4 w-4" /> Cancel</button>}
                                        </div>
                                    </form>
                                </section>

                                <section>
                                    <div className="mb-4 flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700">Payment accounts</p>
                                            <h2 className="mt-1 text-xl font-black text-slate-900">{paymentMethods.length} method{paymentMethods.length === 1 ? '' : 's'} configured</h2>
                                        </div>
                                    </div>
                                    {paymentMethods.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No payment methods yet. Add the first donor payment account above.</div>
                                    ) : (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {paymentMethods.map((method) => (
                                                <article key={method.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="break-words text-xl font-black text-slate-900">{method.name}</h3>
                                                                {method.is_active ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-800"><CheckCircle2 className="h-3.5 w-3.5" /> Active</span> : <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500"><XCircle className="h-3.5 w-3.5" /> Hidden</span>}
                                                            </div>
                                                            <p className="mt-2 text-sm text-slate-500">Account name: {method.account_name || 'Not set'}</p>
                                                            <p className="mt-2 break-all text-lg font-bold text-emerald-800">{method.account_number}</p>
                                                            <p className="mt-2 text-xs text-slate-500">Display order: {method.sort_order}</p>
                                                        </div>
                                                        {method.qr_url && <img src={method.qr_url} alt={`${method.name} QR code`} className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1" />}
                                                    </div>
                                                    <div className="mt-5 flex gap-2">
                                                        <button type="button" onClick={() => startEdit(method)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil className="h-4 w-4" /> Edit</button>
                                                        <button type="button" onClick={() => deleteMethod(method)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"><Trash2 className="h-4 w-4" /> Delete</button>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
