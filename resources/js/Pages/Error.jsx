import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, LifeBuoy, LockKeyhole, LogIn, SearchX, ServerCrash, Timer } from 'lucide-react';

const copyByStatus = {
    401: {
        icon: LogIn,
        title: 'Sign in required',
        description: 'You need to sign in to access this page. Please log in and try again.',
        tone: 'emerald',
    },
    403: {
        icon: LockKeyhole,
        title: 'Access denied',
        description: 'You do not have permission to view this page. If you need access, contact an administrator.',
        tone: 'amber',
    },
    404: {
        icon: SearchX,
        title: 'Page not found',
        description: 'The page you’re looking for doesn’t exist or may have been moved.',
        tone: 'emerald',
    },
    419: {
        icon: Timer,
        title: 'Session expired',
        description: 'Your session has expired for security reasons. Please refresh and try again.',
        tone: 'amber',
    },
    429: {
        icon: Timer,
        title: 'Too many requests',
        description: 'Please wait a moment before trying again. This helps keep the service reliable for everyone.',
        tone: 'amber',
    },
    500: {
        icon: ServerCrash,
        title: 'Something went wrong',
        description: 'We ran into an unexpected problem. Please try again in a moment.',
        tone: 'rose',
    },
    503: {
        icon: LifeBuoy,
        title: 'Service unavailable',
        description: 'We’re doing a bit of maintenance or experiencing high load. Please try again shortly.',
        tone: 'amber',
    },
};

export default function Error({ status, message }) {
    const meta = copyByStatus[status] ?? {
        icon: ServerCrash,
        title: 'Unexpected error',
        description: 'An unexpected error occurred. Please try again.',
        tone: 'emerald',
    };
    const Icon = meta.icon;
    const iconTone = meta.tone === 'amber' ? 'bg-amber-100 text-amber-700 ring-amber-200' : meta.tone === 'rose' ? 'bg-rose-100 text-rose-700 ring-rose-200' : 'bg-emerald-100 text-emerald-700 ring-emerald-200';
    const showMessage = message && message !== meta.description && status !== 500 && status !== 503;

    return (
        <>
            <Head title={`${status} — ${meta.title}`} />
            <div className="relative min-h-screen overflow-hidden bg-[#FFFBEB] text-slate-800">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_38%)]" />
                <main className="relative mx-auto flex min-h-screen max-w-3xl items-center px-4 py-12 sm:px-6">
                    <div className="w-full rounded-[2rem] border border-emerald-100/80 bg-white/95 p-6 shadow-xl shadow-emerald-900/5 backdrop-blur sm:p-10">
                        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-start">
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${iconTone}`}>
                                <Icon className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">Error {status}</p>
                                <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{meta.title}</h1>
                                <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">{meta.description}</p>
                                {showMessage && (
                                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700" role="status">
                                        {message}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Link href={route('home')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#065F46] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200">
                                <Home className="h-4 w-4" /> Go to home
                            </Link>
                            <button type="button" onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200">
                                <ArrowLeft className="h-4 w-4" /> Go back
                            </button>
                            {(status === 401 || status === 419) && (
                                <Link href={route('login')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-bold text-[#065F46] transition hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 sm:ml-auto">
                                    <LogIn className="h-4 w-4" /> Log in
                                </Link>
                            )}
                        </div>

                        <p className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-500">
                            Need help? Contact <a href="mailto:care@wecaremyanmar.org" className="font-semibold text-emerald-700 hover:text-emerald-800">care@wecaremyanmar.org</a>
                        </p>
                    </div>
                </main>
            </div>
        </>
    );
}
