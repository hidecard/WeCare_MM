import PublicLayout from '../Components/PublicLayout';
import { Link, router } from '@inertiajs/react';
import useLanguage from '../hooks/useLanguage';
import { useState } from 'react';

export default function Leaderboard({ donors, search = '' }) {
    const [lang, setLang] = useLanguage();
    const [term, setTerm] = useState(search);
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const items = donors?.data ?? donors ?? [];
    const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

    const submit = (e) => {
        e.preventDefault();
        router.get(route('leaderboard'), { search: term }, { preserveState: true });
    };

    return (
        <PublicLayout active="leaderboard" lang={lang} setLang={setLang}>
            <div className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="text-3xl font-black text-slate-900">{copy('လှူဒါန်းသူ ဂုဏ်ပြုစာရင်း', 'Donor recognition wall')}</h1>
                <p className="mt-2 text-slate-600">{copy('အတည်ပြုပြီး လှူဒါန်းမှုများကို စုစုပေါင်းအလိုက် အဆင့်သတ်မှတ်ထားသည်။', 'Approved donations, ranked by total given.')}</p>
                <form onSubmit={submit} className="mt-4 flex gap-2">
                    <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder={copy('နာမည်ရှာရန်', 'Search by name')} className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2" />
                    <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white">{copy('ရှာရန်', 'Search')}</button>
                </form>
                <ol className="mt-6 space-y-3">
                    {items.length === 0 && <li className="text-slate-500">{copy('အတည်ပြုပြီး လှူဒါန်းမှု မရှိသေးပါ။', 'No approved donations yet.')}</li>}
                    {items.map((donor, index) => (
                        <li key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                            <span className="font-semibold text-slate-900">{(donors?.from ?? 1) + index}. {donor.name}</span>
                            <span className="font-black text-emerald-700">{currency.format(Number(donor.total) || 0)}</span>
                        </li>
                    ))}
                </ol>
                {donors?.links && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {donors.links.map((link, i) => (
                            <Link key={i} href={link.url || '#'} className={`rounded-full px-3 py-1 text-sm ${link.active ? 'bg-emerald-600 text-white' : 'bg-white ring-1 ring-slate-200'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
