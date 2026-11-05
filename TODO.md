# WeCare_MM TODO

## Completed

- [x] Add GitHub Actions CI for PHP setup, migrations, tests, and Vite build.
- [x] Protect `.env`, `vendor`, and uploaded storage paths from accidental Git tracking.
- [x] Remove duplicate feature-table migrations so a fresh database can migrate safely.
- [x] Add explicit user roles and protect admin routes with admin middleware.
- [x] Make donation approval transactional and reject repeat reviews.
- [x] Wire Community and Home report/volunteer forms to backend endpoints.
- [x] Store donation slips privately and protect admin slip/certificate downloads.
- [x] Add a safe Hostinger SSH deployment workflow that preserves `.env` and `storage/`.
- [x] Mirror only Laravel `public/` assets into a fixed Hostinger `public_html` root when needed.
- [x] Add admin-managed payment methods with account details, active status, ordering, and QR uploads.
- [x] Add a one-time production admin bootstrap command and document the production credential flow.
- [x] Rewrite README with project setup, deployment, storage, payment, and admin bootstrap instructions.
- [x] Add spot-report status, urgency, assignment, follow-up notes, and resolved timestamps.
- [x] Add public-form rate limits and recent duplicate-submit protection.
- [x] Add audit logs for donation reviews, spot-report workflow changes, and fund-pool changes.

## P0 — Before production

- [ ] Add action-level policies for individual admin resources.
- [ ] Run the production admin bootstrap command on Hostinger with the real admin email and password.
- [ ] Add verified organization payment accounts and QR images through Admin → Payment Methods before launch.

## P1 — Core operations

- [ ] Extend audit logs to expenses and other destructive actions.
- [ ] Replace fund-pool deletion with archive/deactivate behavior; preserve financial history.
- [ ] Add an expense ledger with categories, receipts, reporting period, and reviewer.
- [ ] Add rate limiting, duplicate-submit protection, and abuse controls to public forms.
- [ ] Add feature tests for donations, uploads, admin authorization, reports, volunteers, and migrations.
- [ ] Add notification jobs for donation review results and field-team updates.
- [ ] Run the first Hostinger deployment and verify document root, database, uploads, and rollback procedure.

## P2 — UX and growth

- [ ] Extract shared donation, spot-report, and volunteer form components.
- [ ] Complete Burmese/English translations and add a Myanmar-friendly font stack.
- [ ] Improve mobile admin tables into card/list layouts.
- [ ] Add accessible labels, focus states, modal behavior, and screen-reader checks.
- [ ] Fix server-side pagination for public outreach and all admin lists.
- [ ] Remove duplicate/dead `Welcome.jsx` flow after confirming production entry points.
- [ ] Add donor status lookup, receipt PDF, export reports, and public monthly impact reporting.
- [ ] Add backup/restore verification and deployment monitoring.
