# Mekong Journeys Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the existing React 19 + Vite tour-booking MVP into clear app, tours, booking, and shared modules, and adopt TanStack Query for asynchronous server state while preserving current behavior.

**Architecture:** Keep the current SPA and mock adapter. Put router/providers in `src/app`, shared UI/helpers in `src/shared`, tour data queries in `src/features/tours`, booking rules and mutations in `src/features/booking`, and deterministic seed data behind services. Components consume hooks and domain functions; they do not call data adapters directly.

**Tech Stack:** React 19, Vite 8, TypeScript, TanStack Query, existing Node test runner and CSS.

**Spec:** `docs/superpowers/specs/2026-10-21-booking-app-module-design.md`

## Global Constraints

- Preserve the React 19 + Vite + TypeScript SPA; do not migrate to Next.js.
- Preserve all current routes, booking rules, demo labels, visual behavior, and responsive layouts while moving code.
- Query hooks call service adapters; components do not call `fetch` or adapters from `useEffect`.
- Keep pricing as integer VND and calculate totals with the existing shared domain function; never trust totals from URL or duplicate totals in React state.
- Keep contact data in memory only; draft persistence stores selection IDs only, with schema version and 24-hour expiry.
- Booking remains a mock flow: no real payment, reservation hold, backend, or claim of confirmed booking.
- Do not add UI libraries or a router package unless the existing implementation cannot satisfy the route requirements.

## Review Focus

- Search/filter/page parameters produce distinct, stable query keys and Back/refresh restore the URL-driven results. Add assertions for key separation and parameter parsing in the tour query tests.
- Query retries or errors do not turn the page into an empty successful catalog. Test error state and retry path for the tour list.
- Repeated booking mutation with the same idempotency key creates one booking, while changed input is rejected. Preserve and extend the booking adapter tests.
- A booking mutation that fails for price change or sold-out status retains user input and does not invalidate unrelated queries. Test these paths in booking mutation tests.
- Time-relative departure/cutoff fixtures remain valid across local timezone and midnight boundaries. Keep deterministic clock injection or fixed `now` parameters in domain tests.

---

## Module ownership and integration contract

| Owner | Module | Files primarily owned | Contract |
|---|---|---|---|
| Member 1 | App shell and routing | `src/app/**`, `src/shared/components/**`, `src/main.tsx` | Exports `App` and route tree; wraps routes in one `QueryClientProvider`; does not own tour or booking business rules. |
| Member 2 | Tour data and queries | `src/features/tours/**`, `src/data/mock-tours.ts` | Exports tour types, `tourService`, `tourKeys`, and `useTours/useTour/useDepartures` hooks. |
| Member 3 | Booking domain and mutation | `src/features/booking/domain/**`, `src/features/booking/api/**`, `src/data/mock-bookings.ts` | Exports pricing/validation functions, `bookingService`, `bookingKeys`, and booking mutation/quote hooks. |
| Member 4 | Booking UI, forms, tests | `src/features/booking/components/**`, `src/features/booking/pages/**`, `tests/**` | Uses Member 2/3 contracts; owns field presentation, interaction tests, responsive and accessibility checks, not duplicate business rules. |

Integrate in task order below. Before parallel implementation, all owners agree on the public types and service signatures. Each member commits their module changes separately and writes their report section with files/commit, mechanism, verification evidence, and limitations.

## Task 1: Install and provide TanStack Query (Member 1)

**Files:**
- Modify: `package.json`, lockfile matching the package manager already adopted by the team
- Create: `src/app/query-client.ts`
- Create: `src/app/providers.tsx`
- Modify: `src/main.tsx`
- Test: `tests/query-client.test.ts` or a small provider smoke test supported by the current runner

**Interfaces:**
- Produces `queryClient` with explicit `staleTime`, `gcTime`, retry, and refetch defaults documented in code.
- Produces `AppProviders({ children }: { children: React.ReactNode }): JSX.Element` which mounts exactly one `QueryClientProvider`.
- Does not define feature query keys here.

