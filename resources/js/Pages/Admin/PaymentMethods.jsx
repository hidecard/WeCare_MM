import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, CreditCard, Pencil, Plus, Trash2, Upload, XCircle } from 'lucide-react';
import { useState } from 'react';

const emptyForm = {
    name: '',
    account_name: '',
    account_number: '',
    qr_image: null,
    is_active: true,
    sort_order: 0,
};

export default function PaymentMethods({ paymentMethods = [] }) {
    const [editingId, setEditingId] = useState(null);
    const form = useForm(emptyForm);

    const resetForm = () => {
        setEditingId(null);
        form.reset();
        form.setData(emptyForm);
    };

    const startEdit = (method) => {
        setEditingId(method.id);
        form.setData({
            name: method.name,
            account_name: method.account_name || '',
            account_number: method.account_number,
            qr_image: null,
            is_active: Boolean(method.is_active),
            sort_order: method.sort_order || 0,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const submit = (event) => {
        event.preventDefault();
        const url = editingId
            ? route('admin.payment-methods.update', editingId)
            : route('admin.payment-methods.store');
        form.transform((data) => ({ ...data, _method: editingId ? 'patch' : undefined })).submit('post', url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: resetForm,
        });
    };

    return (
        <>
            <Head title="Payment Methods" />
            <div className="min-h-screen bg-[#FFFBEB] text-slate-800">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">WeCare Myanmar</p>
                            <h1 className="mt-1 text-2xl font-black text-slate-900">Payment methods</h1>
                        </div>
                        <Link href={route('admin.management')} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                            <ArrowLeft className="h-4 w-4" /> Management
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
                    <section className="rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{editingId ? 'Edit' : 'Create'}</p>
                                <h2 className="mt-2 text-2xl font-black text-slate-900">{editingId ? 'Update payment account' : 'Add payment account'}</h2>
                                <p className="mt-1 text-sm text-slate-500">Only active methods are shown to donors.</p>
                            </div>
                            <CreditCard className="h-6 w-6 text-emerald-700" />
                        </div>

                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2" encType="multipart/form-data">
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-600">Payment name</span>
                                <input required value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="KBZPay" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-600">Account name</span>
                                <input value={form.data.account_name} onChange={(event) => form.setData('account_name', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="WeCare Myanmar" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-600">Account number / phone</span>
                                <input required value={form.data.account_number} onChange={(event) => form.setData('account_number', event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" placeholder="09xxxxxxxxx" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-600">QR image</span>
                                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => form.setData('qr_image', event.target.files?.[0] || null)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" />
                            </label>
                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-600">Display order</span>
                                <input type="number" min="0" value={form.data.sort_order} onChange={(event) => form.setData('sort_order', Number(event.target.value))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm" />
                            </label>
                            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-600">
                                <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} className="h-5 w-5 rounded border-slate-300 text-emerald-700" />
                                Active — show to donors
                            </label>
                            <div className="flex gap-3 md:col-span-2">
                                <button type="submit" disabled={form.processing} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-4 py-3 text-sm font-bold text-[#065F46] disabled:opacity-60">
                                    {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                    {editingId ? 'Update payment method' : 'Add payment method'}
                                </button>
                                {editingId && <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"><XCircle className="h-4 w-4" /> Cancel</button>}
                            </div>
                        </form>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2">
                        {paymentMethods.length === 0 ? (
                            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 md:col-span-2">No payment methods yet. Add the first verified account above.</div>
                        ) : paymentMethods.map((method) => (
                            <article key={method.id} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-black text-slate-900">{method.name}</h3>
                                            {method.is_active ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <XCircle className="h-5 w-5 text-slate-400" />}
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">{method.account_name || 'No account name'}</p>
                                        <p className="mt-3 text-lg font-bold text-emerald-800">{method.account_number}</p>
                                    </div>
                                    {method.qr_url && <img src={method.qr_url} alt={`${method.name} QR`} className="h-28 w-28 rounded-xl border border-slate-200 bg-white object-contain p-1" />}
                                </div>
                                <div className="mt-5 flex gap-2">
                                    <button type="button" onClick={() => startEdit(method)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"><Pencil className="h-4 w-4" /> Edit</button>
                                    <button type="button" onClick={() => window.confirm(`Delete ${method.name}?`) && router.delete(route('admin.payment-methods.destroy', method.id), { preserveScroll: true })} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"><Trash2 className="h-4 w-4" /> Delete</button>
                                </div>
                            </article>
                        ))}
                    </section>
                </main>
            </div>
        </>
    );
}
