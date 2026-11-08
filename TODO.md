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
- [x] Add explicit labels and error associations to all Community and Volunteer fields, then verify keyboard and screen-reader navigation.
- [x] Add report reference numbers and a public status view for community spot reports without exposing beneficiary personal information.
- [x] Add mobile-friendly filters for outreach activity by township and month, including a clear-filters action and empty state.
- [x] Add loading, offline/error, and retry states to public forms and status checks.
- [x] Extract the shared fund-pool and amount selector into a reusable DonationFlow component used by Home and Donate.
- [x] Move the shared payment, donor-details, slip-upload, and submit-step logic into DonationFlowSteps used by Home and Donate without changing the donation endpoint behavior.

## P0 — Before production

- [x] Add action-level policies for individual admin resources.
- [x] Run the production admin bootstrap command on Hostinger with the real admin email and password.
- [x] Add verified organization payment accounts and QR images through Admin → Payment Methods before launch.

## P1 — Core operations

- [x] Extend audit logs to expenses and other destructive actions.
- [x] Replace fund-pool deletion with archive/deactivate behavior; preserve financial history.
- [x] Add an expense ledger with categories, receipts, reporting period, and reviewer.
- [x] Add rate limiting, duplicate-submit protection, and abuse controls to public forms.
- [x] Add feature tests for donations, uploads, admin authorization, reports, volunteers, and migrations.
- [x] Add notification jobs for donation review results and field-team updates.
- [x] Run the first Hostinger deployment and verify document root, database, uploads, and rollback procedure.

## P2 — UX and growth

- [x] Extract shared donation, spot-report, and volunteer form components.
- [x] Complete Burmese/English translations across every remaining admin and public label; Myanmar-friendly font stack is already added.
- [x] Improve mobile admin donation review and spot-report tables into touch-friendly card/list layouts while keeping desktop tables.
- [x] Add accessible labels, visible focus states, and keyboard-safe modal behavior to public flows.
- [x] Run a full screen-reader and keyboard navigation pass on public and admin pages.
- [x] Add server-side pagination and query filters to public outreach; existing admin lists already use paginator responses.
- [x] Remove duplicate/dead `Welcome.jsx` flow after confirming production entry points.
- [x] Add donor status lookup, receipt PDF, export reports, and public monthly impact reporting.
- [x] Add backup/restore verification and deployment monitoring.
- [x] Add bilingual Open Graph/Twitter share metadata and a 1200×630 WeCare Myanmar preview image to all public frontend pages.

## Completed record — latest work

- [x] Pull the latest remote production/features update and resolve the Outreach pagination merge conflict without dropping remote ledger/photo-gallery changes.
- [x] Add server-side Outreach pagination with township/month query filters and ledger-aware trip totals.
- [x] Add bilingual Open Graph/Twitter metadata to the shared Blade head and SPA SEO updater.
- [x] Add the 1200×630 Burmese/English WeCare Myanmar social preview artwork in PNG/SVG formats.
- [x] Run the frontend production build and `git diff --check` after the latest UI/SEO changes.
- [x] Run `npm audit --omit=dev`; no production dependency vulnerabilities were reported.
- [x] Pull the latest remote privacy/about/data-handling/care-detail features and preserve them while resolving the HomeController merge.
- [x] Add an initial loading skeleton so the app does not show a blank screen while the Inertia bundle loads.
- [x] Add QR lightbox viewing, payment-slip client-side compression, and an upload optimization state to the donation flow.

## Next roadmap — donor trust, admin operations, and growth

These are the next tasks requested after the Admin search/filter milestone. Keep each checkbox unchecked until the implementation is complete and verified in the live flow.

### 1. Admin search and filters

- [x] Add donation search by tracking ID, donor phone, donor name, and payment method to the admin donation list backend.
- [x] Add donation filter query support for pending/approved/rejected status, fund pool, date range, and amount range.
- [x] Add spot-report filter query support for township, status, urgency, assignee, and date range.
- [ ] Add expense filters for category, reporting period, reviewer, linked outreach trip, and amount range.
- [x] Preserve filters in query strings and pagination links.
- [x] Add clear-filter buttons and mobile-friendly filter controls.
- [ ] Add empty states and result counts for every admin filter view.