- [ ] **Step 1: Add a provider smoke test** asserting the application subtree can render beneath `AppProviders` and a query can be read from the provider.
- [ ] **Step 2: Run the focused test and confirm it fails** because the provider/client does not exist.
- [ ] **Step 3: Add the compatible TanStack Query dependency** and create the client/provider with explicit defaults. Keep retries bounded for deterministic demo errors.
- [ ] **Step 4: Wrap the current root in `AppProviders`** without changing route behavior.
- [ ] **Step 5: Run `npm test`, `npm run typecheck`, and `npm run build`**; confirm all existing routes still compile and tests pass.
- [ ] **Step 6: Commit** as `feat: add TanStack Query application provider`.

## Task 2: Extract app shell and route definitions (Member 1)

**Files:**
- Create: `src/app/App.tsx`
- Create: `src/app/router.tsx`
- Create: `src/shared/components/SiteLayout.tsx` if a shared shell is needed
- Modify: `src/App.tsx`, `src/main.tsx`, existing header component as needed
- Test: `tests/router.test.tsx` or manual route smoke checks if router is custom and DOM test utilities are unavailable

**Interfaces:**
- `App` renders providers' child route tree only; `main.tsx` owns top-level provider mounting.
- Route resolution continues to support `/`, `/tours`, `/tours/:slug`, `/booking`, `/booking/lookup`, `/booking/:bookingId`, and `/policies`.
- Existing navigation uses one route API; page components do not call `history.pushState` directly.

- [ ] **Step 1: Record smoke cases** for direct load and navigation to each current route, including browser Back/Forward.
- [ ] **Step 2: Extract route matching/navigation from the current `src/App.tsx`** into `src/app/router.tsx` with no UI or behavior changes.
- [ ] **Step 3: Move the site shell composition** into `src/app/App.tsx` and preserve existing shared header/footer.
- [ ] **Step 4: Run route smoke cases and `npm run typecheck`**; verify direct URL load and Back/Forward.
- [ ] **Step 5: Commit** as `refactor: separate app shell and route handling`.

## Task 3: Establish feature types and tour service (Member 2)

**Files:**
- Create: `src/features/tours/types.ts`
- Create: `src/features/tours/api/tour-service.ts`
- Create: `src/data/mock-tours.ts`
- Modify: `src/features/tours.ts` (temporary re-export during migration)
- Test: `tests/tours.test.ts`

**Interfaces:**
- `TourSearchParams`: `{ q?: string; destination?: string; minPrice?: number; maxPrice?: number; duration?: number; departureDate?: string; sort?: string; page?: number }` (use current project’s exact filter names where they differ).
- `TourPage`: `{ items: Tour[]; total: number; page: number; pageSize: number }`.
- `tourService.searchTours(params: TourSearchParams): Promise<TourPage>`.
- `tourService.getTour(slug: string): Promise<Tour | undefined>`.
- `tourService.getDepartures(tourId: string): Promise<Departure[]>`.
- Service retains the deterministic mock delay and existing seed behavior; it never imports React or TanStack Query.

- [ ] **Step 1: Add service tests** for search normalization, AND filters, sorting, pagination, missing tour, and departures.
- [ ] **Step 2: Run `npm test` focused on `tests/tours.test.ts`** and verify new service tests fail before extraction.
- [ ] **Step 3: Move seed and adapter read operations** out of the UI/application module into `src/data/mock-tours.ts` and `tour-service.ts`.
- [ ] **Step 4: Keep compatibility re-exports temporarily** so existing UI remains runnable during the parallel migration.
- [ ] **Step 5: Run tour tests and typecheck**; assert tour count and existing departure/package behavior are unchanged.
- [ ] **Step 6: Commit** as `refactor: extract tour service and domain types`.

## Task 4: Add tour query keys and hooks (Member 2)

**Files:**
- Create: `src/features/tours/api/tour-queries.ts`
- Test: `tests/tour-queries.test.ts`
- Modify: `src/features/tours/pages/TourListPage.tsx`, `TourDetailPage.tsx` after page extraction is ready

