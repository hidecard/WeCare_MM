import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    FileText,
    HeartHandshake,
    Receipt,
    LayoutDashboard,
    List,
    MapPinned,
    Menu,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export const ADMIN_NAV_ITEMS = [
    { name: 'Overview', routeName: 'admin.dashboard', icon: LayoutDashboard },
    { name: 'Donation Review', routeName: 'admin.donations.index', icon: ShieldAlert },
    { name: 'Donation List', routeName: 'admin.donations.list', icon: List },
    { name: 'Trip Tracker', routeName: 'admin.trips.index', icon: MapPinned },
    { name: 'Spot Reports', routeName: 'admin.reports.index', icon: FileText },
    { name: 'Fund Pools', routeName: 'admin.fund-pools.index', icon: BarChart3 },
    { name: 'Expenses', routeName: 'admin.expenses.index', icon: Receipt },
    { name: 'Volunteers', routeName: 'admin.volunteers.index', icon: Users },
    { name: 'Payment Methods', routeName: 'admin.payment-methods.index', icon: CreditCard },
];

export default function AdminLayout({ title, subtitle = 'WeCare Admin', heading, actions, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const isActive = (routeName) => {
        try {
            if (typeof route().current === 'function') return route().current(routeName);
        } catch { /* ignore */ }
        try {
            const path = new URL(route(routeName), window.location.origin).pathname;
            return url === path || url.startsWith(`${path}/`);
        } catch {
            return false;
        }
    };

    return (
        <>
            {title ? <Head title={title} /> : null}
            <div className="min-h-screen bg-slate-100 text-slate-800">
                <div className="flex min-h-screen">
                    {sidebarOpen && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={() => setSidebarOpen(false)} />}
                    <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-emerald-900/10 bg-[#0b3b2f] p-4 text-white shadow-2xl transition-transform duration-300 md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <Link href={route('home')} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F59E0B] text-[#065F46] shadow-lg transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300">
                                    <HeartHandshake className="h-5 w-5" />
                                </Link>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-200">WeCare</p>
                                    <h2 className="mt-1 text-xl font-black">Admin Panel</h2>
                                </div>
                            </div>
                            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-full border border-white/15 p-2 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 md:hidden" aria-label="Close admin menu">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        </div>

                        <nav className="mt-6 space-y-2" aria-label="Admin navigation">
                            {ADMIN_NAV_ITEMS.map(({ name, routeName, icon: Icon }) => {
                                const href = route(routeName);
                                const active = isActive(routeName);
                                return (
                                    <Link
                                        key={routeName}
                                        href={href}
                                        onClick={() => setSidebarOpen(false)}
                                        aria-current={active ? 'page' : undefined}
                                        className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${active ? 'border-emerald-300/30 bg-emerald-500/15 text-white shadow-inner shadow-emerald-900/20' : 'border-white/10 bg-white/5 text-emerald-50/85 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <span className="flex items-center gap-3"><Icon className="h-4 w-4 shrink-0" />{name}</span>
                                        <ChevronRight className={`h-4 w-4 ${active ? 'text-emerald-100' : 'text-emerald-200/70'}`} />
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="mt-8 rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-50">
                            <p className="font-semibold">Private operations panel</p>
                            <p className="mt-1 text-xs text-emerald-100/90">Donation, outreach, and community oversight</p>
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
                            <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-8">
                                <div className="flex min-w-0 items-center gap-3">
                                    <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 md:hidden" aria-label="Open admin menu">
                                        <Menu className="h-5 w-5" />
                                    </button>
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-emerald-700">{subtitle}</p>
                                        <h1 className="truncate text-xl font-black text-slate-900 md:text-2xl">{heading || title}</h1>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                                    {actions}
                                    <Link href={route('home')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 sm:px-4 sm:text-sm">Home</Link>
                                    <Link href={route('logout')} method="post" as="button" className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 sm:px-4 sm:text-sm">Log Out</Link>
                                </div>
                            </div>
                        </header>

                        <main className="p-4 md:p-6 lg:p-8">
                            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
}
