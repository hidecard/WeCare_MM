import { Link } from '@inertiajs/react';
import { Globe, HeartHandshake, Menu, X } from 'lucide-react';
import { useState } from 'react';
import DonationStatusTracker from './DonationStatusTracker';

const navByLang = {
    my: [
        { key: 'home', label: 'မူလ', href: route('home') },
        { key: 'donate', label: 'လှူဒါန်း', href: route('donate') },
        { key: 'impact', label: 'အကျိုးသက်ရောက်မှု', href: route('impact') },
        { key: 'outreach', label: 'လမ်းဘေးစစ်ဆင်မှု', href: route('outreach') },
        { key: 'community', label: 'အသိုက်အဝန်း', href: route('community') },
    ],
    en: [
        { key: 'home', label: 'Home', href: route('home') },
        { key: 'donate', label: 'Donate', href: route('donate') },
        { key: 'impact', label: 'Impact', href: route('impact') },
        { key: 'outreach', label: 'Outreach', href: route('outreach') },
        { key: 'community', label: 'Community', href: route('community') },
    ],
};

export default function PublicLayout({ children, active = 'home', lang = 'my', setLang }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const navItems = navByLang[lang] ?? navByLang.my;

    return (
        <div className="min-h-screen bg-[#FFFBEB] text-slate-800">
            <header className="sticky top-0 z-40 border-b border-amber-100 bg-[#065F46]/95 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 text-white sm:px-6 lg:px-8">
                    <Link href={route('home')} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-[#065F46]">
                            <HeartHandshake className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold tracking-wide">WeCare Myanmar</p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100">Street outreach</p>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-4 md:flex">
                        {navItems.map((item) => {
                            const isActive = active === item.key;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`text-sm transition ${isActive ? 'font-semibold text-white' : 'text-emerald-50/80 hover:text-white'}`}
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
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-emerald-50 hover:bg-white/15"
                        >
                            <Globe className="h-4 w-4" />
                            {lang === 'my' ? 'ENG' : 'MM'}
                        </button>

                        <button
                            type="button"
                            className="inline-flex rounded-full border border-white/15 bg-white/10 p-2 text-white md:hidden"
                            onClick={() => setMobileOpen((current) => !current)}
                            aria-label={lang === 'my' ? 'မီနူးဖွင့်ရန်' : 'Toggle menu'}
                            aria-expanded={mobileOpen}
                            aria-controls="mobile-navigation"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {mobileOpen && (
                    <div id="mobile-navigation" className="border-t border-white/10 bg-[#065F46] px-4 py-3 md:hidden">
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active === item.key ? 'page' : undefined}
                                    className={`rounded-lg px-3 py-2 text-sm hover:bg-white/10 ${active === item.key ? 'bg-white/10 font-semibold text-white' : 'text-emerald-50/90'}`}
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
            {children}

            {active !== 'donate' && (
                <Link
                    href={route('donate')}
                    className="fixed inset-x-4 bottom-4 z-30 inline-flex items-center justify-center rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#065F46] shadow-lg shadow-amber-900/20 sm:hidden"
                >
                    {lang === 'my' ? 'လှူဒါန်းမည်' : 'Donate now'}
                </Link>
            )}

            <footer className="border-t border-emerald-100 bg-[#065F46] text-white">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F59E0B] text-[#065F46]">
                                <HeartHandshake className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold tracking-wide">WeCare Myanmar</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100">Street outreach</p>
                            </div>
                        </div>
                        <p className="mt-4 max-w-md text-sm text-emerald-50/80">
                            Supporting vulnerable elders with food, medicine, and dignity through trusted local outreach and pooled community care.
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">Quick links</p>
                        <div className="mt-4 space-y-2 text-sm text-emerald-50/80">
                            {navItems.map((item) => (
                                <Link key={item.href} href={item.href} className="block hover:text-white">
                                    {item.label}
                                </Link>
                            ))}
                            <Link href={route('donations.status-page')} className="block hover:text-white">
                                {lang === 'my' ? 'လှူဒါန်းမှုအခြေအနေ' : 'Donation status'}
                            </Link>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">Contact</p>
                        <div className="mt-4 space-y-2 text-sm text-emerald-50/80">
                            <p>+95 9 123 456 789</p>
                            <p>care@wecaremyanmar.org</p>
                            <p>Yangon, Myanmar</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 text-xs text-emerald-50/80 sm:px-6 lg:px-8">
                        <p>© 2026 WeCare Myanmar</p>
                        <p>Trusted local outreach • Privacy-first support</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