**Interfaces:**
- `tourKeys.all`, `tourKeys.lists()`, `tourKeys.list(params)`, `tourKeys.details()`, `tourKeys.detail(slug)`, `tourKeys.departures(tourId)`.
- `useTours(params)`, `useTour(slug)`, `useDepartures(tourId)` use `useQuery` and corresponding service functions.
- Search params are normalized before key creation; changing any meaningful filter/sort/page changes the list key.

- [ ] **Step 1: Add key tests** proving identical normalized params share a key and differing search/page params do not.
- [ ] **Step 2: Add hook tests** for success, loading, error, retry, and cache reuse using a fresh QueryClient per test.
- [ ] **Step 3: Run focused tests and verify the missing hooks/keys fail.**
- [ ] **Step 4: Implement keys and hooks** with explicit per-query stale behavior and no component-owned fetching effects.
- [ ] **Step 5: Run `npm test` and `npm run typecheck`.**
- [ ] **Step 6: Commit** as `feat: add cached tour queries`.

## Task 5: Extract booking domain and booking service (Member 3)

**Files:**
- Create: `src/features/booking/types.ts`
- Create: `src/features/booking/domain/pricing.ts`
- Create: `src/features/booking/domain/validation.ts`
- Create: `src/features/booking/domain/booking-draft.ts`
- Create: `src/features/booking/api/booking-service.ts`
- Create: `src/data/mock-bookings.ts`
- Modify: `src/features/pricing.ts`, `src/features/booking.ts` (temporary re-exports)
- Test: `tests/pricing.test.ts`, `tests/booking.test.ts`

**Interfaces:**
- Preserve current `Draft`, `Contact`, `Booking`, `PriceQuote`, `BookingStatus`, and `PaymentStatus` semantics.
- `bookingService.getQuote(draft: Draft): Promise<PriceQuote>` revalidates departure, package availability, cutoff, capacity, passengers, and voucher.
- `bookingService.createBooking(input: { draft: Draft; contact: Contact; idempotencyKey: string; fixture?: DemoFixture; acceptedQuoteVersion?: string }): Promise<Booking>`.
- `bookingService.lookupBooking(code: string, phone: string): Promise<Booking | undefined>`.
- Domain functions remain framework-independent and deterministic when given `now`.

- [ ] **Step 1: Add regression cases** for the five required price examples, passenger boundaries, voucher eligibility/expiry, cutoff boundary, and status mapping.
- [ ] **Step 2: Run `npm test` and verify current behavior is captured** before moving implementations.
- [ ] **Step 3: Move pure functions into `domain/`** and mock adapter operations into `booking-service.ts` without changing formulas or errors.
- [ ] **Step 4: Keep temporary re-exports** until UI migration is complete.
- [ ] **Step 5: Run `npm test`, `npm run typecheck`, and `npm run lint`.**
- [ ] **Step 6: Commit** as `refactor: isolate booking domain and service`.

## Task 6: Add booking quote and create mutations (Member 3)

**Files:**
- Create: `src/features/booking/api/booking-queries.ts`
- Create: `src/features/booking/api/booking-mutations.ts`
- Test: `tests/booking-mutations.test.ts`

**Interfaces:**
- `bookingKeys.quote(draft: Draft)` uses only normalized selection IDs/counts/voucher/payment ratio.
- `useBookingQuote(draft)` delegates to `bookingService.getQuote` and is disabled until departure/package selection is valid.
- `useCreateBooking()` calls `bookingService.createBooking`; success invalidates only related quote/departure/catalog keys as appropriate for the mock data model.
- Mutations do not retry automatically when the outcome could create a duplicate booking.

- [ ] **Step 1: Test mutation pending/success/error, idempotent repeat, sold-out rejection, price-change acceptance, and invalidation scope.**
- [ ] **Step 2: Run focused tests and confirm the new mutation hooks are absent.**
- [ ] **Step 3: Implement quote and mutation hooks** with deterministic keys and mutation callbacks.
- [ ] **Step 4: Run focused tests, `npm run typecheck`, and `npm run lint`.**
- [ ] **Step 5: Commit** as `feat: add booking quote and create mutations`.

## Task 7: Split tour pages and connect queries (Member 1 + Member 2)

