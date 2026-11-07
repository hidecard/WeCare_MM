<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds users for every application role (idempotent).
 *
 * Usage: php artisan db:seed --class=RoleUserSeeder
 */
class RoleUserSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        if (app()->environment('production')) {
            throw new \RuntimeException('Do not seed production. Run php artisan wecare:bootstrap-admin once instead.');
        }

        $defaultPassword = env('WECARE_DEFAULT_USER_PASSWORD', 'password123');

        $usersByRole = [
            'admin' => [
                ['email' => env('WECARE_ADMIN_EMAIL', 'admin@wecare.test'), 'name' => 'WeCare Admin', 'password' => env('WECARE_ADMIN_PASSWORD', 'password123')],
                ['email' => 'admin2@wecare.test', 'name' => 'WeCare Admin 2', 'password' => $defaultPassword],
            ],
            'user' => [
                ['email' => 'test@example.com', 'name' => 'Test User', 'password' => $defaultPassword],
                ['email' => 'donor@wecare.test', 'name' => 'Sample Donor', 'password' => $defaultPassword],
                ['email' => 'volunteer@wecare.test', 'name' => 'Sample Volunteer User', 'password' => $defaultPassword],
            ],
        ];

        foreach ($usersByRole as $role => $users) {
            foreach ($users as $user) {
                User::query()->updateOrCreate(
                    ['email' => $user['email']],
                    [
                        'name' => $user['name'],
                        'email' => $user['email'],
                        'email_verified_at' => now(),
                        'password' => Hash::make($user['password']),
                        'role' => $role,
                    ],
                );
            }
        }
    }
}
