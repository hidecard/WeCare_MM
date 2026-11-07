import { Link } from '@inertiajs/react';
import { HeartHandshake, ShieldCheck } from 'lucide-react';

export default function GuestLayout({ children, title, subtitle, wide = false }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#FFFBEB] text-slate-800">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_38%)]" />
            <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                    <div className="hidden rounded-[2rem] bg-gradient-to-br from-[#065F46] via-[#0f766e] to-[#115e59] p-8 text-white shadow-xl shadow-emerald-900/15 lg:block">
                        <Link href={route('home')} className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F59E0B] text-[#065F46] shadow-sm">
                                <HeartHandshake className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold tracking-wide">WeCare Myanmar</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-100/90">Street outreach</p>
                            </div>
                        </Link>
                        <h1 className="mt-8 max-w-md text-3xl font-black leading-tight">Support trusted outreach for elders on Myanmar’s streets.</h1>
                        <p className="mt-4 max-w-md text-sm leading-relaxed text-emerald-50/90">Sign in to manage donations, outreach trips, and community support with care and transparency.</p>
                        <div className="mt-8 space-y-3 text-sm text-emerald-50/90">
                            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-300" /> Secure account access</p>
                            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-300" /> Review donations and outreach updates</p>
                            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-300" /> Built for trusted local operations</p>
                        </div>
                    </div>

                    <div className={`w-full ${wide ? 'lg:max-w-xl' : 'lg:max-w-md'} lg:justify-self-end`}>
                        <div className="mb-5 flex items-center justify-between lg:hidden">
                            <Link href={route('home')} className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#065F46] text-[#F59E0B]">
                                    <HeartHandshake className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900">WeCare Myanmar</p>
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-700">Street outreach</p>
                                </div>
                            </Link>
                        </div>

                        <div className="rounded-[2rem] border border-emerald-100/80 bg-white/95 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur sm:p-8">
                            {title && <h2 className="text-2xl font-black text-slate-900">{title}</h2>}
                            {subtitle && <p className="mt-2 text-sm leading-relaxed text-slate-600">{subtitle}</p>}
                            <div className={title || subtitle ? 'mt-6' : ''}>{children}</div>
                        </div>

                        <p className="mt-4 text-center text-xs text-slate-500">
                            <Link href={route('home')} className="font-semibold text-emerald-700 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">← Back to home</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
