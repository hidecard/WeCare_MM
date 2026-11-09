import { router, useForm } from '@inertiajs/react';
import { Archive, PencilLine, Plus, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });
const categoryLabels = {
    food: 'Food',
    medicine: 'Medicine',
    transport: 'Transport',
    supplies: 'Supplies',
    shelter: 'Shelter',
    other: 'Other',
};
const dateValue = (value) => (value ? String(value).slice(0, 10) : '');
const emptyForm = {
    fund_pool_id: '',
    category: 'food',
    amount: '',
    period_start: '',
    period_end: '',
    reviewer_id: '',
    note: '',
    receipt: null,
};

const pagination = (page, onPage) => (page?.links?.length ? (
    <div className="mt-5 flex flex-wrap justify-center gap-2">
        {page.links.map((link, index) => (
            <button key={index} type="button" disabled={!link.url} onClick={() => onPage(link.url)} className={`rounded-full border px-3 py-2 text-xs font-semibold ${link.active ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-600'} disabled:opacity-40`} dangerouslySetInnerHTML={{ __html: link.label }} />
        ))}
    </div>
) : null);

export default function Expenses({ expenses = {}, fundPools = [], reviewers = [], categories = [], trips = [], filters = {}, comparison = {}, resultCount }) {
    const rows = expenses.data ?? [];
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const form = useForm(emptyForm);

    const reset = () => {
        form.reset();
        form.clearErrors();
        setEditingId(null);
        setOpen(false);
    };

    const edit = (expense) => {
        setEditingId(expense.id);
        form.setData({
            fund_pool_id: expense.fund_pool_id ?? '',
            category: expense.category ?? 'food',
            amount: expense.amount ?? '',
            period_start: dateValue(expense.period_start),
            period_end: dateValue(expense.period_end),
            reviewer_id: expense.reviewer_id ?? '',
            note: expense.note ?? '',
            receipt: null,
        });
        setOpen(true);
    };

    const submit = (event) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            receipt: data.receipt || undefined,
            _method: editingId ? 'patch' : undefined,
        }));
        form.post(editingId ? route('admin.expenses.update', editingId) : route('admin.expenses.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: reset,
        });
    };

    const applyFilters = (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        router.get(route('admin.expenses.index'), {
            fund_pool_id: data.get('fund_pool_id') || undefined,
            category: data.get('category') || undefined,
            reviewer_id: data.get('reviewer_id') || undefined,
            date_from: data.get('date_from') || undefined,
            date_to: data.get('date_to') || undefined,
            amount_min: data.get('amount_min') || undefined,
            amount_max: data.get('amount_max') || undefined,
            archived: data.get('archived') ? 1 : undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    return (
        <AdminLayout title="Expenses" subtitle="Ledger" heading="Expense ledger">
            <section className="grid gap-3 md:grid-cols-3">
                <div className="rounded-3xl bg-emerald-50 p-5"><p className="text-sm font-semibold text-emerald-800">Approved income</p><p className="mt-2 text-2xl font-black text-slate-900">{currency.format(Number(comparison.income) || 0)}</p></div>
                <div className="rounded-3xl bg-amber-50 p-5"><p className="text-sm font-semibold text-amber-800">Active expenses</p><p className="mt-2 text-2xl font-black text-slate-900">{currency.format(Number(comparison.expenses) || 0)}</p></div>
                <div className="rounded-3xl bg-white p-5 ring-1 ring-slate-200"><p className="text-sm font-semibold text-slate-600">Balance</p><p className="mt-2 text-2xl font-black text-slate-900">{currency.format(Number(comparison.balance) || 0)}</p></div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900">Income and expenses by fund pool</h2>
                <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.15em] text-slate-500">
                            <tr><th className="px-3 py-2.5">Pool</th><th className="px-3 py-2.5">Income</th><th className="px-3 py-2.5">Expenses</th><th className="px-3 py-2.5">Balance</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {(comparison.by_pool ?? []).length === 0 ? (
                                <tr><td colSpan="4" className="px-5 py-8 text-center text-slate-500">No fund pools yet.</td></tr>
                            ) : comparison.by_pool.map((pool) => (
                                <tr key={pool.id}>
                                    <td className="px-3 py-2.5 font-semibold text-slate-900">{pool.title}</td>
                                    <td className="px-3 py-2.5 text-emerald-700">{currency.format(Number(pool.income) || 0)}</td>
                                    <td className="px-3 py-2.5 text-amber-700">{currency.format(Number(pool.expenses) || 0)}</td>
                                    <td className="px-3 py-2.5 font-bold">{currency.format(Number(pool.balance) || 0)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">{editingId ? 'Edit' : 'Record'}</p>
                                <h2 className="mt-1 text-xl font-black text-slate-900">{editingId ? 'Update expense' : 'Add expense'}</h2>
                            </div>
                            <button type="button" onClick={reset} className="rounded-full border border-slate-200 p-2 text-slate-500" aria-label="Close expense form"><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={submit} className="space-y-3">
                            <div className="grid gap-3 md:grid-cols-2">
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Fund pool</span>
                                    <select value={form.data.fund_pool_id} onChange={(event) => form.setData('fund_pool_id', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" required>
                                        <option value="">Select a pool</option>
                                        {fundPools.map((pool) => <option key={pool.id} value={pool.id}>{pool.title_mm || pool.title_en}</option>)}
                                    </select>
                                </label>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Category</span>
                                    <select value={form.data.category} onChange={(event) => form.setData('category', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm">
                                        {categories.map((category) => <option key={category} value={category}>{categoryLabels[category] || category}</option>)}
                                    </select>
                                </label>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Amount (MMK)</span>
                                    <input type="number" min="1" step="1" value={form.data.amount} onChange={(event) => form.setData('amount', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" required />
                                </label>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Reviewer</span>
                                    <select value={form.data.reviewer_id} onChange={(event) => form.setData('reviewer_id', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" required>
                                        <option value="">Select a reviewer</option>
                                        {reviewers.map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.name}</option>)}
                                    </select>
                                </label>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Period start</span>
                                    <input type="date" value={form.data.period_start} onChange={(event) => form.setData('period_start', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                                </label>
                                <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Period end</span>
                                    <input type="date" value={form.data.period_end} onChange={(event) => form.setData('period_end', event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                                </label>
                            </div>
                            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Note</span>
                                <textarea value={form.data.note} onChange={(event) => form.setData('note', event.target.value)} rows="3" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm" />
                            </label>
                            <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Receipt (JPG, PNG, WEBP, or PDF, up to 4 MB)</span>
                                <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => form.setData('receipt', event.target.files?.[0] ?? null)} className="w-full text-sm" />
                            </label>
                            {Object.keys(form.errors).length > 0 && (
                                <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
                                    {Object.values(form.errors).map((message) => <p key={message}>{message}</p>)}
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={reset} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">Cancel</button>
                                <button type="submit" disabled={form.processing} className="rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#065F46] disabled:opacity-60">{editingId ? 'Save changes' : 'Record expense'}</button>
                            </div>
                </form>
                {resultCount !== undefined && <p className="mb-3 text-xs font-semibold text-slate-500">{resultCount} result{resultCount === 1 ? '' : 's'}</p>}
                    </div>
                </div>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">Spending record</p>
                        <h2 className="mt-1 text-xl font-black text-slate-900">Expenses</h2>
                    </div>
                    <button type="button" onClick={() => { form.reset(); setEditingId(null); setOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-4 py-2 text-xs font-bold text-[#065F46]"><Plus className="h-4 w-4" />Add expense</button>
                </div>
                <form onSubmit={applyFilters} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="block text-xs font-semibold text-slate-600">Fund pool
                        <select name="fund_pool_id" defaultValue={filters.fund_pool_id ?? ''} className="mt-1 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                            <option value="">All pools</option>
                            {fundPools.map((pool) => <option key={pool.id} value={pool.id}>{pool.title_mm || pool.title_en}</option>)}
                        </select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">Category
                        <select name="category" defaultValue={filters.category ?? ''} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{categoryLabels[category] || category}</option>)}</select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">Reviewer
                        <select name="reviewer_id" defaultValue={filters.reviewer_id ?? ''} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="">All reviewers</option>{reviewers.map((reviewer) => <option key={reviewer.id} value={reviewer.id}>{reviewer.name}</option>)}</select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">Linked trip
                        <select name="outreach_trip_id" defaultValue={filters.outreach_trip_id ?? ''} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><option value="">All trips</option>{trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.trip_date} — {trip.township}</option>)}</select>
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">Date from<input name="date_from" type="date" defaultValue={filters.date_from ?? ''} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" /></label>
                    <label className="block text-xs font-semibold text-slate-600">Date to<input name="date_to" type="date" defaultValue={filters.date_to ?? ''} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" /></label>
                    <label className="block text-xs font-semibold text-slate-600">Min MMK<input name="amount_min" type="number" min="0" defaultValue={filters.amount_min ?? ''} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" /></label>
                    <label className="block text-xs font-semibold text-slate-600">Max MMK<input name="amount_max" type="number" min="0" defaultValue={filters.amount_max ?? ''} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm" /></label>
                    <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                        <input type="checkbox" name="archived" value="1" defaultChecked={Boolean(filters.archived)} className="h-4 w-4 rounded border-slate-300" />
                        Show archived
                    </label>
                    <div className="flex items-end gap-2"><button type="submit" className="rounded-full bg-[#065F46] px-4 py-2 text-xs font-bold text-white">Apply filters</button><button type="button" onClick={() => router.get(route('admin.expenses.index'), {}, { preserveState: true, preserveScroll: true })} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">Clear</button></div>
                </form>
                <div className="space-y-3 md:hidden">
                    {rows.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">No expenses recorded.</p> : rows.map((expense) => (
                        <article key={expense.id} className="rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-bold text-slate-900">{categoryLabels[expense.category] || expense.category}</p>
                                    <p className="text-xs text-slate-500">{expense.fund_pool?.title_mm || expense.fund_pool?.title_en || 'Unassigned'}</p>
                                </div>
                                <p className="font-black text-amber-700">{currency.format(Number(expense.amount) || 0)}</p>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">{dateValue(expense.period_start) || '—'} to {dateValue(expense.period_end) || '—'}</p>
                            <p className="mt-1 text-xs text-slate-500">Reviewer: {expense.reviewer?.name || '—'}</p>
                            <ExpenseActions expense={expense} onEdit={edit} />
                        </article>
                    ))}
                </div>
                <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 md:block">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.15em] text-slate-500">
                            <tr>
                                <th className="px-3 py-2.5">Category</th>
                                <th className="px-3 py-2.5">Pool</th>
                                <th className="px-3 py-2.5">Amount</th>
                                <th className="px-3 py-2.5">Period</th>
                                <th className="px-3 py-2.5">Trip</th>
                                <th className="px-3 py-2.5">Reviewer</th>
                                <th className="px-3 py-2.5">Receipt</th>
                                <th className="px-3 py-2.5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {rows.length === 0 ? <tr><td colSpan="8" className="px-5 py-8 text-center text-slate-500">No expenses recorded.</td></tr> : rows.map((expense) => (
                                <tr key={expense.id} className="align-top hover:bg-slate-50">
                                    <td className="px-3 py-2.5 font-semibold text-slate-900">{categoryLabels[expense.category] || expense.category}{expense.archived_at ? <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] uppercase text-slate-600">Archived</span> : null}</td>
                                    <td className="px-3 py-2.5">{expense.fund_pool?.title_mm || expense.fund_pool?.title_en || '—'}</td>
                                    <td className="px-3 py-2.5 font-bold text-amber-700">{currency.format(Number(expense.amount) || 0)}</td>
                                    <td className="px-3 py-2.5 text-xs text-slate-600">{dateValue(expense.period_start) || '—'} – {dateValue(expense.period_end) || '—'}</td>
                                    <td className="px-3 py-2.5">{expense.outreach_trip ? `${expense.outreach_trip.trip_date} ${expense.outreach_trip.township}` : '—'}</td>
                                    <td className="px-3 py-2.5">{expense.reviewer?.name || '—'}</td>
                                    <td className="px-3 py-2.5">{expense.receipt_path ? <a href={route('admin.expenses.receipt', expense.id)} className="font-semibold text-emerald-700">View</a> : '—'}</td>
                                    <td className="px-3 py-2.5"><ExpenseActions expense={expense} onEdit={edit} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pagination(expenses, (url) => url && router.get(url, {}, { preserveScroll: true, preserveState: true }))}
            </section>
        </AdminLayout>
    );
}

function ExpenseActions({ expense, onEdit }) {
    return (
        <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
            <button type="button" onClick={() => onEdit(expense)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"><PencilLine className="mr-1 inline h-3.5 w-3.5" />Edit</button>
            <button type="button" onClick={() => router.patch(route('admin.expenses.archive', expense.id), {}, { preserveScroll: true })} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {expense.archived_at ? <><RotateCcw className="mr-1 inline h-3.5 w-3.5" />Restore</> : <><Archive className="mr-1 inline h-3.5 w-3.5" />Archive</>}
            </button>
        </div>
    );
}
