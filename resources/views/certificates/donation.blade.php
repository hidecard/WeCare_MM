<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>WeCare Myanmar Donation Certificate</title>
    <style>
        :root { color-scheme: light; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 32px; background: #edf4ef; color: #123a2d; font-family: Georgia, "Noto Serif Myanmar", "Times New Roman", serif; }
        .actions { max-width: 1050px; margin: 0 auto 16px; display: flex; justify-content: flex-end; gap: 10px; font-family: Arial, sans-serif; }
        .actions button { border: 0; border-radius: 999px; background: #065f46; color: #fff; padding: 12px 20px; font-weight: 700; cursor: pointer; }
        .certificate { position: relative; display: flex; min-height: 700px; max-width: 1050px; margin: 0 auto; padding: 18px; background: #fffdf5; border: 2px solid #b7791f; box-shadow: 0 20px 55px rgba(15, 55, 40, .15); }
        .inner { width: 100%; padding: 56px 64px; border: 1px solid #d6b56d; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .brand { color: #065f46; font: 700 15px Arial, sans-serif; letter-spacing: .28em; text-transform: uppercase; }
        .ornament { width: 92px; height: 4px; margin: 25px auto; background: #d79a27; }
        h1 { margin: 0; color: #073f30; font-size: clamp(36px, 6vw, 62px); font-weight: 500; letter-spacing: .04em; }
        .subtitle { margin: 16px 0 28px; color: #64736b; font: 600 13px Arial, sans-serif; letter-spacing: .24em; text-transform: uppercase; }
        .presented { color: #56675d; font-size: 19px; }
        .donor { max-width: 100%; margin: 12px 0 20px; padding-bottom: 8px; border-bottom: 1px solid #d6b56d; color: #065f46; font-size: clamp(30px, 5vw, 46px); overflow-wrap: anywhere; }
        .message { max-width: 720px; color: #46584f; font-size: 18px; line-height: 1.8; }
        .amount { margin: 20px 0; color: #8a5a12; font: 700 27px Arial, sans-serif; }
        .meta { margin-top: 32px; color: #66756d; font: 12px/1.8 Arial, sans-serif; letter-spacing: .04em; }
        .signature { margin-top: 38px; padding-top: 10px; min-width: 230px; border-top: 1px solid #9ca99f; color: #53645a; font: 13px Arial, sans-serif; }
        @media (max-width: 640px) { body { padding: 12px; } .certificate { min-height: 620px; } .inner { padding: 38px 20px; } .message { font-size: 16px; } }
        @page { size: A4 landscape; margin: 12mm; }
        @media print { body { padding: 0; background: #fff; print-color-adjust: exact; -webkit-print-color-adjust: exact; } .actions { display: none; } .certificate { min-height: 175mm; box-shadow: none; break-inside: avoid; } }
    </style>
</head>
<body>
    <div class="actions">
        <button type="button" onclick="window.print()">Print / Save as PDF</button>
    </div>
    <main class="certificate" aria-label="Donation certificate">
        <section class="inner">
            <p class="brand">WeCare Myanmar</p>
            <div class="ornament"></div>
            <h1>Certificate of Appreciation</h1>
            <p class="subtitle">For a verified charitable contribution</p>
            <p class="presented">This certificate is gratefully presented to</p>
            <h2 class="donor">{{ $donation->is_anonymous ? 'Anonymous donor' : ($donation->donor_name ?: 'Supporter') }}</h2>
            <p class="message">With sincere gratitude for supporting dignified care and outreach for vulnerable elders in Myanmar.</p>
            <p class="amount">{{ number_format((float) $donation->amount, 0) }} MMK</p>
            <p class="meta">
                Certificate code: {{ $donation->certificate_code }}<br>
                Approved: {{ $donation->approved_at?->format('F j, Y') ?? '—' }}
            </p>
            <div class="signature">WeCare Myanmar<br>Community Outreach Team</div>
        </section>
    </main>
</body>
</html>
