import { Link, usePage } from '@inertiajs/react';
import { Globe, HeartHandshake, Menu, X } from 'lucide-react';
import { useState } from 'react';
import DonationStatusTracker from './DonationStatusTracker';
import Seo from './Seo';

const navByLang = {
    my: [
        { key: 'home', label: 'မူလ', href: route('home') },
        { key: 'donate', label: 'လှူဒါန်းရန်', href: route('donate') },
        { key: 'impact', label: 'သက်ရောက်မှု', href: route('impact') },
        { key: 'outreach', label: 'လမ်းဘေးကူညီရေး', href: route('outreach') },
        { key: 'community', label: 'အသိုက်အဝန်း', href: route('community') },
        { key: 'status', label: 'ခြေရာခံ', href: route('donations.status-page') },
    ],
    en: [
        { key: 'home', label: 'Home', href: route('home') },
        { key: 'donate', label: 'Donate', href: route('donate') },
        { key: 'impact', label: 'Impact', href: route('impact') },
        { key: 'outreach', label: 'Outreach', href: route('outreach') },
        { key: 'community', label: 'Community', href: route('community') },
        { key: 'status', label: 'Track gift', href: route('donations.status-page') },
    ],
};

export default function PublicLayout({ children, active = 'home', lang = 'my', setLang }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navItems = navByLang[lang] ?? navByLang.my;
    const { seo } = usePage().props;

    return (
        <div className="min-h-screen bg-[#FFFBEB] text-slate-800">
            <Seo lang={lang} seo={seo} />
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[#F59E0B] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#065F46]">
                {lang === 'my' ? 'အကြောင်းအရာသို့ ကျော်သွားရန်' : 'Skip to content'}
            </a>
            <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-[#065F46]/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-white sm:px-6 lg:px-8">
                    <Link href={route('home')} className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-[#065F46] shadow-sm">
                            <HeartHandshake className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold tracking-wide">WeCare Myanmar</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/90">Street outreach</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-1 md:flex" aria-label={lang === 'my' ? 'အဓိက မီနူး' : 'Main navigation'}>
                        {navItems.map((item) => {
                            const isActive = active === item.key;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`rounded-full px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${isActive ? 'bg-white/15 font-semibold text-white' : 'text-emerald-50/90 hover:bg-white/10 hover:text-white'}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setLang?.((current) => (current === 'my' ? 'en' : 'my'))}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-emerald-50 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300"
                            aria-label={lang === 'my' ? 'Switch to English' : 'မြန်မာဘာသာသို့ ပြောင်းရန်'}
                        >
                            <Globe className="h-4 w-4" />
                            {lang === 'my' ? 'ENG' : 'MM'}
                        </button>

                        <button
                            type="button"
                            className="inline-flex rounded-full border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 md:hidden"
                            onClick={() => setMobileOpen((current) => !current)}
                            aria-label={lang === 'my' ? 'မီနူးဖွင့်/ပိတ်ရန်' : 'Toggle menu'}
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-navigation"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div id="mobile-navigation" className="border-t border-white/10 bg-[#065F46] px-4 py-3 md:hidden">
                        <div className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active === item.key ? 'page' : undefined}
                                    className={`rounded-xl px-3 py-3 text-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${active === item.key ? 'bg-white/15 font-semibold text-white' : 'text-emerald-50/90 hover:bg-white/10'}`}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            <DonationStatusTracker lang={lang} />
            <div id="main-content">{children}</div>

            {active !== 'donate' && (
                <Link
                    href={route('donate')}
                    className="fixed inset-x-4 z-30 inline-flex items-center justify-center rounded-full bg-[#F59E0B] px-5 py-3.5 text-sm font-bold text-[#065F46] shadow-lg shadow-amber-900/20 transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300 sm:hidden"
                    style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                >
                    {lang === 'my' ? 'ယခု လှူဒါန်းမည်' : 'Donate now'}
                </Link>
            )}

            <footer className="border-t border-emerald-800/30 bg-[#065F46] pb-[max(0px,env(safe-area-inset-bottom))] text-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-[#065F46]">
                                <HeartHandshake className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold tracking-wide">WeCare Myanmar</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/90">Street outreach</p>
                            </div>
                        </div>
                        <p className="mt-4 max-w-md text-base leading-relaxed text-emerald-50/85">
                            {lang === 'my'
                                ? 'လမ်းဘေးရှိ အကူအညီလိုအပ်သော သက်ကြီးရွယ်အိုများအတွက် အစားအစာ၊ ဆေးဝါးနှင့် ဂုဏ်သိက္ခာရှိသော စောင့်ရှောက်မှုကို ယုံကြည်စိတ်ချရစွာ ပေးအပ်ပါသည်။'
                                : 'Supporting vulnerable elders with food, medicine, and dignity through trusted local outreach and pooled community care.'}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100/90">{lang === 'my' ? 'အမြန်လင့်ခ်များ' : 'Quick links'}</p>
                        <div className="mt-4 space-y-2 text-sm text-emerald-50/85">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href} className="block rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                                    {item.label}
                                </Link>
                            ))}
                            <Link href={route('spot-reports.status-page')} className="block rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
                                {lang === 'my' ? 'သတင်းပေးမှု အခြေအနေ' : 'Report status'}
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100/90">{lang === 'my' ? 'ဆက်သွယ်ရန်' : 'Contact'}</p>
                        <div className="mt-4 space-y-2 text-sm text-emerald-50/85">
                            <p>+95 9 123 456 789</p>
                            <p>care@wecaremyanmar.org</p>
                            <p>Yangon, Myanmar</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 text-xs text-emerald-50/75 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                        <p>© 2026 WeCare Myanmar</p>
                        <p>{lang === 'my' ? 'ယုံကြည်စိတ်ချရသော ဒေသခံ ကူညီရေး • ကိုယ်ရေးကိုယ်တာ ဦးစားပေး' : 'Trusted local outreach • Privacy-first support'}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
