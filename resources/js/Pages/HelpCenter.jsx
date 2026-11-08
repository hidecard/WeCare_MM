import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock3, Facebook, FileQuestion, HeartHandshake, Mail, MessageCircle, Phone, Send, ShieldCheck } from 'lucide-react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';

const faqGroups = {
    my: [
        {
            title: 'လှူဒါန်းခြင်းနှင့် ငွေပေးချေမှု',
            items: [
                ['ဘယ်လို လှူဒါန်းရမလဲ?', 'လှူဒါန်းရန်စာမျက်နှာတွင် ရန်ပုံငွေ၊ ပမာဏနှင့် ငွေပေးချေမှုနည်းလမ်းကို ရွေးပါ။ ငွေလွှဲပြီးနောက် ပြေစာပုံတင်ကာ အချက်အလက်အတည်ပြုချက်ကို ရွေးပြီး တင်သွင်းပါ။'],
                ['လှူဒါန်းငွေကို ဘယ်အချိန် စစ်ဆေးပေးမလဲ?', 'အဖွဲ့မှ ပြေစာနှင့် ပမာဏကို စစ်ဆေးပြီးနောက် အခြေအနေပြောင်းလဲပါမည်။ တင်သွင်းပြီးရရှိသော tracking ID ကို သိမ်းထားပြီး ခြေရာခံစာမျက်နှာတွင် စစ်ဆေးနိုင်ပါသည်။'],
                ['ငွေလွှဲပြေစာ မတင်နိုင်ရင် ဘာလုပ်ရမလဲ?', 'JPG, PNG သို့မဟုတ် WEBP ပုံကို 4 MB အောက်ဖြင့် တင်ပါ။ ဖုန်းကွန်ရက်မကောင်းပါက ပုံကို ပြန်ရွေးပြီး ထပ်မံကြိုးစားပါ။ မရသေးပါက support သို့ “Payment issue” ဖြင့် ဆက်သွယ်ပါ။'],
            ],
        },
        {
            title: 'ခြေရာခံခြင်း၊ ပြေစာနှင့် အချက်အလက်လုံခြုံမှု',
            items: [
                ['Tracking ID ပျောက်သွားရင်?', 'အီးမေးလ်ထည့်ထားပါက အတည်ပြုချက်ထဲတွင် ရှာပါ။ မရှိပါက ငွေလွှဲသည့်နေ့၊ ပမာဏနှင့် အသုံးပြုခဲ့သောဖုန်းနံပါတ်အချို့ကို support သို့ပေးပို့ပါ။ ပြေစာပုံအပြည့်ကို public chat မှာ မတင်ပါနှင့်။'],
                ['Donation certificate ရနိုင်ပါသလား?', 'အတည်ပြုပြီးသော လှူဒါန်းမှုအတွက် certificate link ရရှိပါက ထို link မှ download လုပ်နိုင်ပါသည်။ မရရှိပါက tracking ID ဖြင့် support ကို ဆက်သွယ်ပါ။'],
                ['ကိုယ်ရေးအချက်အလက်များကို ဘယ်လိုကာကွယ်ထားလဲ?', 'ပြေစာ၊ ဖုန်းနံပါတ်နှင့် အီးမေးလ်ကို စစ်ဆေးမှုနှင့် ဆက်သွယ်မှုအတွက်သာ အသုံးပြုပါသည်။ Public page များတွင် အိမ်လိပ်စာနှင့် အထိခိုက်လွယ်သော ကိုယ်ရေးအချက်အလက်များကို မဖော်ပြပါ။'],
            ],
        },
        {
            title: 'သတင်းပေးခြင်းနှင့် စေတနာ့ဝန်ထမ်း',
            items: [
                ['အကူအညီလိုသူအကြောင်း ဘယ်လိုသတင်းပေးရမလဲ?', 'Community စာမျက်နှာတွင် မြို့နယ်၊ အနီးစပ်ဆုံးနေရာနှင့် ဆက်သွယ်ရန်အချက်အလက်ကို တတ်နိုင်သမျှ ထည့်ပြီး တင်ပြပါ။ Reference code ကို သိမ်းထားပါ။'],
                ['စေတနာ့ဝန်ထမ်းအဖြစ် ဘယ်လိုပါဝင်ရမလဲ?', 'Community စာမျက်နှာမှ volunteer form ကို ဖြည့်ပြီး သင်ပါဝင်နိုင်သည့် မြို့နယ်၊ အချိန်နှင့် ကျွမ်းကျင်မှုကို ထည့်ပါ။'],
            ],
        },
    ],
    en: [
        {
            title: 'Donations and payments',
            items: [
                ['How do I donate?', 'Choose a fund, amount, and payment method on the Donate page. After transferring the money, upload the slip, confirm the information, and submit the donation.'],
                ['When will my donation be reviewed?', 'The team reviews the slip and amount before changing the status. Save the tracking ID shown after submission and use the status page to check progress.'],
                ['What if I cannot upload my payment slip?', 'Upload a JPG, PNG, or WEBP image under 4 MB. If the connection is weak, retry with a smaller image. If it still fails, contact support with “Payment issue”.'],
            ],
        },
        {
            title: 'Tracking, certificates, and privacy',
            items: [
                ['What if I lost my tracking ID?', 'Check your email if you provided one. Otherwise, send the transfer date, amount, and part of the phone number used to support. Do not post the full slip publicly.'],
                ['Can I get a donation certificate?', 'Approved donations may receive a certificate link. If you cannot find it, contact support with your tracking ID.'],
                ['How is my personal information protected?', 'Slips, phone numbers, and email addresses are used for review and communication. Home addresses and sensitive personal details are not published on public pages.'],
            ],
        },
        {
            title: 'Reports and volunteering',
            items: [
                ['How do I report someone who needs help?', 'Use the Community page to provide the township, nearby location, and contact details you can safely share. Keep the reference code after submitting.'],
                ['How can I volunteer?', 'Complete the volunteer form on the Community page and tell us your township, availability, and relevant skills.'],
            ],
        },
    ],
};

