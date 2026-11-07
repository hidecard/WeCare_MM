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
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

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
        ]);
    }

    public function donationListIndex(Request $request)
    {
        $query = Donation::query()->with('fundPool')->latest();
        $query->when($request->filled('status') && $request->input('status') !== 'all', fn ($builder) => $builder->where('status', $request->input('status')));
        $query->when($request->filled('payment_method') && $request->input('payment_method') !== 'all', fn ($builder) => $builder->where('payment_method', $request->input('payment_method')));
        $query->when($request->filled('search'), function ($builder) use ($request): void {
            $search = $request->string('search')->toString();
            $builder->where(function ($nested) use ($search): void {
                $nested->where('donor_name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('certificate_code', 'like', "%{$search}%");
            });
        });

        return Inertia::render('Admin/DonationList', [
            'donations' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['status', 'payment_method', 'search']),
            'paymentMethods' => Donation::query()->select('payment_method')->distinct()->orderBy('payment_method')->pluck('payment_method'),
            'summary' => [
                'total' => Donation::query()->count(),
                'approved' => Donation::query()->where('status', 'approved')->count(),
                'pending' => Donation::query()->where('status', 'pending')->count(),
                'rejected' => Donation::query()->where('status', 'rejected')->count(),
                'approved_amount' => (float) Donation::query()->where('status', 'approved')->sum('amount'),
            ],
        ]);
    }

    public function downloadDonationSlip(Donation $donation)
    {
        abort_unless($donation->slip_image_path && Storage::disk('local')->exists($donation->slip_image_path), 404);

        return Storage::disk('local')->download($donation->slip_image_path);
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

    public function spotReportsIndex()
    {
        return Inertia::render('Admin/Reports', [
            'spotReports' => SpotReport::query()->latest()->paginate(10),
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

        $status = $data['status'];
        $reviewNote = filled($data['review_note'] ?? null) ? trim($data['review_note']) : null;

        $updated = DB::transaction(function () use ($donation, $status, $reviewNote): bool {
            $lockedDonation = Donation::query()->lockForUpdate()->findOrFail($donation->id);

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
            $lockedDonation->save();

            return true;
        });

        if (! $updated) {
            return redirect()->back()->withErrors(['status' => 'This donation has already been reviewed.']);
        }

        $donation->refresh();

        AuditLog::query()->create([
            'actor_id' => auth()->id(),
            'action' => 'donation.status_updated',
            'auditable_type' => Donation::class,
            'auditable_id' => $donation->id,
            'metadata' => ['status' => $status, 'review_note' => $reviewNote],
            'ip_address' => request()->ip(),
        ]);

        if (filled($donation->donor_email)) {
            Notification::route('mail', $donation->donor_email)->notify(new DonationReviewedNotification(
                status: $donation->status,
                donorName: $donation->is_anonymous ? 'Anonymous donor' : ($donation->donor_name ?: 'Supporter'),
                amount: number_format((float) $donation->amount, 0),
                reviewNote: $donation->review_note,
                trackingUrl: route('donations.status-page').'?token='.urlencode((string) $donation->tracking_token),
            ));
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
}
