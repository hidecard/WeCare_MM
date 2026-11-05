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
        {--password= : Admin password; omit to enter it securely}';

    protected $description = 'Create or rotate the production administrator account.';

    public function handle(): int
    {
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
                'password' => Hash::make($password),
                'role' => 'admin',
            ],
        );

        $this->info("Admin account ready: {$email}");
        return self::SUCCESS;
    }
}
***
