<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class BootstrapAdmin extends Command
{
    protected $signature = 'wecare:bootstrap-admin
        {--email= : Admin email address}
        {--name=WeCare Admin : Admin display name}
        {--password= : Admin password; omit to enter it securely}
        {--ensure : Create from WECARE_ADMIN_* when missing; otherwise only set role and verify}';

    protected $description = 'Create, repair, or rotate the production administrator account.';

    public function handle(): int
    {
        if ($this->option('ensure')) {
            return $this->ensureConfiguredAdmin();
        }

        $email = $this->option('email') ?: $this->ask('Admin email');
        $password = $this->option('password') ?: $this->secret('Admin password');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL) || strlen((string) $password) < 12) {
            $this->error('Use a valid email and a password with at least 12 characters.');

            return self::FAILURE;
        }

        User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $this->option('name'),
                'email_verified_at' => now(),
                'password' => Hash::make($password),
                'role' => 'admin',
            ],
        );

        $this->info("Admin account ready: {$email}");

        return self::SUCCESS;
    }

    private function ensureConfiguredAdmin(): int
    {
        $email = $this->option('email') ?: env('WECARE_ADMIN_EMAIL');

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Set a valid WECARE_ADMIN_EMAIL in .env or pass --email.');

            return self::FAILURE;
        }

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $user->forceFill([
                'email_verified_at' => $user->email_verified_at ?? now(),
                'role' => 'admin',
            ])->save();

            $this->info("Admin account ready: {$email}; existing password was preserved.");

            return self::SUCCESS;
        }

        $password = $this->option('password') ?: env('WECARE_ADMIN_PASSWORD');

        if (! is_string($password) || strlen($password) < 12) {
            $this->error('Set WECARE_ADMIN_PASSWORD to a value of at least 12 characters before provisioning a new admin.');

            return self::FAILURE;
        }

        User::query()->create([
            'name' => $this->option('name'),
            'email' => $email,
            'email_verified_at' => now(),
            'password' => Hash::make($password),
            'role' => 'admin',
        ]);

        $this->info("Admin account created: {$email}");

        return self::SUCCESS;
    }
}