**Files:**
- Create: `src/features/tours/pages/HomePage.tsx`
- Create: `src/features/tours/pages/TourListPage.tsx`
- Create: `src/features/tours/pages/TourDetailPage.tsx`
- Move/retain: existing tour components under `src/features/tours/components/`
- Modify: `src/app/router.tsx`, old `src/App.tsx`
- Test: tour query/UI tests and route smoke checks

**Interfaces:**
- Pages consume `useTours`, `useTour`, and `useDepartures`; they do not import mock arrays/services.
- Search state is parsed from URL and written back to URL; browser Back restores filter state.
- Booking draft selection continues through the existing shared draft interface until Task 8 completes.

- [ ] **Step 1: Add page smoke coverage** for initial loading, successful list/detail, empty result, and query error/retry.
- [ ] **Step 2: Move current page sections into focused page/component files** without restyling unrelated sections.
- [ ] **Step 3: Replace adapter effects with tour query hooks** and preserve URL-driven filtering/sorting/pagination.
- [ ] **Step 4: Verify detail page still shares selected departure/package/draft with booking card.**
- [ ] **Step 5: Run `npm test`, `npm run typecheck`, and browser checks at existing viewport set.**
- [ ] **Step 6: Commit** as `refactor: split tour pages and consume cached queries`.

## Task 8: Split booking UI and connect mutations (Member 3 + Member 4)

**Files:**
- Create: `src/features/booking/pages/CheckoutPage.tsx`
- Create: `src/features/booking/pages/BookingResultPage.tsx`
- Create: `src/features/booking/pages/BookingLookupPage.tsx`
- Create: `src/features/booking/components/ContactForm.tsx`
- Create: `src/features/booking/components/BookingSummary.tsx`
- Move: existing `BookingCard`, `PriceBreakdown` to feature/shared ownership based on use sites
- Modify: `src/app/router.tsx`, current app coordinator during migration
- Test: booking UI/integration tests

**Interfaces:**
- Booking pages consume the domain and hooks from Tasks 5–6; UI does not reimplement pricing or validation rules.
- `ContactForm` accepts current contact/errors and change/blur/submit callbacks; it retains accessible labels and described error messages.
- Checkout preserves contact values on errors, blocks duplicate submit, requires policy agreement, and handles explicit price acceptance.
- Results begin as `pending_confirmation + unpaid`; lookup only returns a matching session booking.

- [ ] **Step 1: Add UI tests** for invalid form focus, retained values on service error, duplicate-submit blocking, price-change acceptance, sold-out response, and result statuses.
- [ ] **Step 2: Run those tests and verify failures before page extraction.**
- [ ] **Step 3: Move checkout/result/lookup sections into page components** and connect the mutation/quote hooks.
- [ ] **Step 4: Preserve responsive checkout summary order and existing mobile/desktop behavior.**
- [ ] **Step 5: Run booking tests and browser smoke flows** for success, sold-out, network failure, and changed price.
- [ ] **Step 6: Commit** as `refactor: split booking pages and connect mutations`.

## Task 9: Remove migration shims and consolidate shared code (Member 1 + module owners)

**Files:**
- Modify/remove: `src/App.tsx`, `src/features.ts` legacy modules, temporary re-export files from Tasks 3/5
- Create as needed: `src/shared/lib/format.ts`, `src/shared/lib/storage.ts`
- Modify: `src/app/router.tsx`, `src/app/App.tsx`
- Test: imports/build/lint

**Interfaces:**
- No production component imports legacy monolithic feature files.
- Shared utilities have no feature-specific business rules.
- Current public route behavior remains unchanged.

- [ ] **Step 1: Search for legacy imports** and list consumers before deleting shims.
- [ ] **Step 2: Move only genuinely shared formatting/storage helpers**; keep pricing in booking domain.
- [ ] **Step 3: Remove obsolete re-exports and unused files/assets.**
- [ ] **Step 4: Run `rg` for old imports, `npm run lint`, `npm run typecheck`, and `npm run build`.**
- [ ] **Step 5: Commit** as `refactor: remove legacy feature entrypoints`.

## Task 10: Integrated evidence and report material (All members; coordinator compiles)