### 2. Donation status timeline and donor experience

- [x] Add a reviewed_at timestamp and return submitted/reviewed/approved dates from the donation status API.
- [x] Redesign the donation status result as a clear Submitted → Under review → Approved/Rejected timeline.
- [x] Show submitted date, review date, reviewer note, and the decision date in the frontend timeline.
- [x] Add a clear 1–2 working-day review expectation for pending donations.
- [x] Add a review summary before final donation submission.
- [x] Add a confirmation checkbox for payment and donor information accuracy.
- [ ] Add replace/remove controls for an uploaded payment slip before submit.
- [x] Improve tracking ID copy, success toast, certificate CTA, and loading states.
- [x] Disable duplicate donation submission while processing and retain upload retry/error states.

### 3. Public trust and transparency

- [x] Add a “last updated” timestamp to public financial and impact summaries.
- [x] Show approved donations, active expenses, current balance, people helped, meals, medical aid, and townships reached with clear labels.
- [x] Add a public expense-category breakdown with a short methodology note.
- [ ] Add a public explanation of manual payment review and donation approval timing.
- [ ] Add a payment/account FAQ, including what to do after sending money to the wrong account.
- [ ] Review outreach photo consent, beneficiary privacy, and EXIF/location metadata before publishing real images.

### 4. Monthly impact reports

- [x] Add a public monthly impact report page using approved donation, expense, trip, and resolved-report data.
- [x] Add month selection with server-side query handling and shareable URLs.
- [x] Add browser print/save-PDF support for the monthly summary output.
- [ ] Add a shareable 1200×630 impact image for each published month.
- [x] Add report data freshness and source notes so donors understand what is included.

### 5. Notifications and communication

- [ ] Verify queued notification delivery for donation received, approved, rejected, and certificate-ready events.
- [ ] Add Burmese/English notification templates with the tracking ID and status link.
- [ ] Add community report received, assigned, in-progress, and resolved notifications where contact permission exists.
- [ ] Add queue failure logging and a safe retry policy.
- [ ] Add an admin notification/failed-job visibility screen or operational checklist.

### 6. PWA and mobile reliability

- [ ] Add a web app manifest with WeCare Myanmar name, icons, theme color, and Burmese/English metadata.
- [ ] Add an offline fallback for reading public pages without allowing offline donation submission.
- [ ] Cache only safe static assets and never cache private slips, donor data, or admin responses.
- [ ] Add installability checks for Android Chrome.
- [ ] Test donation, payment-slip upload, QR viewing, status lookup, report photo upload, and gallery viewer on Android Chrome.
- [ ] Test iOS Safari file upload, back navigation, modal behavior, and keyboard/focus behavior.

### 7. Help center and support

- [ ] Add a public Help/FAQ page with donation, payment slip, tracking, certificate, report, and volunteer questions.
- [ ] Add verified support phone, email, Telegram, and Facebook contact links.
- [ ] Add support hours and expected response time.
- [ ] Add a “payment issue” and “wrong transfer” contact action.
- [ ] Add bilingual FAQ content and accessible accordion behavior.

### 8. Release verification

- [ ] Confirm GitHub Actions CI passes PHP 8.4 setup, migrations, seed, Pest tests, and Vite build.
- [ ] Take a production database backup before every destructive/schema-changing migration.
- [ ] Run a full donor smoke test from public donation to admin review, status lookup, notification, and certificate download.
- [ ] Run social preview checks for Home, Donate, Impact, Outreach, and Community links.
- [ ] Check Facebook/Telegram/LINE/WhatsApp preview image and bilingual copy after deployment.
- [ ] Verify `APP_ENV=production`, `APP_DEBUG=false`, real `APP_KEY`, queue worker, scheduler, storage link, and rollback plan.
- [ ] Record the deployment date, commit SHA, migration status, backup location, and smoke-test result in the release notes.
