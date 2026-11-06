import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, HeartHandshake, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../Components/PublicLayout';

export default function Community() {
    const [lang, setLang] = useState('my');
    const [tab, setTab] = useState('report');

    return (
        <>
            <Head title={lang === 'my' ? 'အသိုက်အဝန်း' : 'Community'} />
            <PublicLayout active="community" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-3">
                        <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                            <ArrowLeft className="h-4 w-4" /> {lang === 'my' ? 'မူလသို့' : 'Back home'}
                        </Link>
                    </div>

                    <section className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{lang === 'my' ? 'လူမှုအသိုက်အဝန်း' : 'Community'}</p>
                        <h1 className="mt-2 text-3xl font-black md:text-4xl">{lang === 'my' ? 'လူမှုကူညီမည်' : 'Join the outreach community'}</h1>
                    </section>

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setTab('report')} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === 'report' ? 'bg-[#065F46] text-white' : 'bg-slate-100 text-slate-700'}`}>
                                    {lang === 'my' ? 'သတင်းပေးရန်' : 'Spot report'}
                                </button>
                                <button type="button" onClick={() => setTab('volunteer')} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === 'volunteer' ? 'bg-[#065F46] text-white' : 'bg-slate-100 text-slate-700'}`}>
                                    {lang === 'my' ? 'စေတနာ့ဝန်ထမ်း' : 'Volunteer'}
                                </button>
                            </div>

                            {tab === 'report' ? (
                                <form className="mt-5 space-y-3">
                                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'မြို့နယ်' : 'Township'} />
                                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'လမ်းဘေးအမှတ်တံဆိပ်' : 'Street landmark'} />
                                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'တွေ့ရှိချိန်' : 'Time seen'} />
                                    <textarea rows="4" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'အခြေအနေဖော်ပြချက်' : 'Condition note'} />
                                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone'} />
                                    <button type="button" className="w-full rounded-full bg-[#065F46] px-4 py-3 font-semibold text-white">{lang === 'my' ? 'တင်သွင်းရန်' : 'Submit report'}</button>
                                </form>
                            ) : (
                                <form className="mt-5 space-y-3">
                                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'အမည်' : 'Name'} />
                                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'ဖုန်းနံပါတ်' : 'Phone'} />
                                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'မြို့နယ်' : 'Township'} />
                                    <input className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2" placeholder={lang === 'my' ? 'အလုပ်ပေးနိုင်သောရက်' : 'Available days'} />
                                    <button type="button" className="w-full rounded-full bg-[#F59E0B] px-4 py-3 font-semibold text-[#065F46]">{lang === 'my' ? 'တက်ရောက်မည်' : 'Join volunteer team'}</button>
                                </form>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                                <div className="flex items-center gap-3"><HeartHandshake className="h-5 w-5 text-emerald-700" /><p className="font-bold text-slate-900">{lang === 'my' ? 'ကြီးမားသောအဖွဲ့' : 'How the community helps'}</p></div>
                                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                                    <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {lang === 'my' ? 'အကူအညီလိုအပ်သော အချက်အလက်များကို စိတ်ချရစွာပေးပို့ပါ' : 'Send reliable information about elders in need'}</li>
                                    <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {lang === 'my' ? 'ကူညီမည့်အဖွဲ့အတွက် လက်ရှိနိုင်ငံတကာ အပိုင်းများ' : 'Support outreach teams on the ground'}</li>
                                    <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {lang === 'my' ? 'အဖွဲ့ဝင်အသစ်များအတွက် စိတ်ရှည်မှုနဲ့ တက်ကြွစွာ' : 'Volunteer with patience and compassion'}</li>
                                </ul>
                            </div>

                            <div className="rounded-[2rem] bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100">
                                <div className="flex items-center gap-3"><Users className="h-5 w-5 text-emerald-700" /><p className="font-bold text-slate-900">{lang === 'my' ? 'လူမှုအဖွဲ့ဝင်များ' : 'Community values'}</p></div>
                                <p className="mt-4 text-sm text-slate-700">{lang === 'my' ? 'မိမိကိုယ်တိုင်စိတ်ချစေသော အဖွဲ့အစည်းအနေဖြင့် စိတ်ချရသော တန်ဖိုးများကို စိုက်ထူပါသည်။' : 'We value trust, dignity, and direct support for elderly persons in need.'}</p>
                            </div>
                        </div>
                    </div>
                </main>
            </PublicLayout>
        </>
    );
}