export default function HelpCenter() {
    const [lang, setLang] = useLanguage();
    const { support = {} } = usePage().props;
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const groups = faqGroups[lang] || faqGroups.en;
    const email = support.email || '';
    const phone = support.phone || '';
    const issueSubject = (label) => encodeURIComponent(`${label} | WeCare Myanmar`);

    const contactItems = [
        phone && { icon: Phone, label: copy('ဖုန်းဖြင့် ဆက်သွယ်ရန်', 'Call support'), value: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}` },
        email && { icon: Mail, label: copy('အီးမေးလ် ပို့ရန်', 'Email support'), value: email, href: `mailto:${email}` },
        support.telegram_url && { icon: Send, label: 'Telegram', value: copy('Telegram သို့ ဆက်သွယ်ရန်', 'Open Telegram'), href: support.telegram_url },
        support.facebook_url && { icon: Facebook, label: 'Facebook', value: copy('Facebook Messenger ဖွင့်ရန်', 'Open Messenger'), href: support.facebook_url },
    ].filter(Boolean);

    return (
        <PublicLayout active="help" lang={lang} setLang={setLang}>
            <main className="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 lg:px-8">
                <Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"><ArrowLeft className="h-4 w-4" /> {copy('မူလသို့', 'Back home')}</Link>
                <section className="mt-8 rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20 sm:p-8">
                    <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F59E0B] text-[#065F46]"><HeartHandshake className="h-6 w-6" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('အကူအညီနှင့် ဆက်သွယ်ရန်', 'Help & support')}</p><h1 className="mt-2 text-3xl font-black md:text-5xl">{copy('မေးစရာရှိပါသလား?', 'How can we help?')}</h1><p className="mt-4 max-w-2xl text-base leading-relaxed text-emerald-50/90">{copy('လှူဒါန်းမှု၊ ပြေစာ၊ ခြေရာခံခြင်း၊ သတင်းပေးခြင်းနှင့် စေတနာ့ဝန်ထမ်းကိစ္စများအတွက် အဖြေများနှင့် ဆက်သွယ်ရန်နည်းလမ်းများကို ဒီနေရာမှာ တွေ့နိုင်ပါသည်။', 'Find answers and verified support options for donations, payment slips, tracking, reports, and volunteering.')}</p></div></div>
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {contactItems.length ? contactItems.map(({ icon: Icon, label, value, href }) => <a key={href} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:ring-emerald-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"><Icon className="h-5 w-5 text-emerald-700" /><p className="mt-4 text-sm font-semibold text-slate-600">{label}</p><p className="mt-1 break-words font-bold text-slate-900">{value}</p></a>) : <div className="sm:col-span-2 lg:col-span-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950"><p className="font-black">{copy('ဆက်သွယ်ရန်အချက်အလက်များကို မကြာမီ ထည့်သွင်းပေးပါမည်။', 'Support contact details are being configured.')}</p><p className="mt-2">{copy('လက်ရှိတွင် tracking ID သို့မဟုတ် reference code ကို သိမ်းထားပြီး နောက်မှ ပြန်စစ်ဆေးနိုင်ပါသည်။', 'Please keep your tracking ID or report reference code so it can be checked when support contacts are available.')}</p></div>}
                </section>

                <section className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><Clock3 className="h-5 w-5 text-emerald-700" /><h2 className="mt-4 text-lg font-black text-slate-900">{copy('အကူအညီပေးချိန်', 'Support hours')}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{support.hours || copy('အချိန်သတ်မှတ်နေဆဲ', 'Hours are being configured')}</p></div>
                    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100"><MessageCircle className="h-5 w-5 text-emerald-700" /><h2 className="mt-4 text-lg font-black text-slate-900">{copy('မျှော်မှန်းတုံ့ပြန်ချိန်', 'Expected response')}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{support.response_time || copy('အချက်အလက်ရရှိပြီးနောက် တတ်နိုင်သမျှ မြန်မြန်ပြန်ကြားပါမည်။', 'We will respond as soon as the required details are available.')}</p></div>
                </section>

                {email && <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-black text-amber-950">{copy('ငွေပေးချေမှု ပြဿနာရှိပါသလား?', 'Having a payment problem?')}</p><p className="mt-1 text-sm text-amber-900">{copy('ပြဿနာအမျိုးအစား၊ tracking ID နှင့် လွှဲသည့်နေ့ကိုသာ ပေးပို့ပါ။ ပြေစာအပြည့်ကို public မတင်ပါနှင့်။', 'Share the issue type, tracking ID, and transfer date. Do not post the full slip publicly.')}</p></div><div className="flex flex-wrap gap-2"><a href={`mailto:${email}?subject=${issueSubject('Payment issue')}`} className="inline-flex items-center gap-2 rounded-full bg-[#065F46] px-4 py-2 text-sm font-bold text-white"><Mail className="h-4 w-4" /> {copy('ငွေပေးချေမှု ပြဿနာ', 'Payment issue')}</a><a href={`mailto:${email}?subject=${issueSubject('Wrong transfer')}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-amber-950 ring-1 ring-amber-300"><ShieldCheck className="h-4 w-4" /> {copy('မှားယွင်းလွှဲမိမှု', 'Wrong transfer')}</a></div></div></section>}

                <section className="mt-8 space-y-4" aria-label={copy('မေးလေ့ရှိသော မေးခွန်းများ', 'Frequently asked questions')}>
                    <div className="flex items-center gap-3"><FileQuestion className="h-6 w-6 text-emerald-700" /><h2 className="text-2xl font-black text-slate-900">{copy('မေးလေ့ရှိသော မေးခွန်းများ', 'Frequently asked questions')}</h2></div>
                    {groups.map((group) => <div key={group.title} className="rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6"><h3 className="text-xl font-black text-slate-900">{group.title}</h3><div className="mt-4 space-y-2">{group.items.map(([question, answer]) => <details key={question} className="group rounded-2xl border border-slate-100 bg-slate-50 p-4"><summary className="cursor-pointer list-none pr-8 text-base font-bold text-slate-900 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">{question}<span className="float-right text-emerald-700 transition group-open:rotate-45" aria-hidden="true">+</span></summary><p className="mt-3 border-t border-slate-200 pt-3 text-sm leading-relaxed text-slate-700">{answer}</p></details>)}</div></div>)}
                </section>

                <p className="mt-8 text-center text-xs text-slate-500">{copy('မသေချာသော link သို့မဟုတ် လူတစ်ဦးချင်းစီ၏ ငွေလွှဲတောင်းဆိုမှုကို မယုံကြည်မီ support မှ အတည်ပြုပါ။', 'Verify unusual links or personal transfer requests with support before sending money.')}</p>
            </main>
        </PublicLayout>
    );
}
