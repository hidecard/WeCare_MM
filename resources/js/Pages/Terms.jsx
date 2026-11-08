import { Link } from '@inertiajs/react';
import { ArrowLeft, Scale } from 'lucide-react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

export default function Terms() {
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
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center gap-3">
                    <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <ArrowLeft className="h-4 w-4" /> {copy('မူလသို့', 'Back home')}
                    </Link>
                </div>

                <section className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"><Scale className="h-5 w-5" /></div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('မူဝါဒ', 'Policy')}</p>
                            <h1 className="mt-1 text-3xl font-black md:text-4xl">{copy('အသုံးပြုမှုနှင့် လှူဒါန်းမှု မူဝါဒ', 'Terms & Donation Policy')}</h1>
                            <p className="mt-3 text-base text-emerald-50/90">{copy(`နောက်ဆုံးပြင်ဆင်သည့်ရက်: ${updated}`, `Last updated: ${updated}`)}</p>
                        </div>
                    </div>
                </section>

                <div className="mt-6 space-y-5">
                    <Section title={copy('ဝဘ်ဆိုက် အသုံးပြုမှု', 'Use of the website')}>
                        <p>{copy('WeCare Myanmar ဝဘ်ဆိုက်ကို တရားဝင် ရည်ရွယ်ချက်များအတွက်သာ အသုံးပြုရပါမည်။ မမှန်ကန်သော အချက်အလက်များ တင်သွင်းခြင်း၊ အခြားသူများကို နှောင့်ယှက်ခြင်း သို့မဟုတ် ဝန်ဆောင်မှုကို အလွဲသုံးစားလုပ်ခြင်း မပြုလုပ်ရပါ။', 'You may use the WeCare Myanmar website for lawful purposes only. Do not submit false information, interfere with others, or misuse the service.')}</p>
                    </Section>

                    <Section title={copy('လှူဒါန်းမှု တင်သွင်းခြင်း', 'Submitting donations')}>
                        <ul className="list-disc space-y-2 pl-5">
                            <li>{copy('လှူဒါန်းမှုတစ်ခုကို တင်သွင်းရာတွင် ပေးပို့သော အချက်အလက်များ (ပမာဏ၊ ငွေလွှဲနည်းလမ်း၊ ပြေစာ) မှန်ကန်ကြောင်း သေချာစေရပါမည်။', 'When submitting a donation, you are responsible for providing accurate information, including amount, payment method, and payment slip.')}</li>
                            <li>{copy('လှူဒါန်းမှုများကို အုပ်ချုပ်ရေးအဖွဲ့က စစ်ဆေးအတည်ပြုပါသည်။ ပြေစာမရှင်းလင်းခြင်း၊ ပမာဏမကိုက်ညီခြင်း သို့မဟုတ် အတည်မပြုနိုင်သော အချက်အလက်များရှိပါက အချိန်ယူစစ်ဆေးနိုင်သည် သို့မဟုတ် ငြင်းပယ်နိုင်ပါသည်။', 'Donations are reviewed by the team. Submissions may take time to review or may be declined if the slip is unclear, the amount does not match, or information cannot be verified.')}</li>
                            <li>{copy('အတည်ပြုမှု မပြီးမီ “တင်သွင်းပြီး” အခြေအနေသည် လက်ခံရရှိထားကြောင်း အကြောင်းကြားချက်သာ ဖြစ်ပြီး အပြီးသတ် အတည်ပြုချက် မဟုတ်ပါ။', 'A “submitted/pending” status means your submission was received; it is not final approval.')}</li>
                        </ul>
                    </Section>

                    <Section title={copy('ရန်ပုံငွေ အသုံးပြုမှု', 'Use of funds')}>
                        <p>{copy('လှူဒါန်းမှုများကို ရွေးချယ်ထားသော ရန်ပုံငွေ သို့မဟုတ် သက်ဆိုင်ရာ ကူညီရေး လှုပ်ရှားမှုများအတွက် အသုံးပြုရန် ရည်ရွယ်ပါသည်။ အရေးပေါ်လိုအပ်ချက်၊ ပစ္စည်းရရှိနိုင်မှု သို့မဟုတ် မြေပြင်အခြေအနေများအရ အသုံးပြုမှုပုံစံ အနည်းငယ် ပြောင်းလဲနိုင်ပြီး အကူအညီကို တာဝန်ယူစိတ်ချစွာ ပေးအပ်ရန် ကြိုးပမ်းပါမည်။', 'Donations are intended for the selected fund or related outreach activities. Actual use may vary due to urgent needs, availability of supplies, or field conditions, while we aim to provide support responsibly.')}</p>
                    </Section>

                    <Section title={copy('ပြန်အမ်းငွေ/ပြင်ဆင်မှု', 'Corrections and refunds')}>
                        <p>{copy('မှားယွင်းတင်သွင်းမှု (ဥပမာ ပမာဏ၊ နည်းလမ်း၊ ပြေစာ) ရှိပါက ချက်ချင်း ဆက်သွယ်ပေးပါ။ ပြန်အမ်းငွေ သို့မဟုတ် ပြင်ဆင်နိုင်မှုသည် ငွေလွှဲထားသော ဝန်ဆောင်မှုပေးသူ၊ အတည်ပြုအခြေအနေနှင့် ဖြစ်နိုင်ချေရှိသော ကုန်ကျစရိတ်များအပေါ် မူတည်နိုင်ပါသည်။', 'If you made a mistake (amount, method, or slip), please contact us promptly. Refunds or corrections may depend on the payment provider used, the review status, and any applicable costs.')}</p>
                    </Section>

                    <Section title={copy('တာဝန်ကန့်သတ်ချက်', 'Limitation of responsibility')}>
                        <p>{copy('ဝဘ်ဆိုက်ကို တတ်နိုင်သမျှ မှန်ကန်၊ လုံခြုံစေရန် ကြိုးပမ်းပါသည်။ သို့သော် နည်းပညာချို့ယွင်းချက်၊ ပြင်ပငွေပေးချေမှုဝန်ဆောင်မှု ပြဿနာများ သို့မဟုတ် ကျွန်ုပ်တို့ ထိန်းချုပ်၍မရသော အကြောင်းအရာများအတွက် တာဝန်ကို ဥပဒေအရ ခွင့်ပြုသည့် အတိုင်းအတာအထိသာ ကန့်သတ်ထားပါသည်။', 'We work to keep the website accurate and available. However, to the extent permitted by law, we are not responsible for technical issues, third-party payment provider problems, or matters outside our control.')}</p>
                        <p>{copy('ဤမူဝါဒသည် ယေဘုယျ လမ်းညွှန်ချက်ဖြစ်ပြီး ဥပဒေရေးရာ အကြံဉာဏ်မဟုတ်ပါ။', 'This policy is general guidance and not legal advice.')}</p>
                    </Section>
                </div>
            </main>
        </PublicLayout>
    );
}
