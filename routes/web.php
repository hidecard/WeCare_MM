<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ExpenseController;
use App\Http\Controllers\Admin\PaymentMethodController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SpotReportController;
use App\Http\Controllers\VolunteerController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/about', [HomeController::class, 'about'])->name('about');
Route::get('/donate', [HomeController::class, 'donate'])->name('donate');
Route::get('/impact', [HomeController::class, 'impact'])->name('impact');
Route::get('/outreach', [HomeController::class, 'outreach'])->name('outreach');
Route::get('/community', [HomeController::class, 'community'])->name('community');
Route::get('/donations/status', fn () => Inertia::render('DonationStatus'))->name('donations.status-page');
Route::get('/spot-reports/status', fn () => Inertia::render('SpotReportStatus'))->name('spot-reports.status-page');
Route::middleware(['auth', 'verified'])->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::middleware('throttle:10,1')->post('/donations', [DonationController::class, 'store'])->name('donations.store');
Route::middleware('throttle:60,1')->get('/donations/status/{trackingToken}', [DonationController::class, 'status'])->name('donations.status');
Route::get('/donations/{donation}/certificate/{certificateCode}', [DonationController::class, 'downloadCertificate'])->name('donations.certificate');
Route::middleware('throttle:5,1')->post('/spot-reports', [SpotReportController::class, 'store'])->name('spot-reports.store');
Route::middleware('throttle:60,1')->get('/spot-reports/status/{referenceCode}', [SpotReportController::class, 'status'])->name('spot-reports.status');
Route::middleware('throttle:5,10')->post('/volunteers', [VolunteerController::class, 'store'])->name('volunteers.store');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/management', [DashboardController::class, 'managementIndex'])->name('admin.management');
    Route::get('/admin/fund-pools', [DashboardController::class, 'fundPoolsIndex'])->name('admin.fund-pools.index');
    Route::get('/admin/volunteers', [DashboardController::class, 'volunteersIndex'])->name('admin.volunteers.index');
    Route::get('/admin/donations', [DashboardController::class, 'donationsIndex'])->name('admin.donations.index');
    Route::get('/admin/donations/list', [DashboardController::class, 'donationListIndex'])->name('admin.donations.list');
    Route::get('/admin/donations/{donation}/slip', [DashboardController::class, 'downloadDonationSlip'])->name('admin.donations.slip');
    Route::get('/admin/trips', [DashboardController::class, 'tripsIndex'])->name('admin.trips.index');
    Route::get('/admin/reports', [DashboardController::class, 'spotReportsIndex'])->name('admin.reports.index');
    Route::patch('/admin/reports/{spotReport}', [DashboardController::class, 'updateSpotReport'])->name('admin.reports.update');
    Route::get('/admin/reports/{spotReport}/photo', [SpotReportController::class, 'downloadPhoto'])->name('admin.reports.photo');
    Route::get('/admin/payment-methods', [PaymentMethodController::class, 'index'])->name('admin.payment-methods.index');
    Route::patch('/admin/donations/{donation}/status', [DashboardController::class, 'updateDonationStatus'])->name('admin.donations.update-status');
    Route::post('/admin/outreach-trips', [DashboardController::class, 'storeOutreachTrip'])->name('admin.outreach-trips.store');
    Route::patch('/admin/outreach-trips/{outreachTrip}', [DashboardController::class, 'updateOutreachTrip'])->name('admin.outreach-trips.update');
    Route::delete('/admin/outreach-trips/{outreachTrip}', [DashboardController::class, 'destroyOutreachTrip'])->name('admin.outreach-trips.destroy');
    Route::post('/admin/fund-pools', [DashboardController::class, 'storeFundPool'])->name('admin.fund-pools.store');
    Route::patch('/admin/fund-pools/{fundPool}', [DashboardController::class, 'updateFundPool'])->name('admin.fund-pools.update');
    Route::delete('/admin/fund-pools/{fundPool}', [DashboardController::class, 'destroyFundPool'])->name('admin.fund-pools.destroy');
    Route::post('/admin/volunteers', [DashboardController::class, 'storeVolunteer'])->name('admin.volunteers.store');
    Route::patch('/admin/volunteers/{volunteer}', [DashboardController::class, 'updateVolunteer'])->name('admin.volunteers.update');
    Route::delete('/admin/volunteers/{volunteer}', [DashboardController::class, 'destroyVolunteer'])->name('admin.volunteers.destroy');
    Route::get('/admin/expenses', [ExpenseController::class, 'index'])->name('admin.expenses.index');
    Route::post('/admin/expenses', [ExpenseController::class, 'store'])->name('admin.expenses.store');
    Route::get('/admin/expenses/{expense}/receipt', [ExpenseController::class, 'downloadReceipt'])->name('admin.expenses.receipt');
    Route::patch('/admin/expenses/{expense}', [ExpenseController::class, 'update'])->name('admin.expenses.update');
    Route::patch('/admin/expenses/{expense}/archive', [ExpenseController::class, 'archive'])->name('admin.expenses.archive');
    Route::post('/admin/payment-methods', [PaymentMethodController::class, 'store'])->name('admin.payment-methods.store');
    Route::patch('/admin/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'update'])->name('admin.payment-methods.update');
    Route::delete('/admin/payment-methods/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->name('admin.payment-methods.destroy');
});

require __DIR__.'/auth.php';
