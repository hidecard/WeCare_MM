import { Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';
import useLanguage from '../hooks/useLanguage';

const currency = new Intl.NumberFormat('en-MM', { style: 'currency', currency: 'MMK', maximumFractionDigits: 0 });

export default function DonationCertificate({ donation = {} }) {
    const [lang] = useLanguage();
    const certificateRef = useRef(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    const handleDownload = async () => {
        if (!certificateRef.current || isDownloading) return;

        setIsDownloading(true);
        setDownloadError('');

        try {
            if (document.fonts?.ready) await document.fonts.ready;

            const imageBlob = await toBlob(certificateRef.current, {
                backgroundColor: '#fffdf5',
                cacheBust: true,
                pixelRatio: 3,
            });
            if (!imageBlob) throw new Error('Could not create certificate image.');
            const imageUrl = URL.createObjectURL(imageBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = imageUrl;
            downloadLink.download = `WeCare-Certificate-${donation.certificate_code || 'donation'}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            window.setTimeout(() => URL.revokeObjectURL(imageUrl), 1000);
        } catch {
            setDownloadError(lang === 'my'
                ? 'ပုံဖိုင်ထုတ်ယူမရပါ။ စာမျက်နှာကို ပြန်ဖွင့်ပြီး ထပ်မံကြိုးစားပါ။'
                : 'The image could not be created. Please reload the page and try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <Head title={lang === 'my' ? 'လှူဒါန်းမှု Certificate' : 'Donation Certificate'} />
            <main className="min-h-screen bg-[#edf4ef] px-3 py-5 sm:px-6 sm:py-8">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 font-sans">
                        <Link href={route('home')} className="rounded-full border border-emerald-900/10 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50">
                            {lang === 'my' ? 'WeCare သို့ ပြန်သွားရန်' : 'Back to WeCare'}
                        </Link>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="rounded-full bg-[#065F46] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
                        >
                            {isDownloading
                                ? (lang === 'my' ? 'ပုံဖိုင် ပြုလုပ်နေသည်…' : 'Creating image…')
                                : (lang === 'my' ? 'PNG ပုံအဖြစ် Download ရယူရန်' : 'Download certificate as PNG')}
                        </button>
                    </div>

                    {downloadError && (
                        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                            {downloadError}
                        </p>
                    )}

                    <article
                        ref={certificateRef}
                        aria-label="Donation certificate"
                        className="mx-auto flex w-full items-stretch border-[8px] border-double border-[#b7791f] bg-[#fffdf5] p-[2%] shadow-xl"
                        style={{ aspectRatio: '1.414 / 1' }}
                    >
                        <section className="flex w-full flex-col items-center justify-center border border-[#d6b56d] px-[3%] py-[2%] text-center font-serif text-[#123a2d]">
                            <p className="font-sans text-[clamp(8px,1.5vw,15px)] font-bold uppercase tracking-[0.28em] text-[#065f46]">WeCare Myanmar</p>
                            <div className="my-[2.5%] h-1 w-[9%] bg-[#d79a27]" />
                            <h1 className="m-0 text-[clamp(19px,5.5vw,62px)] font-medium tracking-wide text-[#073f30]">Certificate of Appreciation</h1>
                            <p className="mb-[2%] mt-[1.5%] font-sans text-[clamp(7px,1.3vw,13px)] font-semibold uppercase tracking-[0.2em] text-[#64736b]">For a verified charitable contribution</p>
                            <p className="text-[clamp(10px,1.8vw,19px)] text-[#56675d]">This certificate is gratefully presented to</p>
                            <h2 className="my-[1.5%] max-w-full break-words border-b border-[#d6b56d] px-[2%] pb-2 text-[clamp(18px,4.5vw,46px)] font-normal text-[#065f46]">
                                {donation.donor_name || 'Supporter'}
                            </h2>
                            <p className="max-w-[78%] text-[clamp(9px,1.7vw,18px)] leading-relaxed text-[#46584f]">
                                With sincere gratitude for supporting dignified care and outreach for vulnerable elders in Myanmar.
                            </p>
                            <p className="my-[2%] font-sans text-[clamp(15px,3vw,27px)] font-bold text-[#8a5a12]">
                                {currency.format(Number(donation.amount) || 0)}
                            </p>
                            <p className="font-sans text-[clamp(7px,1.2vw,12px)] leading-relaxed tracking-wide text-[#66756d]">
                                Certificate code: {donation.certificate_code}<br />
                                Approved: {donation.approved_date || '—'}
                            </p>
                            <div className="mt-[3%] min-w-[24%] border-t border-[#9ca99f] pt-2 font-sans text-[clamp(7px,1.3vw,13px)] text-[#53645a]">
                                WeCare Myanmar<br />Community Outreach Team
                            </div>
                        </section>
                    </article>

                    <p className="mt-4 text-center text-sm text-slate-600">
                        {lang === 'my' ? 'PNG ပုံဖိုင်ကို ဖုန်း၏ Downloads ထဲသို့ သိမ်းဆည်းပေးပါမည်။' : 'The PNG image will be saved to your device downloads.'}
                    </p>
                </div>
            </main>
        </>
    );
}
