<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Support\Facades\Hash;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('seeded administrator can log in and access the dashboards', function () {
    $this->seed(DatabaseSeeder::class);

    $response = $this->post('/login', [
        'email' => env('WECARE_ADMIN_EMAIL', 'admin@wecare.test'),
        'password' => env('WECARE_ADMIN_PASSWORD', 'password123'),
    ]);

    $response->assertRedirect(route('dashboard', absolute: false));
    $this->get(route('dashboard', absolute: false))->assertOk();
    $this->get(route('admin.dashboard', absolute: false))->assertOk();
});

test('bootstrapped administrator can log in and access the dashboards', function () {
    $email = 'provisioned-admin@example.test';
    $password = 'Correct-Horse-Battery-12';

    $this->artisan('wecare:bootstrap-admin', [
        '--email' => $email,
        '--password' => $password,
    ])->assertSuccessful();

    $this->post('/login', [
        'email' => $email,
        'password' => $password,
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->get(route('dashboard', absolute: false))->assertOk();
    $this->get(route('admin.dashboard', absolute: false))->assertOk();
});

test('ensure mode creates a missing administrator from supplied credentials', function () {
    $email = 'ci-admin@example.test';
    $password = 'Deploy-Admin-Password-42';

    $this->artisan('wecare:bootstrap-admin', [
        '--ensure' => true,
        '--email' => $email,
        '--password' => $password,
    ])->assertSuccessful();

    $this->post('/login', [
        'email' => $email,
        'password' => $password,
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->get(route('dashboard', absolute: false))->assertOk();
    $this->get(route('admin.dashboard', absolute: false))->assertOk();
});

test('ensure mode promotes and verifies an existing administrator without changing its password', function () {
    $email = 'existing-user@example.test';
    $password = 'Keep-Existing-Password-42';
    $user = User::factory()->unverified()->create([
        'email' => $email,
        'password' => Hash::make($password),
        'role' => 'user',
    ]);

    $this->artisan('wecare:bootstrap-admin', [
        '--ensure' => true,
        '--email' => $email,
    ])->assertSuccessful();

    $user->refresh();

    expect($user->role)->toBe('admin')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and(Hash::check($password, $user->password))->toBeTrue();
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});
