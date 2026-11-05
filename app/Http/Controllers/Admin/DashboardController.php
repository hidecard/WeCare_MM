<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOutreachTripRequest;
use App\Models\Donation;
use App\Models\FundPool;
use App\Models\OutreachTrip;
use App\Models\SpotReport;
use App\Models\Volunteer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'pendingDonations' => Donation::query()
                ->where('status', 'pending')
                ->with('fundPool')
                ->latest()
                ->get(),
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
            'pendingDonations' => Donation::query()
                ->where('status', 'pending')
                ->with('fundPool')
                ->latest()
                ->paginate(10),
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
            'trips' => OutreachTrip::query()->latest('trip_date')->paginate(10),
        ]);
    }

    public function spotReportsIndex()
    {
        return Inertia::render('Admin/Reports', [
            'spotReports' => SpotReport::query()->latest()->paginate(10),
        ]);
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
            'unit_cost' => ['required', 'integer', 'min:1000'],
            'is_active' => ['boolean'],
        ]);

        FundPool::query()->create([
            'title_mm' => $data['title_mm'],
            'title_en' => $data['title_en'],
            'description' => $data['description'] ?? null,
            'unit_cost' => (int) $data['unit_cost'],
            'total_raised' => 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Fund pool created successfully.');
    }

    public function updateFundPool(Request $request, FundPool $fundPool)
    {
        $data = $request->validate([
            'title_mm' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'unit_cost' => ['required', 'integer', 'min:1000'],
            'is_active' => ['boolean'],
        ]);

        $fundPool->update([
            'title_mm' => $data['title_mm'],
            'title_en' => $data['title_en'],
            'description' => $data['description'] ?? null,
            'unit_cost' => (int) $data['unit_cost'],
            'is_active' => $data['is_active'] ?? $fundPool->is_active,
        ]);

        return redirect()->back()->with('success', 'Fund pool updated successfully.');
    }

    public function destroyFundPool(FundPool $fundPool)
    {
        $fundPool->delete();

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
        $status = $request->input('status');

        if (! in_array($status, ['approved', 'rejected'], true)) {
            return redirect()->back()->withErrors(['status' => 'Invalid status value.']);
        }

        $updated = DB::transaction(function () use ($donation, $status): bool {
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
            $lockedDonation->save();

            return true;
        });

        if (! $updated) {
            return redirect()->back()->withErrors(['status' => 'This donation has already been reviewed.']);
        }

        return redirect()->back()->with('success', 'Donation status updated successfully.');
    }

    public function storeOutreachTrip(StoreOutreachTripRequest $request)
    {
        $photos = $this->storeImageSet($request->file('photos', []), 'trip-photos');
        $receiptImages = $this->storeImageSet($request->file('receipt_images', []), 'trip-receipts');

        OutreachTrip::query()->create([
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

        return redirect()->back()->with('success', 'Street outreach trip saved successfully.');
    }

    public function updateOutreachTrip(StoreOutreachTripRequest $request, OutreachTrip $outreachTrip)
    {
        $photos = $this->storeImageSet($request->file('photos', []), 'trip-photos');
        $receiptImages = $this->storeImageSet($request->file('receipt_images', []), 'trip-receipts');

        $outreachTrip->update([
            'trip_date' => $request->input('trip_date'),
            'township' => $request->input('township'),
            'elderly_helped_count' => (int) $request->input('elderly_helped_count'),
            'meals_distributed' => (int) $request->input('meals_distributed'),
            'medical_aid_count' => (int) $request->input('medical_aid_count'),
            'total_spent' => $request->input('total_spent'),
            'summary_note' => $request->input('summary_note'),
            'photos_json' => $photos !== [] ? $photos : $outreachTrip->photos_json,
            'receipt_images_json' => $receiptImages !== [] ? $receiptImages : $outreachTrip->receipt_images_json,
        ]);

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

    protected function generateCertificateCode(): string
    {
        do {
            $code = 'WC-'.Str::upper(Str::random(8));
        } while (Donation::query()->where('certificate_code', $code)->exists());

        return $code;
    }
}
