import { Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Shield } from 'lucide-react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

export default function PrivacyPolicy() {
    const [lang, setLang] = useLanguage();
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const updated = '2026-11-08';

    const Section = ({ title, children }) => (
        <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-7">
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            <div className="mt-4 space-y-3 text-base leading-relaxed text-slate-700">{children}</div>
        </section>
    );

    return (
        <PublicLayout active="home" lang={lang} setLang={setLang}>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-3">
                    <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <ArrowLeft className="h-4 w-4" /> {copy('မူလသို့', 'Back home')}
                    </Link>
                </div>

                <section className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Shield className="h-5 w-5" /></div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('မူဝါဒ', 'Policy')}</p>
                            <h1 className="mt-1 text-3xl font-black md:text-4xl">{copy('ကိုယ်ရေးအချက်အလက် မူဝါဒ', 'Privacy Policy')}</h1>
                            <p className="mt-3 text-base text-emerald-50/90">{copy(`နောက်ဆုံးပြင်ဆင်သည့်ရက်: ${updated}`, `Last updated: ${updated}`)}</p>
                        </div>
                    </div>
                </section>

                <div className="mt-6 space-y-5">
                    <Section title={copy('ကျွန်ုပ်တို့ စုဆောင်းနိုင်သော အချက်အလက်များ', 'Information we may collect')}>
                        <p>{copy('လှူဒါန်းမှု တင်သွင်းသည့်အခါ လှူဒါန်းသူအမည် (ရွေးချယ်နိုင်)၊ အမည်မဖော်ပြရန် ရွေးချယ်မှု၊ ဖုန်းနံပါတ် (ရွေးချယ်နိုင်)၊ အီးမေးလ် (ရွေးချယ်နိုင်)၊ လှူဒါန်းငွေပမာဏ၊ ရန်ပုံငွေ/ပေးချေမှုနည်းလမ်း၊ ဆုတောင်း/မှတ်ချက် (ရွေးချယ်နိုင်) နှင့် ငွေလွှဲပြေစာပုံတို့ကို စုဆောင်းနိုင်ပါသည်။', 'When you submit a donation, we may collect your donor name (optional), anonymous preference, phone number (optional), email address (optional), donation amount, selected fund/payment method, wish note (optional), and payment slip image.')}</p>
                        <p>{copy('လူမှုအသိုက်အဝန်း သတင်းပေးမှု သို့မဟုတ် စေတနာ့ဝန်ထမ်း တင်သွင်းမှုတွင် မြို့နယ်၊ နေရာ/အမှတ်အသား၊ ဖုန်းနံပါတ် (ပေးထားလျှင်) နှင့် တင်သွင်းသော ဓာတ်ပုံ (ရှိလျှင်) စသည့် အချက်အလက်များ ပါဝင်နိုင်ပါသည်။', 'Community reports or volunteer submissions may include township, location/landmark, phone number (if provided), and any photo you submit.')}</p>
                    </Section>

                    <Section title={copy('အသုံးပြုပုံ', 'How we use information')}>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>{copy('လှူဒါန်းမှုများကို စစ်ဆေးအတည်ပြုရန်၊ ခြေရာခံအမှတ်ဖြင့် အခြေအနေပြသရန်၊ အတည်ပြု/ငြင်းပယ် ရလဒ်ကို (အီးမေးလ်ပေးထားလျှင်) အကြောင်းကြားရန်။', 'To review and verify donations, show status by tracking ID, and notify you of review results when an email address is provided.')}</li>
                            <li>{copy('သတင်းပေးမှုများကို လိုက်လံစစ်ဆေးရန်၊ စေတနာ့ဝန်ထမ်း ဆက်သွယ်မှုနှင့် ကွင်းဆင်းကူညီရေး စီမံခန့်ခွဲရန်။', 'To follow up on community reports, coordinate volunteers, and manage outreach activities.')}</li>
                            <li>{copy('မှားယွင်းမှု၊ အလွဲသုံးစားလုပ်မှု သို့မဟုတ် မျက်နှာဖုံးလှူဒါန်းမှုများကို ကာကွယ်ရန်နှင့် ဝန်ဆောင်မှုလုံခြုံရေးကို ထိန်းသိမ်းရန်။', 'To prevent errors, misuse, or fraudulent submissions and to maintain service security.')}</li>
                        </ul>
                    </Section>

                    <Section title={copy('မည်သူတို့ မြင်နိုင်သနည်း', 'Who can access information')}>
                        <p>{copy('အများပြည်သူသို့ ဖော်ပြသော အချက်အလက်များကို လိုအပ်သလောက်သာ ကန့်သတ်ဖော်ပြပါသည်။ ဥပမာ— အမည်မဖော်ပြ လှူဒါန်းမှုကို အများသို့ အမည်မဖော်ပြပုံစံဖြင့်သာ ပြနိုင်ပြီး၊ ငွေလွှဲပြေစာ/ဖုန်းနံပါတ်/အီးမေးလ်/သတင်းပေးဓာတ်ပုံများကို အများပြည်သူသို့ ပွင့်လင်းမဖော်ပြပါ။', 'We limit what is shown publicly. For example, anonymous donations may appear without a donor name, and payment slips, phone numbers, email addresses, and report photos are not made public.')}</p>
                        <p>{copy('အကောင့်ဝင်ခွင့်ရှိသော အုပ်ချုပ်ရေးအဖွဲ့ဝင်များသည် လှူဒါန်းမှု စစ်ဆေးခြင်း၊ သတင်းပေးမှု လိုက်လံခြင်းနှင့် ဝန်ဆောင်မှု လည်ပတ်ရေးအတွက် လိုအပ်သည့် အချက်အလက်များကို ကြည့်ရှုနိုင်ပါသည်။', 'Authorized administrators may access relevant information to review donations, follow up on reports, and operate the service.')}</p>
                    </Section>

                    <Section title={copy('သင့်ရွေးချယ်ခွင့်နှင့် တောင်းဆိုနိုင်မှုများ', 'Your choices and requests')}>
                        <p>{copy('လှူဒါန်းသည့်အခါ အမည်မဖော်ပြရန် ရွေးချယ်နိုင်ပါသည်။ ဖုန်းနံပါတ်နှင့် အီးမေးလ်သည် မဖြစ်မနေ မဟုတ်သော်လည်း စစ်ဆေးခြင်း သို့မဟုတ် အကြောင်းကြားခြင်းအတွက် အကူအညီဖြစ်နိုင်ပါသည်။', 'You may choose to donate anonymously. Phone number and email are optional, but they can help with review or notifications.')}</p>
                        <p>{copy('သင့်အချက်အလက်များအား ဝင်ရောက်ကြည့်ရှုရန်၊ ပြင်ဆင်ရန် သို့မဟုတ် ဖျက်ပစ်ရန် တောင်းဆိုလိုပါက အောက်ပါ ဆက်သွယ်လိပ်စာသို့ ဆက်သွယ်နိုင်ပါသည်။ ဥပဒေ၊ လုံခြုံရေး သို့မဟုတ် မှတ်တမ်းထိန်းသိမ်းရန် လိုအပ်ချက်များအရ အချို့တောင်းဆိုမှုများကို ကန့်သတ်ထားနိုင်ပါသည်။', 'You may contact us to request access, correction, or deletion of your information. Some requests may be limited where retention is required for legal, security, or record-keeping reasons.')}</p>
                    </Section>

                    <Section title={copy('ဆက်သွယ်ရန်', 'Contact')}>
                        <p><FileText className="mr-2 inline h-4 w-4 text-emerald-700" />care@wecaremyanmar.org</p>
                        <p>{copy('ဤမူဝါဒသည် ယေဘုယျ လမ်းညွှန်ချက်ဖြစ်ပြီး တိကျသော ဥပဒေအကြံဉာဏ်မဟုတ်ပါ။ လိုအပ်ပါက သင့်အဖွဲ့အစည်း၏ ဥပဒေရေးရာ လိုအပ်ချက်များနှင့်အညီ ပြန်လည်စိစစ်ပါ။', 'This policy is general guidance and not legal advice. Review it against your organization’s legal requirements where needed.')}</p>
                    </Section>
                </div>
            </main>
        </PublicLayout>
    );
}