**Files:**
- Modify: `README.md`, `docs/VERIFICATION.md`
- Create/update: `docs/responsive-checks.json`, screenshots if checks reveal changes
- Test: all current unit/integration tests and the available browser flows

**Interfaces:**
- Each member supplies a short report note with owned files/commit, technical mechanism, command/browser evidence, and limitations.
- Coordinator assembles evidence but does not claim checks that were not run.

- [ ] **Step 1: Run `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build`.**
- [ ] **Step 2: Run browser smoke tests** for home → search → detail → select tour → checkout → create request → lookup; also sold-out and price-change fixtures.
- [ ] **Step 3: Check responsive layouts** at 360, 390, 768, 1024, and 1440px; capture evidence for routes affected by the refactor.
- [ ] **Step 4: Document TanStack Query design** with one tour query cache example and one booking mutation/invalidation trace, including why booking form/draft are client state.
- [ ] **Step 5: Document known limits**: mock data, no atomic inventory, no reservation hold, no payment processor, session-only lookup.
- [ ] **Step 6: Commit** as `docs: record modular architecture verification`.

## Integration order

1. Task 1 provider and dependency.
2. Task 2 app shell/router extraction.
3. Tasks 3–4 tour service and queries.
4. Tasks 5–6 booking domain and mutation hooks.
5. Tasks 7–8 page migrations; these can proceed in parallel only after interface tasks are merged.
6. Task 9 remove shims.
7. Task 10 integrated verification and report evidence.

Parallel work rule: do not have two people edit the same page/coordinator file concurrently. Members 2 and 3 should complete service/types contracts before Member 4 consumes them. Member 1 owns `src/app/router.tsx` integration; feature owners submit route exports rather than editing that file independently.

## Implementation progress — 21/10/2026

Implemented in this pass:

- TanStack Query dependency, QueryClient defaults and root provider.
- `useSyncExternalStore` SPA location hook and route parser test.
- Tour seed moved to `src/data/mock-tours.ts`; tour service, normalized query keys, query options and list/detail/departure hooks.
- Booking types, pricing, contact validation, quote query and create mutation. Mutation retries are disabled and success invalidates only the matching quote.
- Home/list, contact fields, lookup and booking result extracted into feature page/component modules.
- Tests for service filtering/pagination, key normalization, query cache, mutation invalidation, VND formatting and existing booking behavior.
- Review fixes: catalog query errors no longer block non-catalog routes, selected-date price sorting, and canonical URL pagination. Added regression tests for these behaviors.

Open at the end of the first pass (superseded by the criteria-completion pass on 22/10/2026):

- Extract the remaining tour-detail and checkout page orchestration from `src/app/App.tsx`.
- Remove compatibility re-export files after all imports move to feature paths.
- Run direct browser interaction and responsive checks after the module changes; the in-app browser could not reach the workspace localhost server in this pass.

The implementation uses the current checkout and does not create commits, because unrelated existing edits were present before this work. Final verification run: `npm test` 23/23 pass, `npm run lint` pass, `npm run typecheck` pass, `npm run build` pass. Direct browser and responsive verification remain unconfirmed.

## Follow-up — eight criteria completion, 22/10/2026

- Extracted TourDetailPage, CheckoutPage and policy/lookup/result routes; app shell uses seven lazy imports, Suspense and error boundary.
- Draft and contact state live in separate providers; checkout logic, selection validation and URL search have custom hooks.
- Removed all compatibility feature re-exports and updated imports to their actual feature/data modules.
- Added strict source/test/E2E typechecking, Profiler before/after, query lifecycle/trace, manifest/gzip analysis, browser HMR and production chunk-request evidence.
- Added Chromium booking/failure/retry/navigation/keyboard/responsive coverage. Fixed review findings concerning quote keys after editing during price review, image fallback after source changes, and missing detail query results.
- The current verification document is `docs/CRITERIA-VERIFICATION.md`; academic explanation and member ownership are in `docs/REPORT-REACT-VITE-TANSTACK.md`.
- Commit steps are not marked complete: this workspace includes pre-existing uncommitted work and no commits were created in this pass.
