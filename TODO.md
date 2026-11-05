# WeCare_MM TODO

## Completed

- [x] Add GitHub Actions CI for PHP setup, migrations, tests, and Vite build.
- [x] Protect `.env`, `vendor`, and uploaded storage paths from accidental Git tracking.
- [x] Remove duplicate feature-table migrations so a fresh database can migrate safely.

## P0 — Before production

- [ ] Add a real admin role/policy middleware; prevent normal registered users from accessing `/admin`.
- [ ] Remove default production credentials from seeders; use a secret or a one-time bootstrap command.
- [ ] Make donation approval idempotent and transactional; prevent `total_raised` double counting.
- [ ] Wire Community report and volunteer forms to their backend endpoints.
- [ ] Replace hardcoded/demo payment accounts and fake QR visuals with verified configurable payment data.
- [ ] Move donation slips and receipts to private storage with authorized/signed downloads.
- [ ] Protect certificate downloads with donor authorization or signed tokens.

## P1 — Core operations

- [ ] Add spot-report status update, assignment, follow-up notes, and urgency workflow.
- [ ] Add audit logs for donation review, fund changes, expenses, and destructive actions.
- [ ] Replace fund-pool deletion with archive/deactivate behavior; preserve financial history.
- [ ] Add an expense ledger with categories, receipts, reporting period, and reviewer.
- [ ] Add rate limiting, duplicate-submit protection, and abuse controls to public forms.
- [ ] Add feature tests for donations, uploads, admin authorization, reports, volunteers, and migrations.
- [ ] Add notification jobs for donation review results and field-team updates.
- [ ] Rewrite README with project setup, deployment, storage, payment, and admin bootstrap instructions.

## P2 — UX and growth

- [ ] Extract shared donation, spot-report, and volunteer form components.
- [ ] Complete Burmese/English translations and add a Myanmar-friendly font stack.
- [ ] Improve mobile admin tables into card/list layouts.
- [ ] Add accessible labels, focus states, modal behavior, and screen-reader checks.
- [ ] Fix server-side pagination for public outreach and all admin lists.
- [ ] Remove duplicate/dead `Welcome.jsx` flow after confirming production entry points.
- [ ] Add donor status lookup, receipt PDF, export reports, and public monthly impact reporting.
- [ ] Add backup/restore verification and deployment monitoring.
