import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-[#FFFBEB] px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl rounded-[2rem] border border-emerald-200 bg-white p-6 shadow-sm shadow-emerald-100 md:p-10">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Operations</p>
                            <h1 className="mt-2 text-3xl font-black text-slate-900">Dashboard</h1>
                        </div>
                        <Link href={route('home')} className="rounded-full bg-[#065F46] px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                            Go to home
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-amber-700">Fund pools</p>
                            <p className="mt-3 text-3xl font-black text-slate-900">Live</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Trips</p>
                            <p className="mt-3 text-3xl font-black text-slate-900">Logged</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-700">Donors</p>
                            <p className="mt-3 text-3xl font-black text-slate-900">Verified</p>
                        </div>
                    </div>

                    <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                        This dashboard is available as a stable fallback for the standard authenticated route. Use the WeCare Myanmar admin dashboard for the full outreach operations flow.
                    </div>
                </div>
            </div>
        </>
    );
}
