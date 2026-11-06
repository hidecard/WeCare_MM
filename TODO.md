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

## UI/UX Sprint 1 — completed in this pass

- [x] Keep placeholder metrics and contact data unchanged while improving the public UI flow.
- [x] Pass active payment methods from the public controller to the Home and Donate pages, including account number, account name, and QR URL fields.
- [x] Fix public navigation active states for Burmese and English labels, add `aria-current` and mobile menu `aria-expanded` behavior.
- [x] Add a mobile-only sticky Donate CTA so the primary action remains reachable on small screens.
- [x] Improve donation amount validation with a MMK 1,000 minimum, explicit form labels, payment-account copy action, and payment-slip image preview.
- [x] Show the donation tracking ID in the submission success dialog when the backend returns a receipt token.
- [x] Remove unrelated fallback stock photos from the public outreach gallery; show a clear empty state when real photos are unavailable.
- [x] Correct the Impact page label so completed outreach is not presented as an upcoming activity.
- [x] Add a Myanmar-friendly system font stack, smooth scrolling, and visible keyboard focus states.

## UI/UX Sprint 2 — next

- [x] Add a dedicated donation-status lookup page using the tracking ID, so status does not depend only on browser localStorage.
- [x] Add a donation confirmation summary with next steps, a copyable/displayable tracking ID, and a direct link to the status page.
- [x] Add client-side file validation for payment slips: accepted image types, 4 MB size limit, preview, and upload error state.
- [ ] Add explicit labels and error associations to all Community and Volunteer fields, then verify keyboard and screen-reader navigation.
- [ ] Add report reference numbers and a public status view for community spot reports.
- [ ] Add mobile filters for outreach activity by township and month.
- [ ] Add loading, offline/error, and retry states to public forms and status checks.
- [ ] Add a reusable shared DonationFlow component for Home and Donate pages to remove duplicated form logic.

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
