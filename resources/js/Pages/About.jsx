import { Link } from '@inertiajs/react';
import { ArrowLeft, Compass, Eye, Flag, HeartHandshake, ShieldCheck, Sparkles, Target } from 'lucide-react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

export default function About() {
    const [lang, setLang] = useLanguage();
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);

    const sections = [
        {
            icon: Target,
            title: copy('ရည်မှန်းချက် (Goal)', 'Our goal'),
            body: copy(
                'လမ်းဘေးနှင့် အကူအညီလိုအပ်နေသော သက်ကြီးရွယ်အိုများအတွက် အစားအစာ၊ ဆေးဝါးနှင့် အခြေခံစောင့်ရှောက်မှုကို တိုက်ရိုက်၊ လုံခြုံပြီး ယုံကြည်စိတ်ချရသော နည်းလမ်းဖြင့် ပို့ဆောင်ပေးရန် ဖြစ်ပါသည်။',
                'To deliver food, medicine, and essential care directly to elders living on the street or in urgent need, in a safe and trustworthy way.'
            ),
        },
        {
            icon: Compass,
            title: copy('လုပ်ငန်းတာဝန် (Mission)', 'Our mission'),
            body: copy(
                'လူမှုအသိုက်အဝန်း၏ လှူဒါန်းမှုများကို စုစည်းပြီး မြေပြင်ကွင်းဆင်းအဖွဲ့များနှင့် ချိတ်ဆက်ကာ အကူအညီလိုသူများထံ သတင်းအချက်အလက်မှန်ကန်စွာ၊ ပွင့်လင်းမြင်သာစွာ ရောက်ရှိအောင် ဆောင်ရွက်ပါသည်။',
                'We connect community generosity with local outreach teams so support reaches the right people with clear information and transparent follow-through.'
            ),
        },
        {
            icon: Eye,
            title: copy('မျှော်မှန်းချက် (Vision)', 'Our vision'),
            body: copy(
                'သက်ကြီးရွယ်အိုတိုင်းသည် ဂုဏ်သိက္ခာ၊ စောင့်ရှောက်မှုနှင့် လူမှုအသိုက်အဝန်း၏ ယုံကြည်စိတ်ချရသော အကူအညီကို ရရှိနိုင်သည့် လူမှုဘဝတစ်ခုကို မျှော်မှန်းပါသည်။',
                'We envision a community where every elder can access care, dignity, and reliable support when they need it most.'
            ),
        },
    ];

    const values = [
        {
            title: copy('ဂုဏ်သိက္ခာကို ဦးစားပေးခြင်း', 'Dignity first'),
            body: copy('အကူအညီပေးရာတွင် လူတစ်ဦးချင်း၏ ဂုဏ်သိက္ခာနှင့် လုံခြုံမှုကို အမြဲ ဦးစားပေးပါသည်။', 'We respect each person’s dignity, privacy, and safety in every interaction.'),
        },
        {
            title: copy('တိုက်ရိုက် အကူအညီ', 'Direct support'),
            body: copy('လှူဒါန်းမှုများကို လိုအပ်သူများထံ တိုက်ရိုက်ရောက်ရှိစေရန် မြေပြင်လှုပ်ရှားမှုကို အခြေခံပါသည်။', 'We focus on practical, on-the-ground outreach that reaches people directly.'),
        },
        {
            title: copy('ပွင့်လင်းမြင်သာမှု', 'Transparency'),
            body: copy('လှူဒါန်းမှုခြေရာခံခြင်း၊ အတည်ပြုခြင်းနှင့် မှတ်တမ်းများဖြင့် ယုံကြည်မှုကို တည်ဆောက်ပါသည်။', 'We build trust through clear records, review steps, and donation tracking.'),
        },
        {
            title: copy('အသိုက်အဝန်း ပူးပေါင်းဆောင်ရွက်ခြင်း', 'Community collaboration'),
            body: copy('လူမှုအသိုက်အဝန်း၊ စေတနာ့ဝန်ထမ်းများနှင့် ဒေသခံကူညီသူများနှင့်အတူ လုပ်ဆောင်ပါသည်။', 'We work with donors, volunteers, and local supporters to respond faster and responsibly.'),
        },
    ];

    return (
        <PublicLayout active="about" lang={lang} setLang={setLang}>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-center gap-3">
                    <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <ArrowLeft className="h-4 w-4" /> {copy('မူလသို့', 'Back home')}
                    </Link>
                </div>

                <section className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('ကျွန်ုပ်တို့အကြောင်း', 'About WeCare Myanmar')}</p>
                    <h1 className="mt-2 text-3xl font-black md:text-4xl">{copy('သက်ကြီးရွယ်အိုများအတွက် ဂရုစိုက်သော ကူညီကယ်ဆယ်ရေး လှုပ်ရှားမှု', 'Care and support for elders in need')}</h1>
                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-emerald-50/90">
                        {copy(
                            'WeCare Myanmar သည် လမ်းဘေးနှင့် အကူအညီလိုအပ်နေသော သက်ကြီးရွယ်အိုများအတွက် အစားအစာ၊ ဆေးဝါးနှင့် အခြေခံစောင့်ရှောက်မှုများကို တိုက်ရိုက်ပို့ဆောင်ပေးရန် ရည်ရွယ်ထားသော လူမှုကူညီရေး ပလက်ဖောင်းတစ်ခု ဖြစ်ပါသည်။',
                            'WeCare Myanmar is a community care platform focused on bringing food, medicine, and practical support directly to elders who are living on the street or facing urgent hardship.'
                        )}
                    </p>
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link href={route('donate')} className="inline-flex items-center justify-center rounded-full bg-[#F59E0B] px-6 py-3.5 text-base font-bold text-[#065F46] transition hover:bg-amber-400">
                            {copy('ယခု လှူဒါန်းမည်', 'Donate now')}
                        </Link>
                        <Link href={route('outreach')} className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/15">
                            {copy('လှုပ်ရှားမှုများ ကြည့်ရန်', 'See outreach work')}
                        </Link>
                    </div>
                </section>

                <section className="mt-8 grid gap-5 lg:grid-cols-3">
                    {sections.map(({ icon: Icon, title, body }) => (
                        <article key={title} className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <Icon className="h-6 w-6" />
                            </div>
                            <h2 className="mt-4 text-xl font-black text-slate-900">{title}</h2>
                            <p className="mt-3 text-base leading-relaxed text-slate-700">{body}</p>
                        </article>
                    ))}
                </section>

                <section className="mt-8 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-8">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                            <Flag className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">{copy('တည်ထောင်ရသည့် အကြောင်းရင်း', 'Why WeCare was founded')}</p>
                            <h2 className="mt-2 text-2xl font-black text-slate-900">{copy('လူမှုအသိုက်အဝန်း၏ စိုးရိမ်မှုမှ စတင်ခဲ့သည်', 'Started from a community concern')}</h2>
                        </div>
                    </div>
                    <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-700">
                        <p>
                            {copy(
                                'မြို့ပြလမ်းများပေါ်တွင် အစားအစာ၊ ဆေးဝါးနှင့် စောင့်ရှောက်မှု အကူအညီလိုအပ်နေသော သက်ကြီးရွယ်အိုများကို တွေ့မြင်ရသည့်အခါ ကူညီလိုသူများနှင့် အမှန်တကယ် လိုအပ်နေသူများကြား ချိတ်ဆက်မှုကို ပိုမို လွယ်ကူ၊ မြန်ဆန်၊ ယုံကြည်စိတ်ချရအောင် ပြုလုပ်ရန် WeCare Myanmar ကို စတင်တည်ထောင်ခဲ့ပါသည်။',
                                'WeCare Myanmar was founded after seeing elders on city streets who needed food, medicine, and care, while many people wanted to help but lacked a simple, trusted way to reach them.'
                            )}
                        </p>
                        <p>
                            {copy(
                                'ကျွန်ုပ်တို့၏ ရည်ရွယ်ချက်မှာ လှူဒါန်းမှုတစ်ခုချင်းစီကို တာဝန်ယူမှုရှိစွာ စီမံပြီး မြေပြင်လှုပ်ရှားမှုများနှင့် ချိတ်ဆက်ကာ အကူအညီကို အချိန်မီ ရောက်ရှိစေရန် ဖြစ်ပါသည်။',
                                'Our purpose is to handle each act of giving responsibly, connect it to real outreach work, and help support arrive when it matters.'
                            )}
                        </p>
                    </div>
                </section>

                <section className="mt-8">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-amber-600" />
                        <h2 className="text-2xl font-black text-slate-900">{copy('ကျွန်ုပ်တို့ တန်ဖိုးထားသော အချက်များ', 'What we value')}</h2>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        {values.map((item) => (
                            <article key={item.title} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                                        <p className="mt-2 text-base leading-relaxed text-slate-700">{item.body}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mt-8 rounded-[2rem] bg-gradient-to-r from-emerald-50 to-amber-50 p-6 ring-1 ring-emerald-100 sm:p-8">
                    <div className="flex items-start gap-3">
                        <HeartHandshake className="mt-0.5 h-6 w-6 text-emerald-700" />
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">{copy('အတူတကွ ကူညီနိုင်ပါသည်', 'You can be part of the care')}</h2>
                            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-700">
                                {copy(
                                    'လှူဒါန်းခြင်း၊ သတင်းပေးပို့ခြင်း၊ သို့မဟုတ် စေတနာ့ဝန်ထမ်းအဖြစ် ပါဝင်ခြင်းဖြင့် သက်ကြီးရွယ်အိုများအတွက် ပိုမိုလုံခြုံသော နေ့ရက်များ ဖန်တီးရာတွင် အတူတကွ ပါဝင်နိုင်ပါသည်။',
                                    'Whether you donate, share a report, or volunteer, you can help create safer days and kinder support for elders in need.'
                                )}
                            </p>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <Link href={route('donate')} className="inline-flex items-center justify-center rounded-full bg-[#065F46] px-6 py-3 text-base font-bold text-white transition hover:bg-emerald-800">
                                    {copy('လှူဒါန်းရန်', 'Donate')}
                                </Link>
                                <Link href={route('community')} className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-bold text-emerald-800 ring-1 ring-emerald-200 transition hover:bg-emerald-50">
                                    {copy('အသိုက်အဝန်းသို့ ပါဝင်ရန်', 'Join the community')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </PublicLayout>
    );
}
