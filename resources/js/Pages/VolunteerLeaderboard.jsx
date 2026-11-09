import PublicLayout from '../Components/PublicLayout';
import { Link } from '@inertiajs/react';
import useLanguage from '../hooks/useLanguage';

export default function VolunteerLeaderboard({ volunteers }) {
    const [lang, setLang] = useLanguage();
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const items = volunteers?.data ?? volunteers ?? [];
    return (
        <PublicLayout active="volunteers" lang={lang} setLang={setLang}>
            <div className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="text-3xl font-black text-slate-900">{copy('စေတနာ့ဝန်ထမ်း ဂုဏ်ပြုစာရင်း', 'Volunteer leaderboard')}</h1>
                <p className="mt-2 text-slate-600">{copy('စေတနာ့ဝန်ထမ်းများကို ပါဝင်မှုအလိုက် အဆင့်သတ်မှတ်ထားသည်။', 'Volunteers ranked by participation.')}</p>
                <ol className="mt-6 space-y-3">
                    {items.length === 0 && <li className="text-slate-500">{copy('စေတနာ့ဝန်ထမ်း မရှိသေးပါ။', 'No volunteers yet.')}</li>}
                    {items.map((v, index) => (
                        <li key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                            <span className="font-semibold text-slate-900">{(volunteers?.from ?? 1) + index}. {v.name} <span className="text-slate-500">({v.township})</span></span>
                            <span className="font-black text-emerald-700">{v.reports}</span>
                        </li>
                    ))}
                </ol>
                {volunteers?.links && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {volunteers.links.map((link, i) => (
                            <Link key={i} href={link.url || '#'} className={`rounded-full px-3 py-1 text-sm ${link.active ? 'bg-emerald-600 text-white' : 'bg-white ring-1 ring-slate-200'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                        ))}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}