const STORAGE_KEY = 'wecare-donation-receipts';
export const DONATION_RECEIPT_EVENT = 'wecare:donation-receipt-updated';

export function readDonationReceipts() {
    if (typeof window === 'undefined') return [];

    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(parsed)
            ? parsed.filter((receipt) => typeof receipt?.tracking_token === 'string' && receipt.tracking_token.length > 0)
            : [];
    } catch {
        return [];
    }
}

export function writeDonationReceipts(receipts) {
    if (typeof window === 'undefined') return;

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts.slice(0, 10)));
    } catch {
        // Donation tracking remains available for the current page if browser storage is disabled.
    }
}

export function saveDonationReceipt(receipt) {
    if (!receipt || typeof receipt.tracking_token !== 'string') return;

    const entry = {
        tracking_token: receipt.tracking_token,
        donor_name: receipt.donor_name || 'Anonymous donor',
        amount: String(receipt.amount ?? '0'),
        status: receipt.status || 'pending',
        certificate_url: receipt.certificate_url || null,
    };
    const receipts = readDonationReceipts().filter((item) => item.tracking_token !== entry.tracking_token);
    writeDonationReceipts([entry, ...receipts]);

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(DONATION_RECEIPT_EVENT));
    }
}

export function removeDonationReceipt(trackingToken) {
    const receipts = readDonationReceipts().filter((item) => item.tracking_token !== trackingToken);
    writeDonationReceipts(receipts);
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(DONATION_RECEIPT_EVENT));
    }
}
