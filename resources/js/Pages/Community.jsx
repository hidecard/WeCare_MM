import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Copy, HeartHandshake, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '../Components/PublicLayout';
import useLanguage from '../hooks/useLanguage';
import { myanmarMobileError, normalizeMyanmarMobile } from '../lib/myanmarMobile';

const FieldError = ({ message }) => message ? <p className="mt-1 text-xs font-medium text-red-600">{message}</p> : null;

export default function Community() {
    const [lang, setLang] = useLanguage();
    const [tab, setTab] = useState('report');
    const [copied, setCopied] = useState(false);
    const [photoError, setPhotoError] = useState('');
    const { flash = {} } = usePage().props;
    const reportForm = useForm({ township: '', street_landmark: '', reporter_phone: '', photo: null });
    const volunteerForm = useForm({ name: '', phone: '', township: '', available_days: '' });
    const copy = (myanmar, english) => (lang === 'my' ? myanmar : english);
    const phoneError = myanmarMobileError(reportForm.data.reporter_phone, lang);
    const submitReport = (event) => {
        event.preventDefault();
        if (photoError || phoneError) return;
        reportForm.transform((data) => ({ ...data, reporter_phone: normalizeMyanmarMobile(data.reporter_phone) }));
        reportForm.post(route('spot-reports.store'), { forceFormData: true, preserveScroll: true, onSuccess: () => reportForm.reset() });
    };
    const submitVolunteer = (event) => {
        event.preventDefault();
        volunteerForm.post(route('volunteers.store'), { preserveScroll: true, onSuccess: () => volunteerForm.reset() });
    };
    return (
        <>
            <PublicLayout active="community" lang={lang} setLang={setLang}>
                <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="mb-8 flex items-center gap-3"><Link href={route('home')} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200"><ArrowLeft className="h-4 w-4" /> {copy('မူလသို့', 'Back home')}</Link></div>
                    <section className="rounded-[2rem] bg-[#065F46] p-6 text-white shadow-lg shadow-emerald-900/20">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{copy('လူမှုအသိုက်အဝန်း', 'Community')}</p>
                        <h1 className="mt-2 text-3xl font-black md:text-4xl">{copy('လူမှုကူညီမည်', 'Join the outreach community')}</h1>
                        <p className="mt-3 max-w-2xl text-base text-emerald-50/80">{copy('အကူအညီလိုအပ်သူများအကြောင်း သတင်းပေးနိုင်သလို အဖွဲ့နှင့်အတူ စေတနာ့ဝန်ထမ်းလုပ်နိုင်ပါသည်။', 'Report a person in need or join the field volunteer team.')}</p>
                    </section>
                    {flash.success && (
                        <div className="mt-5 rounded-2xl border border-emerald-200 bg-white p-5 text-base text-emerald-900" role="status">
                            <p className="font-semibold">{flash.success}</p>
                            {flash.spot_report_reference && (
                                <div className="mt-3">
                                    <p className="text-base text-slate-600">{copy('သတင်းပေးမှုအမှတ်', 'Reference')}</p>
                                    <p className="mt-1 font-mono text-2xl font-black text-slate-900">{flash.spot_report_reference}</p>
                                    <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(flash.spot_report_reference); setCopied(true); } catch { setCopied(false); } }} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-4 py-3 text-base font-bold text-[#065F46]"><Copy className="h-4 w-4" />{copied ? copy('ကူးပြီးပါပြီ', 'Copied') : copy('အမှတ်ကူးရန်', 'Copy reference')}</button>
                                </div>
                            )}
                            <Link href={`${route('spot-reports.status-page')}?code=${encodeURIComponent(flash.spot_report_reference)}`} className="mt-4 inline-flex rounded-full bg-[#065F46] px-4 py-3 text-base font-bold text-white">{copy('အခြေအနေစစ်ရန်', 'Track report')}</Link>
                        </div>
                    )}
                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="flex gap-2" role="tablist" aria-label={copy('အသိုက်အဝန်းလုပ်ဆောင်ချက်', 'Community actions')}>
                                <button type="button" onClick={() => setTab('report')} role="tab" aria-selected={tab === 'report'} className={`rounded-full px-4 py-3 text-base font-semibold ${tab === 'report' ? 'bg-[#065F46] text-white' : 'bg-slate-100 text-slate-700'}`}>{copy('သတင်းပေးရန်', 'Spot report')}</button>
                                <button type="button" onClick={() => setTab('volunteer')} role="tab" aria-selected={tab === 'volunteer'} className={`rounded-full px-4 py-3 text-base font-semibold ${tab === 'volunteer' ? 'bg-[#065F46] text-white' : 'bg-slate-100 text-slate-700'}`}>{copy('စေတနာ့ဝန်ထမ်း', 'Volunteer')}</button>
                            </div>
                            {tab === 'report' ? (
                                <form className="mt-5 space-y-3" onSubmit={submitReport}>
                                    {reportForm.errors.spot_report && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{reportForm.errors.spot_report}</p>}
                                    <label htmlFor="report-township" className="block text-base font-semibold text-slate-700">{copy('မြို့နယ်', 'Township')}<input id="report-township" required value={reportForm.data.township} onChange={(event) => reportForm.setData('township', event.target.value)} aria-invalid={Boolean(reportForm.errors.township)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base" /></label><FieldError message={reportForm.errors.township} />
                                    <label htmlFor="report-landmark" className="block text-base font-semibold text-slate-700">{copy('နေရာ', 'Place')}<input id="report-landmark" required value={reportForm.data.street_landmark} onChange={(event) => reportForm.setData('street_landmark', event.target.value)} aria-invalid={Boolean(reportForm.errors.street_landmark)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base" /></label><FieldError message={reportForm.errors.street_landmark} />
                                    <label htmlFor="report-photo" className="block text-base font-semibold text-slate-700">{copy('ဓာတ်ပုံတစ်ပုံ', 'One photo')}<input id="report-photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file && file.size > 4 * 1024 * 1024) { setPhotoError(copy('ဓာတ်ပုံကို 4 MB အောက်ထားပါ။', 'Use a photo under 4 MB.')); reportForm.setData('photo', null); return; } setPhotoError(''); reportForm.setData('photo', file || null); }} className="mt-1 block w-full text-base" /></label>
                                    {photoError && <p role="alert" className="text-base font-semibold text-red-700">{photoError}</p>}
                                    <label htmlFor="report-phone" className="block text-base font-semibold text-slate-700">{copy('ဖုန်းနံပါတ်', 'Phone')}<input id="report-phone" type="tel" inputMode="tel" placeholder="09..." value={reportForm.data.reporter_phone} onChange={(event) => reportForm.setData('reporter_phone', event.target.value)} aria-invalid={Boolean(phoneError || reportForm.errors.reporter_phone)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base" /></label>
                                    <button type="submit" disabled={reportForm.processing || Boolean(phoneError)} className="w-full rounded-full bg-[#065F46] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{reportForm.processing ? copy('ပေးပို့နေသည်...', 'Sending...') : copy('တင်သွင်းရန်', 'Submit report')}</button>
                                    {(phoneError || reportForm.errors.reporter_phone) && <p role="alert" className="text-base font-semibold text-red-700">{phoneError || reportForm.errors.reporter_phone}</p>}
                                </form>
                            ) : (
                                <form className="mt-5 space-y-3" onSubmit={submitVolunteer}>
                                    {volunteerForm.errors.volunteer && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{volunteerForm.errors.volunteer}</p>}
                                    <label htmlFor="volunteer-name" className="block text-base font-semibold text-slate-700">{copy('အမည်', 'Name')}<input id="volunteer-name" required value={volunteerForm.data.name} onChange={(event) => volunteerForm.setData('name', event.target.value)} aria-invalid={Boolean(volunteerForm.errors.name)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base" /></label><FieldError message={volunteerForm.errors.name} />
                                    <label htmlFor="volunteer-phone" className="block text-base font-semibold text-slate-700">{copy('ဖုန်းနံပါတ်', 'Phone')}<input id="volunteer-phone" required type="tel" value={volunteerForm.data.phone} onChange={(event) => volunteerForm.setData('phone', event.target.value)} aria-invalid={Boolean(volunteerForm.errors.phone)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base" /></label><FieldError message={volunteerForm.errors.phone} />
                                    <label htmlFor="volunteer-township" className="block text-base font-semibold text-slate-700">{copy('မြို့နယ်', 'Township')}<input id="volunteer-township" required value={volunteerForm.data.township} onChange={(event) => volunteerForm.setData('township', event.target.value)} aria-invalid={Boolean(volunteerForm.errors.township)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base" /></label><FieldError message={volunteerForm.errors.township} />
                                    <label htmlFor="volunteer-days" className="block text-base font-semibold text-slate-700">{copy('အလုပ်ပေးနိုင်သောရက်', 'Available days')}<input id="volunteer-days" required value={volunteerForm.data.available_days} onChange={(event) => volunteerForm.setData('available_days', event.target.value)} aria-invalid={Boolean(volunteerForm.errors.available_days)} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base" /></label><FieldError message={volunteerForm.errors.available_days} />
                                    <button type="submit" disabled={volunteerForm.processing} className="w-full rounded-full bg-[#F59E0B] px-4 py-3 font-semibold text-[#065F46] disabled:cursor-not-allowed disabled:opacity-60">{volunteerForm.processing ? copy('ပေးပို့နေသည်...', 'Sending...') : copy('တက်ရောက်မည်', 'Join volunteer team')}</button>
                                </form>
                            )}
                        </div>
                        <div className="space-y-6">
                            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100"><div className="flex items-center gap-3"><HeartHandshake className="h-5 w-5 text-emerald-700" /><p className="font-bold text-slate-900">{copy('လူမှုအဖွဲ့က ဘယ်လိုကူညီမလဲ', 'How the community helps')}</p></div><ul className="mt-4 space-y-3 text-base text-slate-700"><li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {copy('အကူအညီလိုအပ်သော အချက်အလက်များကို စိတ်ချရစွာပေးပို့ပါ', 'Send reliable information about elders in need')}</li><li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {copy('မြေပြင်အဖွဲ့ကို ကူညီပံ့ပိုးပါ', 'Support outreach teams on the ground')}</li><li className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" /> {copy('စိတ်ရှည်မှုနဲ့ တက်ကြွစွာ စေတနာ့ဝန်ထမ်းလုပ်ပါ', 'Volunteer with patience and compassion')}</li></ul></div>
                            <div className="rounded-[2rem] bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100"><div className="flex items-center gap-3"><Users className="h-5 w-5 text-emerald-700" /><p className="font-bold text-slate-900">{copy('လူမှုအဖွဲ့ဝင်များ', 'Community values')}</p></div><p className="mt-4 text-base text-slate-700">{copy('ယုံကြည်မှု၊ ဂုဏ်သိက္ခာနဲ့ တိုက်ရိုက်ကူညီမှုကို အခြေခံပြီး လုပ်ဆောင်ပါသည်။', 'We value trust, dignity, and direct support for elderly persons in need.')}</p></div>
                        </div>
                    </div>
                </main>
            </PublicLayout>
        </>
    );
}
