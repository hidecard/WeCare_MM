<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOutreachTripRequest;
use App\Models\AuditLog;
use App\Models\Donation;
use App\Models\FundPool;
use App\Models\OutreachTrip;
use App\Models\SpotReport;
use App\Models\Volunteer;
use App\Notifications\DonationReviewedNotification;
use App\Services\TripExpenseSync;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    public function __construct(private TripExpenseSync $tripExpenseSync) {}

    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'pendingDonations' => $this->pendingDonations()->get(),
            'spotReports' => SpotReport::query()->latest()->take(5)->get(),
            'fundPools' => FundPool::query()->select('id', 'title_mm', 'title_en', 'unit_cost', 'total_raised')->get(),
            'recentTrips' => OutreachTrip::query()->latest('trip_date')->take(6)->get(),
            'tripSummary' => [
                'total_trips' => OutreachTrip::query()->count(),
                'total_spent' => (float) OutreachTrip::query()->sum('total_spent'),
                'total_elderly' => (int) OutreachTrip::query()->sum('elderly_helped_count'),
            ],
        ]);
    }

    public function donationsIndex()
    {
        return Inertia::render('Admin/Donations', [
            'pendingDonations' => $this->pendingDonations()->paginate(10),
            'auditTrail' => $this->donationAuditTrail(12),
        ]);
    }

    public function donationListIndex(Request $request)
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:all,pending,approved,rejected'],
            'payment_method' => ['nullable', 'string', 'max:255'],
            'fund_pool_id' => ['nullable', 'integer', 'exists:fund_pools,id'],
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'amount_min' => ['nullable', 'numeric', 'min:0'],
            'amount_max' => ['nullable', 'numeric', 'gte:amount_min'],
        ]);
        $query = $this->donationListQuery($filters);

        return Inertia::render('Admin/DonationList', [
            'donations' => $query->paginate(15)->withQueryString(),
            'filters' => $filters,
            'fundPools' => FundPool::query()->orderBy('title_en')->get(['id', 'title_mm', 'title_en']),
            'paymentMethods' => Donation::query()->select('payment_method')->distinct()->orderBy('payment_method')->pluck('payment_method'),
            'summary' => [
                'total' => Donation::query()->count(),
                'approved' => Donation::query()->where('status', 'approved')->count(),
                'pending' => Donation::query()->where('status', 'pending')->count(),
                'rejected' => Donation::query()->where('status', 'rejected')->count(),
                'approved_amount' => (float) Donation::query()->where('status', 'approved')->sum('amount'),
            ],
            'auditTrail' => $this->donationAuditTrail(15),
        ]);
    }

    public function downloadDonationSlip(Request $request, Donation $donation)
    {
        abort_unless($donation->slip_image_path && Storage::disk('local')->exists($donation->slip_image_path), 404);

        if ($request->boolean('inline')) {
            return Storage::disk('local')->response($donation->slip_image_path);
        }

        return Storage::disk('local')->download($donation->slip_image_path);
    }

    public function exportDonations(Request $request): StreamedResponse
    {
        $filters = $request->validate([
            'status' => ['nullable', 'in:all,pending,approved,rejected'],
            'payment_method' => ['nullable', 'string', 'max:255'],
            'fund_pool_id' => ['nullable', 'integer', 'exists:fund_pools,id'],
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'amount_min' => ['nullable', 'numeric', 'min:0'],
            'amount_max' => ['nullable', 'numeric', 'gte:amount_min'],
        ]);
        $query = $this->donationListQuery($filters);
        $filename = 'donations-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Date', 'Donor', 'Email', 'Phone', 'Fund pool', 'Amount (MMK)', 'Payment method', 'Status', 'Review note', 'Reviewed at', 'Tracking token', 'Certificate code']);
            $query->chunkById(200, function ($donations) use ($out): void {
                foreach ($donations as $d) {
                    fputcsv($out, [
                        $d->created_at?->toDateTimeString(),
                        $d->is_anonymous ? 'Anonymous donor' : ($d->donor_name ?: 'Unknown donor'),
                        $d->donor_email,
                        $d->phone,
                        $d->fundPool?->title_en ?? $d->fundPool?->title_mm ?? 'General',
                        (string) $d->amount,
                        $d->payment_method,
                        $d->status,
                        $d->review_note,
                        $d->reviewed_at?->toDateTimeString() ?? $d->approved_at?->toDateTimeString(),
                        $d->tracking_token,
                        $d->certificate_code,
                    ]);
                }
            });
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function tripsIndex()
    {
        return Inertia::render('Admin/Trips', [
            'trips' => OutreachTrip::query()
                ->with('syncExpense')
                ->withSum(['expenses as ledger_spent' => fn ($query) => $query->whereNull('archived_at')], 'amount')
                ->latest('trip_date')
                ->paginate(10),
        ]);
    }

    public function bulkUpdateDonations(Request $request)
    {
        $data = $request->validate([
            'donation_ids' => ['required', 'array', 'min:1'],
            'donation_ids.*' => ['integer', 'exists:donations,id'],
            'status' => ['required', 'in:approved,rejected'],
            'review_note' => ['nullable', 'string', 'max:1000', 'required_if:status,rejected'],
        ]);
        $reviewNote = filled($data['review_note'] ?? null) ? trim($data['review_note']) : null;
        $updated = 0;
        $skipped = 0;
        $notified = 0;

        foreach (array_unique($data['donation_ids']) as $id) {
            $result = $this->applyDonationReview((int) $id, $data['status'], $reviewNote);
            if ($result['updated']) {
                $updated++;
                if ($result['notified']) {
                    $notified++;
                }
            } else {
                $skipped++;
            }
        }

        return redirect()->back()->with('success', "Bulk review complete: {$updated} updated, {$skipped} skipped. {$notified} email notification(s) queued.");
    }

    public function spotReportsIndex(Request $request)
    {
        $filters = $request->validate([
            'township' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:all,unread,checked,in_progress,resolved'],
            'urgency' => ['nullable', 'in:all,low,normal,high,urgent'],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);
        $query = $this->spotReportListQuery($filters);

        return Inertia::render('Admin/Reports', [
            'spotReports' => $query->paginate(10)->withQueryString(),
            'filters' => $filters,
            'townships' => SpotReport::query()->select('township')->distinct()->orderBy('township')->pluck('township')->values(),
            'auditTrail' => $this->spotReportAuditTrail(15),
        ]);
    }

    public function updateSpotReport(Request $request, SpotReport $spotReport)
    {
        $data = $request->validate([
            'status' => ['required', 'in:unread,checked,in_progress,resolved'],
            'urgency' => ['required', 'in:low,normal,high,urgent'],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'follow_up_note' => ['nullable', 'string', 'max:4000'],
        ]);

        $spotReport->update([
            ...$data,
            'resolved_at' => $data['status'] === 'resolved' ? now() : null,
        ]);

        AuditLog::query()->create([
            'actor_id' => auth()->id(),
            'action' => 'spot_report.workflow_updated',
            'auditable_type' => SpotReport::class,
            'auditable_id' => $spotReport->id,
            'metadata' => $data,
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', 'Spot report workflow updated successfully.');
    }

    public function exportSpotReports(Request $request): StreamedResponse
    {
        $filters = $request->validate([
            'township' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:all,unread,checked,in_progress,resolved'],
            'urgency' => ['nullable', 'in:all,low,normal,high,urgent'],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);
        $query = $this->spotReportListQuery($filters);
        $filename = 'spot-reports-'.now()->format('Ymd-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Submitted at', 'Reference', 'Township', 'Landmark', 'Time seen', 'Status', 'Urgency', 'Assigned to', 'Reporter phone', 'Follow-up note', 'Condition note']);
            $query->chunkById(200, function ($reports) use ($out): void {
                foreach ($reports as $r) {
                    fputcsv($out, [
                        $r->created_at?->toDateTimeString(),
                        $r->reference_code,
                        $r->township,
                        $r->street_landmark,
                        $r->time_seen?->toDateTimeString(),
                        $r->status,
                        $r->urgency,
                        $r->assigned_to,
                        $r->reporter_phone,
                        $r->follow_up_note,
                        $r->condition_note,
                    ]);
                }
            });
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function bulkUpdateSpotReports(Request $request)
    {
        $data = $request->validate([
            'report_ids' => ['required', 'array', 'min:1'],
            'report_ids.*' => ['integer', 'exists:spot_reports,id'],
            'status' => ['required', 'in:unread,checked,in_progress,resolved'],
            'urgency' => ['nullable', 'in:low,normal,high,urgent'],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'follow_up_note' => ['nullable', 'string', 'max:4000'],
        ]);
        $updated = 0;
        foreach (array_unique($data['report_ids']) as $id) {
            $report = SpotReport::query()->find($id);
            if (! $report) {
                continue;
            }
            $payload = array_filter([
                'status' => $data['status'],
                'urgency' => $data['urgency'] ?? null,
                'assigned_to' => array_key_exists('assigned_to', $data) ? $data['assigned_to'] : null,
                'follow_up_note' => array_key_exists('follow_up_note', $data) ? $data['follow_up_note'] : null,
            ], fn ($v, $k) => $k === 'status' || $v !== null, ARRAY_FILTER_USE_BOTH);
            $payload['resolved_at'] = $data['status'] === 'resolved' ? now() : null;
            $report->update($payload);
            AuditLog::query()->create([
                'actor_id' => auth()->id(),
                'action' => 'spot_report.workflow_updated',
                'auditable_type' => SpotReport::class,
                'auditable_id' => $report->id,
                'metadata' => [...$payload, 'bulk' => true],
                'ip_address' => request()->ip(),
            ]);
            $updated++;
        }

        return redirect()->back()->with('success', "Bulk report update complete: {$updated} updated.");
    }

    public function managementIndex()
    {
        $fundPools = FundPool::query()->latest()->paginate(10);
        $fundPoolCollection = FundPool::query()->latest()->get();
        $volunteers = Volunteer::query()->latest()->paginate(10);
        $volunteerCollection = Volunteer::query()->latest()->get();

        return Inertia::render('Admin/Management', [
            'fundPools' => $fundPools,
            'volunteers' => $volunteers,
            'stats' => [
                'total_fund_pools' => $fundPoolCollection->count(),
                'available_volunteers' => $volunteerCollection->where('status', 'available')->count(),
                'total_raised' => (float) $fundPoolCollection->sum('total_raised'),
            ],
        ]);
    }

    public function fundPoolsIndex()
    {
        return Inertia::render('Admin/FundPools', [
            'fundPools' => FundPool::query()->latest()->paginate(10),
        ]);
    }

    public function volunteersIndex()
    {
        return Inertia::render('Admin/Volunteers', [
            'volunteers' => Volunteer::query()->latest()->paginate(10),
        ]);
    }

    public function storeFundPool(Request $request)
    {
        $data = $request->validate([
            'title_mm' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'description_mm' => ['nullable', 'string', 'max:255'],
            'unit_cost' => ['required', 'integer', 'min:1000'],
            'is_active' => ['boolean'],
        ]);

        FundPool::query()->create([
            'title_mm' => $data['title_mm'],
            'title_en' => $data['title_en'],
            'description' => $data['description'] ?? null,
            'description_mm' => $data['description_mm'] ?? null,
            'unit_cost' => (int) $data['unit_cost'],
            'total_raised' => 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        AuditLog::query()->create([
            'actor_id' => auth()->id(),
            'action' => 'fund_pool.created',
            'auditable_type' => FundPool::class,
            'metadata' => $data,
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', 'Fund pool created successfully.');
    }

    public function updateFundPool(Request $request, FundPool $fundPool)
    {
        $data = $request->validate([
            'title_mm' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'description_mm' => ['nullable', 'string', 'max:255'],
            'unit_cost' => ['required', 'integer', 'min:1000'],
            'is_active' => ['boolean'],
        ]);

        $fundPool->update([
            'title_mm' => $data['title_mm'],
            'title_en' => $data['title_en'],
            'description' => $data['description'] ?? null,
            'description_mm' => $request->exists('description_mm') ? ($data['description_mm'] ?? null) : $fundPool->description_mm,
            'unit_cost' => (int) $data['unit_cost'],
            'is_active' => $data['is_active'] ?? $fundPool->is_active,
        ]);

        AuditLog::query()->create([
            'actor_id' => auth()->id(),
            'action' => 'fund_pool.updated',
            'auditable_type' => FundPool::class,
            'auditable_id' => $fundPool->id,
            'metadata' => $data,
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', 'Fund pool updated successfully.');
    }

    public function destroyFundPool(FundPool $fundPool)
    {
        $fundPool->delete();

        AuditLog::query()->create([
            'actor_id' => auth()->id(),
            'action' => 'fund_pool.deleted',
            'auditable_type' => FundPool::class,
            'auditable_id' => $fundPool->id,
            'ip_address' => request()->ip(),
        ]);

        return redirect()->back()->with('success', 'Fund pool removed successfully.');
    }

    public function storeVolunteer(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'township' => ['required', 'string', 'max:255'],
            'available_days' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:available,busy,off'],
        ]);

        Volunteer::query()->create($data);

        return redirect()->back()->with('success', 'Volunteer added successfully.');
    }

    public function updateVolunteer(Request $request, Volunteer $volunteer)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'township' => ['sometimes', 'string', 'max:255'],
            'available_days' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:available,busy,off'],
        ]);

        $volunteer->update($data);

        return redirect()->back()->with('success', 'Volunteer updated successfully.');
    }

    public function destroyVolunteer(Volunteer $volunteer)
    {
        $volunteer->delete();

        return redirect()->back()->with('success', 'Volunteer removed successfully.');
    }

    public function updateDonationStatus(Request $request, Donation $donation)
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'review_note' => ['nullable', 'string', 'max:1000', 'required_if:status,rejected'],
        ]);

        $reviewNote = filled($data['review_note'] ?? null) ? trim($data['review_note']) : null;
        $result = $this->applyDonationReview($donation->id, $data['status'], $reviewNote);

        if (! $result['updated']) {
            return redirect()->back()->withErrors(['status' => 'This donation has already been reviewed.']);
        }

        return redirect()->back()->with('success', 'Donation status updated successfully.');
    }

    public function storeOutreachTrip(StoreOutreachTripRequest $request)
    {
        $photos = $this->storeImageSet($request->file('photos', []), 'trip-photos');
        $receiptImages = $this->storeImageSet($request->file('receipt_images', []), 'trip-receipts');

        $trip = OutreachTrip::query()->create([
            'trip_date' => $request->input('trip_date'),
            'township' => $request->input('township'),
            'elderly_helped_count' => (int) $request->input('elderly_helped_count'),
            'meals_distributed' => (int) $request->input('meals_distributed'),
            'medical_aid_count' => (int) $request->input('medical_aid_count'),
            'total_spent' => $request->input('total_spent'),
            'summary_note' => $request->input('summary_note'),
            'photos_json' => $photos,
            'receipt_images_json' => $receiptImages,
        ]);

        $this->tripExpenseSync->sync($trip, $request->user()?->id, $request->input('expense_category'));

        return redirect()->back()->with('success', 'Street outreach trip saved successfully.');
    }

    public function updateOutreachTrip(StoreOutreachTripRequest $request, OutreachTrip $outreachTrip)
    {
        $photos = $this->storeImageSet($request->file('photos', []), 'trip-photos');
        $receiptImages = $this->storeImageSet($request->file('receipt_images', []), 'trip-receipts');

        $existingPhotos = $outreachTrip->photos_json;
        $existingReceipts = is_array($outreachTrip->receipt_images_json) ? $outreachTrip->receipt_images_json : [];

        $outreachTrip->update([
            'trip_date' => $request->input('trip_date'),
            'township' => $request->input('township'),
            'elderly_helped_count' => (int) $request->input('elderly_helped_count'),
            'meals_distributed' => (int) $request->input('meals_distributed'),
            'medical_aid_count' => (int) $request->input('medical_aid_count'),
            'total_spent' => $request->input('total_spent'),
            'summary_note' => $request->input('summary_note'),
            'photos_json' => $photos === [] ? $existingPhotos : array_values(array_unique([...$existingPhotos, ...$photos])),
            'receipt_images_json' => $receiptImages === [] ? $existingReceipts : array_values(array_unique([...$existingReceipts, ...$receiptImages])),
        ]);

        $this->tripExpenseSync->sync($outreachTrip->refresh(), $request->user()?->id, $request->input('expense_category'));

        return redirect()->back()->with('success', 'Street outreach trip updated successfully.');
    }

    public function destroyOutreachTrip(OutreachTrip $outreachTrip)
    {
        $outreachTrip->delete();

        return redirect()->back()->with('success', 'Street outreach trip removed successfully.');
    }

    protected function storeImageSet(array $files, string $directory): array
    {
        $paths = [];

        foreach ($files as $file) {
            $filename = 'outreach-'.Str::uuid().'.'.$file->getClientOriginalExtension();
            $paths[] = Storage::disk('public')->putFileAs($directory, $file, $filename);
        }

        return $paths;
    }

    protected function pendingDonations()
    {
        return Donation::query()
            ->where('status', 'pending')
            ->with('fundPool')
            ->orderByRaw("case when phone is null or trim(phone) = '' then 1 else 0 end")
            ->oldest();
    }

    protected function generateCertificateCode(): string
    {
        do {
            $code = 'WC-'.Str::upper(Str::random(8));
        } while (Donation::query()->where('certificate_code', $code)->exists());

        return $code;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function donationListQuery(array $filters): Builder
    {
        $query = Donation::query()->with('fundPool')->latest();
        $query->when(($filters['status'] ?? null) && ($filters['status'] ?? null) !== 'all', fn ($builder) => $builder->where('status', $filters['status']));
        $query->when(($filters['payment_method'] ?? null) && ($filters['payment_method'] ?? null) !== 'all', fn ($builder) => $builder->where('payment_method', $filters['payment_method']));
        $query->when($filters['fund_pool_id'] ?? null, fn ($builder, $poolId) => $builder->where('fund_pool_id', $poolId));
        $query->when($filters['date_from'] ?? null, fn ($builder, $date) => $builder->whereDate('created_at', '>=', $date));
        $query->when($filters['date_to'] ?? null, fn ($builder, $date) => $builder->whereDate('created_at', '<=', $date));
        $query->when($filters['amount_min'] ?? null, fn ($builder, $amount) => $builder->where('amount', '>=', $amount));
        $query->when($filters['amount_max'] ?? null, fn ($builder, $amount) => $builder->where('amount', '<=', $amount));
        $query->when($filters['search'] ?? null, function ($builder, $search): void {
            $builder->where(function ($nested) use ($search): void {
                $nested->where('donor_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('certificate_code', 'like', "%{$search}%")
                    ->orWhere('tracking_token', 'like', "%{$search}%")
                    ->orWhere('payment_method', 'like', "%{$search}%");
            });
        });

        return $query;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function donationAuditTrail(int $limit): array
    {
        $logs = AuditLog::query()
            ->with('actor:id,name')
            ->where('auditable_type', Donation::class)
            ->latest()
            ->limit($limit)
            ->get();

        $ids = $logs->pluck('auditable_id')->filter()->unique()->values();
        $donations = $ids->isEmpty()
            ? collect()
            : Donation::query()->with('fundPool:id,title_mm,title_en')->whereIn('id', $ids)->get()->keyBy('id');

        return $logs->map(function (AuditLog $log) use ($donations): array {
            $d = $donations->get($log->auditable_id);

            return [
                'id' => $log->id,
                'action' => $log->action,
                'created_at' => $log->created_at?->toIso8601String(),
                'actor' => $log->actor ? ['id' => $log->actor->id, 'name' => $log->actor->name] : null,
                'donation_id' => $log->auditable_id,
                'donation' => $d ? [
                    'donor_name' => $d->is_anonymous ? 'Anonymous donor' : ($d->donor_name ?: 'Unknown donor'),
                    'amount' => (string) $d->amount,
                    'status' => $d->status,
                    'fund_pool' => $d->fundPool?->title_en ?? $d->fundPool?->title_mm ?? 'General',
                ] : null,
                'metadata' => $log->metadata,
            ];
        })->all();
    }

    /**
     * @return array{updated: bool, notified: bool}
     */
    protected function applyDonationReview(int $donationId, string $status, ?string $reviewNote): array
    {
        $updated = DB::transaction(function () use ($donationId, $status, $reviewNote): bool {
            $lockedDonation = Donation::query()->lockForUpdate()->findOrFail($donationId);

            if ($lockedDonation->status !== 'pending') {
                return false;
            }

            if ($status === 'approved') {
                $pool = FundPool::query()->lockForUpdate()->findOrFail($lockedDonation->fund_pool_id);
                $pool->increment('total_raised', $lockedDonation->amount);
                $lockedDonation->approved_at = now();
                $lockedDonation->certificate_code = $this->generateCertificateCode();
            } else {
                $lockedDonation->approved_at = null;
                $lockedDonation->certificate_code = null;
            }

            $lockedDonation->status = $status;
            $lockedDonation->review_note = $reviewNote;
            $lockedDonation->reviewed_at = now();
            $lockedDonation->save();

            return true;
        });

        if (! $updated) {
            return ['updated' => false, 'notified' => false];
        }

        $donation = Donation::query()->findOrFail($donationId);

        AuditLog::query()->create([
            'actor_id' => auth()->id(),
            'action' => 'donation.status_updated',
            'auditable_type' => Donation::class,
            'auditable_id' => $donation->id,
            'metadata' => ['status' => $status, 'review_note' => $reviewNote, 'bulk' => request()->routeIs('admin.donations.bulk-status')],
            'ip_address' => request()->ip(),
        ]);

        $notified = false;
        if (filled($donation->donor_email)) {
            try {
                Notification::route('mail', $donation->donor_email)->notify(new DonationReviewedNotification(
                    status: $donation->status,
                    donorName: $donation->is_anonymous ? 'Anonymous donor' : ($donation->donor_name ?: 'Supporter'),
                    amount: number_format((float) $donation->amount, 0),
                    reviewNote: $donation->review_note,
                    trackingUrl: route('donations.status-page').'?token='.urlencode((string) $donation->tracking_token),
                ));
                $notified = true;
            } catch (\Throwable $exception) {
                Log::warning('Donation review notification dispatch failed', [
                    'donation_id' => $donation->id,
                    'donor_email' => $donation->donor_email,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return ['updated' => true, 'notified' => $notified];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function spotReportListQuery(array $filters): Builder
    {
        return SpotReport::query()->latest()
            ->when($filters['township'] ?? null, fn ($builder, $township) => $builder->where('township', $township))
            ->when(($filters['status'] ?? null) && $filters['status'] !== 'all', fn ($builder) => $builder->where('status', $filters['status']))
            ->when(($filters['urgency'] ?? null) && $filters['urgency'] !== 'all', fn ($builder) => $builder->where('urgency', $filters['urgency']))
            ->when($filters['assigned_to'] ?? null, fn ($builder, $assignedTo) => $builder->where('assigned_to', 'like', "%{$assignedTo}%"))
            ->when($filters['date_from'] ?? null, fn ($builder, $date) => $builder->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($builder, $date) => $builder->whereDate('created_at', '<=', $date));
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function spotReportAuditTrail(int $limit): array
    {
        $logs = AuditLog::query()
            ->with('actor:id,name')
            ->where('auditable_type', SpotReport::class)
            ->latest()
            ->limit($limit)
            ->get();

        $ids = $logs->pluck('auditable_id')->filter()->unique()->values();
        $reports = $ids->isEmpty() ? collect() : SpotReport::query()->whereIn('id', $ids)->get()->keyBy('id');

        return $logs->map(function (AuditLog $log) use ($reports): array {
            $r = $reports->get($log->auditable_id);

            return [
                'id' => $log->id,
                'action' => $log->action,
                'created_at' => $log->created_at?->toIso8601String(),
                'actor' => $log->actor ? ['id' => $log->actor->id, 'name' => $log->actor->name] : null,
                'report_id' => $log->auditable_id,
                'report' => $r ? [
                    'reference_code' => $r->reference_code,
                    'township' => $r->township,
                    'status' => $r->status,
                    'urgency' => $r->urgency,
                ] : null,
                'metadata' => $log->metadata,
            ];
        })->all();
    }
}
