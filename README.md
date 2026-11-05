# WeCare Myanmar

WeCare Myanmar is a community-powered street outreach platform for supporting vulnerable elderly people in Myanmar. The project connects donors, field volunteers, and the outreach team in one place so that people can report someone who needs help, contribute through local mobile-payment channels, join volunteer work, and see how outreach funds are being used.

> **Project status:** Early-stage MVP. The core public flows and admin operations are implemented, but the production checklist in [`TODO.md`](TODO.md) must be completed before handling real donations at scale.

[![CI](https://github.com/hidecard/WeCare_MM/actions/workflows/ci.yml/badge.svg)](https://github.com/hidecard/WeCare_MM/actions/workflows/ci.yml)

## ရည်ရွယ်ချက်

WeCare Myanmar ရဲ့ ရည်ရွယ်ချက်က လမ်းဘေးမှာ အကူအညီလိုအပ်နေတဲ့ အသက်ကြီးသူများအတွက် အစားအစာ၊ ဆေးဝါးနဲ့ အခြေခံစောင့်ရှောက်မှုတွေကို လူမှုအသိုက်အဝန်းနဲ့ ပူးပေါင်းပြီး ပိုမိုစနစ်တကျ ပေးနိုင်ဖို့ ဖြစ်ပါတယ်။ Donor တွေက လှူဒါန်းနိုင်ပြီး၊ ပြည်သူတွေက အကူအညီလိုအပ်သူတွေကို သတင်းပေးနိုင်ပါတယ်။ Volunteer တွေက field outreach အဖွဲ့နဲ့ ဆက်သွယ်ပြီး ပါဝင်နိုင်ပါတယ်။

## What the project does

The public website provides a bilingual Burmese/English experience with the following flows:

- **Donation:** Select a fund pool, choose an amount, select a local payment method, upload a payment slip, and submit the donation for manual review.
- **Community spot report:** Send a township, landmark, time, condition description, and optional phone number to the outreach team.
- **Volunteer registration:** Submit contact and availability information to join the field team.
- **Impact:** View high-level outreach totals including elders helped, meals distributed, medical aid, townships reached, received funds, and spent funds.
- **Outreach activity:** View published outreach trips, photos, service counts, and summaries.
- **Donation certificate:** Approved donations can receive a certificate download link protected by the donation certificate code.

The private admin area provides donation review, fund-pool management, volunteer management, outreach-trip management, spot-report review, uploaded slip access, and operational summary cards.

## Technology stack

- PHP 8.4 runtime in CI; the application requires PHP `^8.3` or a compatible newer version.
- Laravel 13.
- Inertia.js 2 with React 18.
- Vite 8 and Tailwind CSS.
- SQLite for local development by default; MySQL/MariaDB can be configured for production.
- Pest for application tests.
- GitHub Actions for migration, test, and frontend-build checks.

## Project structure

```text
app/
  Http/Controllers/        Public, auth, and admin controllers
  Http/Middleware/         Inertia and admin authorization middleware
  Http/Requests/            Validation rules for public forms and uploads
  Models/                   Donation, fund pool, trip, report, volunteer, user
database/
  migrations/               Users, outreach, donation, and role schema
  seeders/                  Local/test seed data
resources/js/
  Components/               Shared React UI components and public layout
  Pages/                    Public, auth, profile, and admin pages
routes/
  web.php                   Public and admin web routes
  auth.php                  Authentication routes
.github/workflows/ci.yml    GitHub Actions CI workflow
.github/workflows/deploy.yml Hostinger SSH deployment workflow
TODO.md                     Remaining production work
```

## Requirements

Install the following before starting local development:

- PHP 8.3+; PHP 8.4 is recommended to match the locked dependency set.
- Composer 2.
- Node.js 20+ and npm.
- SQLite with the PHP `pdo_sqlite` extension, or a configured MySQL/MariaDB database.

## Local installation

Clone the repository and install the application dependencies:

```bash
git clone https://github.com/hidecard/WeCare_MM.git
cd WeCare_MM
composer install
npm ci
```

Create the local environment and application key:

```bash
cp .env.example .env
php artisan key:generate
```

For the default SQLite setup, create the database file and run migrations with local seed data:

```bash
touch database/database.sqlite
php artisan migrate --seed
php artisan storage:link
```

Build the frontend assets or start the Vite development server:

```bash
npm run build
# or, during development:
npm run dev
```

In another terminal, start Laravel:

```bash
php artisan serve
```

Open `http://localhost:8000` in a browser.

## Environment configuration

The committed `.env.example` is only a template. Never commit a real `.env` file. Important settings include:

```dotenv
APP_NAME="WeCare Myanmar"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database
CACHE_STORE=database

WECARE_ADMIN_PASSWORD=use-a-long-random-secret
WECARE_ADMIN_EMAIL=admin@example.org
```

For production, set `APP_ENV=production`, `APP_DEBUG=false`, use a real `APP_KEY`, configure the production database, set a real mail provider, and keep payment account values only in the server environment. Do not seed production or use local fallback credentials. The deploy workflow runs the forward migrations and then safely ensures the configured administrator using `WECARE_ADMIN_EMAIL` and `WECARE_ADMIN_PASSWORD` from the server `.env`: it creates the account only if missing, and otherwise ensures the admin role/email verification without changing an existing password. To create or rotate the password manually, run:

```bash
php artisan wecare:bootstrap-admin --email=admin@example.org
```

The command prompts for the password without storing it in shell history. Payment accounts are managed by administrators from **Admin → Payment Methods** and stored in the database. Only active methods are shown to donors; QR images are uploaded through that admin screen.

## Database and migrations

The normal development commands are:

```bash
php artisan migrate
php artisan db:seed
```

To rebuild a disposable local database:

```bash
php artisan migrate:fresh --seed
```

The migrations include users, cache/jobs/session support, fund pools, donations, outreach trips, spot reports, volunteers, and the user role used by admin authorization. Existing production databases should not use `migrate:fresh`; run normal forward migrations and take a backup first.

## Storage and uploaded files

The default local disk stores private donation slips under `storage/app/private`. Admin users access slips through an authorized download route; slips should not be exposed through `/public/storage`.

Outreach photos and receipt images currently use the public disk for the public outreach gallery. Before production, review the privacy and consent requirements for every uploaded image. Do not manually delete persistent storage folders during deployment.

For local development, create the standard public storage link when needed:

```bash
php artisan storage:link
```

The repository ignores `.env`, `vendor`, `node_modules`, build output, and uploaded storage paths. These files should remain on the server or be created during deployment; they should not be committed into Git.

## Admin access

Admin routes are protected by both authentication and the `admin` middleware. A user must have `role=admin` in the database to access `/admin/*`.

The local seed creates:

- An administrator with `role=admin`; the login email and password are the values of `WECARE_ADMIN_EMAIL` and `WECARE_ADMIN_PASSWORD` in `.env`.
- `test@example.com` with `role=user` and the local test password `password123`.

After copying `.env.example`, the configured local admin credentials are `admin@example.org` and `use-a-long-random-secret`. The seeder's fallback values (`admin@wecare.test` and `password123`) are used only when those environment variables are not set. These local/example credentials must not be used in production.

Production deployments intentionally do not run the seeder. The deploy workflow runs `php artisan wecare:bootstrap-admin --ensure` after migrations. This only creates a missing account using `WECARE_ADMIN_EMAIL` and `WECARE_ADMIN_PASSWORD`; existing account passwords are preserved. To reset an existing administrator password, run `php artisan wecare:bootstrap-admin --email=admin@example.org` on the server and enter a password of at least 12 characters when prompted. The command verifies the provisioned admin account so it can reach the verified dashboard.

## Donation flow and safety notes

The current payment workflow is manual-transfer based. A donor chooses a payment method, completes the transfer outside the application, uploads a slip, and waits for an admin reviewer to approve or reject the donation. Approval is transactional and protected against repeat review double-counting.

Before real public fundraising, replace the demo payment details and placeholder QR visuals with verified organization-owned accounts and real QR assets. Add payment reference numbers, duplicate-slip detection, reviewer notes, donor notifications, and a proper financial ledger. These items are tracked in [`TODO.md`](TODO.md).

## Testing and CI

Run the frontend build locally:

```bash
npm run build
```

Run the Laravel test suite when PHP and Composer dependencies are installed:

```bash
php artisan test --compact
```

GitHub Actions runs on pushes and pull requests targeting `main`. The workflow currently:

1. Sets up PHP 8.4 and Node.js 20.
2. Installs Composer and npm dependencies.
3. Creates a test environment and SQLite database.
4. Runs `migrate:fresh --seed` to catch migration/seed failures.
5. Runs Pest tests.
6. Builds Vite assets.

After a successful `CI` run on `main`, [`deploy.yml`](.github/workflows/deploy.yml) can deploy the full Laravel application to Hostinger over SSH. It updates the Git checkout without running `git clean`, preserves the server-managed `.env` and `storage/` files, installs production Composer dependencies, builds Vite assets, runs `php artisan migrate --force`, creates the storage link, and clears Laravel caches. It refuses to continue when the configured app path is unsafe, when a production `.env` is missing, or when the target directory is a non-empty directory without a Git checkout.

The deployment workflow requires these repository secrets: `HOSTINGER_SSH_HOST`, `HOSTINGER_SSH_PORT`, `HOSTINGER_SSH_USER`, `HOSTINGER_SSH_KEY`, and `HOSTINGER_APP_PATH`. `HOSTINGER_PUBLIC_PATH` is optional; when omitted, the workflow assumes `public_html` is next to the Laravel app directory and mirrors only the Laravel `public/` assets there. The SSH public key must be authorized on Hostinger. When the Hostinger account supports it, point the domain document root directly to the app's `public/` directory. When the document root is fixed at `public_html`, the workflow creates a safe public bridge and keeps the full Laravel source outside the web root.

## Hostinger deployment notes

A Hostinger deployment must use PHP 8.4.1 or newer because the locked Laravel/Symfony dependencies require it. The SSH workflow detects common Hostinger PHP 8.4 CLI names (`php8.4`, `php84`, and `ea-php84`) and stops safely with an instruction if only PHP 8.3 is available. The deployment process should update application code without deleting `.env`, `vendor`, `storage/app/public`, uploaded images, or other persistent directories. After code upload, run the normal forward migration command:

```bash
php artisan migrate --force
php artisan optimize:clear
php artisan storage:link
```

Do not run `migrate:fresh` on Hostinger production. Keep database credentials and `WECARE_ADMIN_PASSWORD` in Hostinger environment configuration, not in GitHub. A future deployment workflow should use protected GitHub Secrets and a server-side deploy script with an explicit allowlist of files to update.

## Security checklist before launch

- Configure a real admin role and verify that ordinary users receive `403` for admin routes.
- Replace all demo payment numbers and QR visuals.
- Keep donation slips private and verify signed/authorized downloads.
- Add rate limits and duplicate submission protection to public forms.
- Add audit history for donation approvals, financial changes, and destructive actions.
- Add backup and restore verification before accepting real donations.
- Review beneficiary photo consent, privacy policy, and personal-data retention.
- Run the full CI workflow successfully on the target branch.

## Contributing

Create a focused branch, make one logical change at a time, run the relevant tests/build, update [`TODO.md`](TODO.md) when a production item is completed, and open a pull request with a short description of the user and operational impact.

## License

The intended project license is MIT. Add and commit a `LICENSE` file before making a formal public release.
