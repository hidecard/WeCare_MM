import { Link } from '@inertiajs/react';
import { ArrowLeft, Database, Image as ImageIcon, Mail, Phone } from 'lucide-react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

export default function DataHandling() {
    const [lang, setLang] = useLanguage();
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const updated = '2026-11-08';

    const Card = ({ icon: Icon, title, children }) => (
        <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100 sm:p-7">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></div>
                <div className="min-w-0">
                    <h2 className="text-xl font-black text-slate-900">{title}</h2>
                    <div className="mt-3 space-y-3 text-base leading-relaxed text-slate-700">{children}</div>
                </div>
            </div>
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
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Database className="h-5 w-5" /></div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('မူဝါဒ', 'Policy')}</p>
                            <h1 className="mt-1 text-3xl font-black md:text-4xl">{copy('အချက်အလက် ကိုင်တွယ်မှု', 'Data Handling')}</h1>
                            <p className="mt-3 text-base text-emerald-50/90">{copy(`ငွေလွှဲပြေစာ၊ ဖုန်းနံပါတ်၊ အီးမေးလ်နှင့် ဓာတ်ပုံများကို မည်သို့ ကိုင်တွယ်သည် • နောက်ဆုံးပြင်ဆင်: ${updated}`, `How we handle slips, phone numbers, email, and photos • Last updated: ${updated}`)}</p>
                        </div>
                    </div>
                </section>

                <div className="mt-6 space-y-5">
                    <Card icon={ImageIcon} title={copy('ငွေလွှဲပြေစာ (Payment slip)', 'Payment slip images')}>
                        <p>{copy('လှူဒါန်းမှု စစ်ဆေးရန်အတွက် ငွေလွှဲပြေစာပုံကို တင်သွင်းရပါသည် (JPG/PNG/WEBP)။ ပြေစာသည် လှူဒါန်းမှု အတည်ပြု/စစ်ဆေးရေးအတွက် အသုံးပြုပြီး အများပြည်သူသို့ ဖော်ပြမထားပါ။', 'You upload a payment slip image (JPG/PNG/WEBP) to help verify a donation. Slips are used for donation review and are not displayed publicly.')}</p>
                        <p>{copy('ပြေစာဖိုင်များကို အုပ်ချုပ်ရေးစစ်ဆေးမှုအတွက် လုံခြုံစွာ သိမ်းဆည်းထားပြီး ခွင့်ပြုထားသော အုပ်ချုပ်သူများသာ ဝင်ရောက်ကြည့်ရှုနိုင်ပါသည်။', 'Slip files are stored for administrative review and are accessible only to authorized administrators.')}</p>
                    </Card>

                    <Card icon={Phone} title={copy('ဖုန်းနံပါတ်', 'Phone numbers')}>
                        <p>{copy('လှူဒါန်းမှု သို့မဟုတ် သတင်းပေးမှုတွင် ဖုန်းနံပါတ် ထည့်သွင်းနိုင်ပါသည်။ စစ်ဆေးရန်၊ အတည်ပြုရန် သို့မဟုတ် လိုအပ်ပါက ဆက်သွယ်ရန်အတွက်သာ အသုံးပြုနိုင်ပြီး အများပြည်သူသို့ မဖော်ပြပါ။', 'You may provide a phone number with a donation or report. It may be used to verify details or contact you when necessary and is not shown publicly.')}</p>
                        <p>{copy('ဖုန်းနံပါတ် ပုံစံမှန်ကန်စေရန် စနစ်က သန့်စင်/စစ်ဆေးနိုင်ပါသည် (ဥပမာ မြန်မာ မိုဘိုင်းနံပါတ် ပုံစံ)။', 'The system may normalize or validate phone number format (for example, Myanmar mobile format) to reduce errors.')}</p>
                    </Card>

                    <Card icon={Mail} title={copy('အီးမေးလ်လိပ်စာ', 'Email addresses')}>
                        <p>{copy('အီးမေးလ်လိပ်စာ ထည့်သွင်းပါက လှူဒါန်းမှု အတည်ပြု/ငြင်းပယ် ရလဒ်နှင့် အဖွဲ့မှ မှတ်ချက်ကို အကြောင်းကြားရန် အသုံးပြုနိုင်ပါသည်။ အီးမေးလ် မထည့်ထားပါက ခြေရာခံအမှတ် (tracking ID) ဖြင့် အခြေအနေကို စစ်ဆေးနိုင်ပါသည်။', 'If you provide an email address, we may use it to notify you about donation review results and any note from the team. If you do not provide an email, you can check status using your tracking ID.')}</p>
                        <p>{copy('အီးမေးလ်လိပ်စာကို အများပြည်သူသို့ မဖော်ပြပါ။', 'Email addresses are not displayed publicly.')}</p>
                    </Card>

                    <Card icon={ImageIcon} title={copy('ဓာတ်ပုံများ (သတင်းပေးမှု/ကွင်းဆင်းလုပ်ငန်း)', 'Photos (reports/outreach)')}>
                        <p>{copy('သတင်းပေးမှုတွင် ဓာတ်ပုံ တင်သွင်းနိုင်ပါသည်။ ထိုဓာတ်ပုံများကို အကူအညီလိုအပ်ချက် စစ်ဆေးရန်နှင့် လိုက်လံဆောင်ရွက်ရန် အသုံးပြုပြီး အများပြည်သူသို့ ပွင့်လင်းမဖော်ပြပါ။', 'Community reports may include a photo. Report photos are used to assess and follow up on needs and are not made public.')}</p>
                        <p>{copy('ကွင်းဆင်းလုပ်ငန်း ဓာတ်ပုံများကို လူမှုအသိုက်အဝန်း ယုံကြည်မှုတိုးစေရန် ဖော်ပြနိုင်သော်လည်း ကိုယ်ရေးအချက်အလက်နှင့် ဂုဏ်သိက္ခာကို ကာကွယ်သည့် နည်းလမ်းဖြင့်သာ ဖော်ပြသင့်ပါသည် (လိုအပ်ပါက ခွင့်ပြုချက်ရယူခြင်း/မျက်နှာဖုံးခြင်း စသည်)။', 'Outreach photos may be shared to build trust, but they should be presented in a privacy- and dignity-safe way (for example, consent and/or obscuring identities where appropriate).')}</p>
                    </Card>

                    <Card icon={Database} title={copy('သိမ်းဆည်းမှု၊ ကာကွယ်မှုနှင့် ထိန်းသိမ်းကာလ', 'Storage, protection, and retention')}>
                        <p>{copy('အချက်အလက်များကို ဝန်ဆောင်မှု လည်ပတ်ရေး၊ စစ်ဆေးရေး၊ အငြင်းပွားမှု ဖြေရှင်းရေးနှင့် လုံခြုံရေးအတွက် လိုအပ်သည့် ကာလအထိ သိမ်းဆည်းနိုင်ပါသည်။ မလိုအပ်တော့သော အချက်အလက်များကို သင့်လျော်သည့် နည်းလမ်းဖြင့် ဖျက်ပစ်ခြင်း သို့မဟုတ် အမည်ဖျောက်ခြင်း ပြုလုပ်နိုင်ပါသည်။', 'We may retain information for as long as needed to operate the service, review submissions, resolve disputes, and maintain security. When no longer needed, information may be deleted or anonymized where appropriate.')}</p>
                        <p>{copy('ဝင်ရောက်ခွင့်ကို လိုအပ်သူများ (ခွင့်ပြုထားသော အုပ်ချုပ်သူများ) သာ ကန့်သတ်ထားပြီး အချက်အလက်များကို မတော်တဆ ထိခိုက်မှုမှ ကာကွယ်ရန် ကြိုးပမ်းပါသည်။ သို့သော် မည်သည့် စနစ်မျှ ၁၀၀% လုံခြုံကြောင်း အာမမခံနိုင်ပါ။', 'Access is limited to authorized personnel, and we take reasonable steps to protect information. However, no system can be guaranteed 100% secure.')}</p>
                        <p>{copy('ဤစာမျက်နှာသည် ယေဘုယျ လမ်းညွှန်ချက်ဖြစ်သည်။ သင့်အဖွဲ့အစည်း၏ လုပ်ငန်းစဉ်/ဥပဒေလိုအပ်ချက်အရ ထိန်းသိမ်းကာလနှင့် လုပ်ထုံးလုပ်နည်းများကို ပြင်ဆင်သတ်မှတ်ပါ။', 'This page is general guidance. Define your organization’s exact retention periods and procedures based on operations and legal requirements.')}</p>
                    </Card>
                </div>
            </main>
        </PublicLayout>
    );
}
