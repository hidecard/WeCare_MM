<?php

use App\Models\SpotReport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('accepts a short community report and keeps the photo private', function () {
    Storage::fake('local');

    $this->post(route('spot-reports.store'), [
        'township' => 'Insein',
        'street_landmark' => 'Bus stop',
        'reporter_phone' => '09111111111',
        'photo' => UploadedFile::fake()->image('place.jpg'),
    ])->assertRedirect()->assertSessionHas('spot_report_reference');

    $report = SpotReport::query()->firstOrFail();
    expect($report->condition_note)->toBe('Reported from the community form.')
        ->and($report->time_seen)->not->toBeNull()
        ->and($report->photo_path)->not->toBeNull();
    Storage::disk('local')->assertExists($report->photo_path);

    $this->get('/storage/'.$report->photo_path)->assertNotFound();

    $this->actingAs(User::factory()->admin()->create())
        ->get(route('admin.reports.photo', $report))
        ->assertOk();
});
