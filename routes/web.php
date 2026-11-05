<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\SpotReportController;
use App\Http\Controllers\VolunteerController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/donate', [HomeController::class, 'donate'])->name('donate');
Route::get('/impact', [HomeController::class, 'impact'])->name('impact');
Route::get('/outreach', [HomeController::class, 'outreach'])->name('outreach');
Route::get('/community', [HomeController::class, 'community'])->name('community');
Route::middleware(['auth', 'verified'])->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::post('/donations', [DonationController::class, 'store'])->name('donations.store');
Route::get('/donations/{donation}/certificate', [DonationController::class, 'downloadCertificate'])->name('donations.certificate');
Route::post('/spot-reports', [SpotReportController::class, 'store'])->name('spot-reports.store');
Route::post('/volunteers', [VolunteerController::class, 'store'])->name('volunteers.store');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/management', [DashboardController::class, 'managementIndex'])->name('admin.management');
    Route::get('/admin/fund-pools', [DashboardController::class, 'fundPoolsIndex'])->name('admin.fund-pools.index');
    Route::get('/admin/volunteers', [DashboardController::class, 'volunteersIndex'])->name('admin.volunteers.index');
    Route::get('/admin/donations', [DashboardController::class, 'donationsIndex'])->name('admin.donations.index');
    Route::get('/admin/trips', [DashboardController::class, 'tripsIndex'])->name('admin.trips.index');
    Route::get('/admin/reports', [DashboardController::class, 'spotReportsIndex'])->name('admin.reports.index');
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
});

require __DIR__.'/auth.php';
