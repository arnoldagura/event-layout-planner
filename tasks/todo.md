# Event Layout Planner — Project Todo

## Completed

### Phase 1 — Public Event Sharing ✅
- [x] Schema: add `isPublic`, `shareToken`, `shareExpiresAt`, `publishedAt` to `Event`
- [x] `POST/DELETE /api/events/[id]/publish` — generate/revoke share token
- [x] `GET /api/public/events/[token]` — public read-only event fetch
- [x] `PublicEventCanvas.tsx` — read-only canvas with element highlight
- [x] `BoothSearch.tsx` — fuzzy search with fuse.js
- [x] `app/e/[token]/page.tsx` + `PublicEventView.tsx` — public event page
- [x] Publish/Unpublish button in event editor header
- [x] Edit event details dialog from dashboard cards (`EventDetailsDialog.tsx`)
- [x] AI layout overlap fix — improved Gemini prompt + `resolveOverlaps()` client-side safety net

### TypeScript & Bug Fixes ✅
- [x] Install `class-variance-authority`, fix `button.tsx` imports
- [x] Add `X` import to `CanvasElement.tsx`
- [x] Remove dead `useRef`/`handleZoom`/`handleResetView` code from `EventEditorClient`
- [x] Recreate deleted `EventDetailsDialog.tsx`
- [x] Fix save accumulation bug — replace PATCH/POST/DELETE loop with atomic `PUT /api/events/[id]/elements`

### Phase 2 — Version History + Share Enhancements ✅
- [x] Schema: add `EventVersion` model
- [x] `GET/POST /api/events/[id]/versions` — list + create snapshots (max 20 per event)
- [x] `POST /api/events/[id]/versions/[num]` — restore version (atomic replace)
- [x] `VersionHistoryPanel.tsx` — version list with restore + confirm dialog
- [x] Event editor right panel — AI/History tab switcher
- [x] Auto-snapshot on every save (fire-and-forget)
- [x] Publish route accepts optional `expiresAt`
- [x] Publish modal with expiry date picker
- [x] Dashboard Published badge (Globe icon on published events)

### Phase 4 — Stripe Billing + Marketing Landing Page ✅
- [x] Schema: add `Subscription` model (plan, status, stripeCustomerId, stripeSubscriptionId)
- [x] Install `stripe` package
- [x] `lib/stripe.ts` — Stripe singleton; `lib/plans.ts` — PLAN_LIMITS + getUserPlan helper
- [x] `POST /api/billing/checkout` — creates Stripe checkout session
- [x] `POST /api/billing/portal` — creates Stripe billing portal session
- [x] `POST /api/billing/webhook` — handles subscription lifecycle events
- [x] `GET /api/billing/subscription` — returns current plan
- [x] Feature gate: free plan max 3 events in `POST /api/events`
- [x] Feature gate: AI layout is Pro-only in `POST /api/layouts/suggest`
- [x] Dashboard upgrade banner — shows plan badge + "X/3 events used" for free users
- [x] `components/landing/LandingPage.tsx` — dark hero, Playfair Display font, canvas mockup, features grid, pricing cards, CTA footer
- [x] `app/page.tsx` — guests → LandingPage, logged-in → redirect /dashboard
- [x] `app/pricing/page.tsx` + `components/landing/PricingPage.tsx` — standalone pricing page with checkout button

### Phase 3 — Booth Rental Marketplace ✅
- [x] Schema: add `BoothBid` model with stable `boothId` UUID reference
- [x] `POST /api/public/events/[token]/booths/[boothId]/bids` — public bid submission (no auth)
- [x] `GET /api/events/[id]/bids` — organizer bids list
- [x] `PATCH /api/events/[id]/bids/[bidId]` — approve/reject (with cascade + element status update)
- [x] `ElementPropertiesPanel.tsx` — forRent toggle, price, category, description; auto-generates `boothId`
- [x] `BidsPanel.tsx` — grouped bids list with approve/reject buttons and pending badge
- [x] EventEditorClient: Bids tab, ElementPropertiesPanel above tab bar when booth selected
- [x] `CanvasElement.tsx`: green/amber/grey color rings + Lock overlay for rented booths
- [x] `PublicEventCanvas.tsx`: same color rings, clickable for-rent booths, `onBoothClick` prop
- [x] `PublicEventView.tsx`: bid Dialog with 4 fields, submits to public API
- [x] `BoothSearch.tsx`: For Rent badge, asking price, Bid button in search results

---

## Up Next — Choose a Phase

### Option A — Canvas UX Polish ✅
- [x] Multi-select (shift+click) + blue ring on multi-selected elements
- [x] Copy/paste elements (Ctrl+C/V, preserves fresh boothId on booth paste)
- [x] Snap to grid while dragging (20px grid)
- [x] Delete key removes selected elements
- [x] 8-point Photoshop-style resize handles (nw/n/ne/e/se/s/sw/w)
- [x] Rectangular selection ring (two-div structure decouples ring from border-radius)
- [x] Drag threshold (4px) — prevents elements from jumping on plain click
- [x] Scale-aware drag/resize — correct movement at any zoom level

### Option B — Dashboard Improvements ✅
- [x] Element type breakdown on cards (colored pills per type, up to 4 shown)
- [x] Duplicate event — `POST /api/events/[id]/duplicate`, Copy button on card, optimistic UI
- [x] Sort by: Newest / Oldest / Event Date / Title A–Z
- [x] Filter by: Published status + event type (shown only when >1 type exists)
- [x] Clear filters button when any filter is active

### Option C — Global Marketplace Page ✅
- [x] `app/marketplace/page.tsx` — server component, fetches public non-expired events with ≥1 available for-rent booth; computes price range + categories per event
- [x] `app/marketplace/MarketplaceClient.tsx` — search by title/venue, filter by event type / category / max price; event cards with booth count, price range, category pills, "View Booths" CTA
- [x] Marketplace link in dashboard navbar (ShoppingBag icon)

### Option D — Canvas Enhancements ✅ (partial)
- [x] Alignment tools — already implemented (`AlignmentToolbar.tsx` + store `alignElements`/`distributeElements`)
- [x] Element locking — `isLocked` in `properties`; blocks drag/resize/rotate; amber badge; toggle in properties panel
- [x] Canvas export — Export PNG button in editor header; `html-to-image` captures 2000×1500 board; handles excluded via `data-export-exclude`
- [x] Mobile — responsive public page for vendors browsing on phone
- [x] Notifications — email vendors when their bid is approved/rejected (Resend)

### Remaining Ideas
- [ ] Attendee view — separate public view mode showing seat assignments or booth directory
- [ ] Event analytics — views, bid conversion rates per booth
- [ ] Booth floor plan improvements — dimensions in real units (ft/m), scale ruler overlay
---

## Review

### Changes Made
- **Atomic save**: `PUT /api/events/[id]/elements` replaces all elements in a DB transaction — eliminates the stale-prop duplication bug
- **Version history**: Every save creates a snapshot (max 20); restore replaces elements atomically
- **Share enhancements**: Expiry date on publish links; Published badge on dashboard
- **AI layout**: Corrected canvas dimensions in Gemini prompt (2000×1500); client-side spiral overlap resolver as fallback
- **Security**: Removed `console.log(GEMINI_API_KEY)` from `lib/gemini.ts`
- **Element locking**: `isLocked` stored in `properties` JSON (no schema change); blocks drag/resize/rotate; hides handles; amber badge top-right; toggle in properties panel
- **Canvas export**: `EventCanvas` wrapped with `React.forwardRef`; `html-to-image` captures 2000×1500 board as PNG; resize/rotation handles tagged `data-export-exclude` to hide from export; Export PNG button in editor header
- **Email notifications**: Resend integration sends approval/rejection emails to vendors on bid status change
- **Mobile public page**: Touch pan + pinch-to-zoom on canvas; bottom sheet sidebar on mobile
- **Prettier**: Added `.prettierrc` with Tailwind class sorting (`prettier-plugin-tailwindcss`), `eslint-config-prettier` to prevent conflicts, `format`/`format:check` scripts
- **Stripe billing**: `Subscription` Prisma model; checkout/portal/webhook/subscription API routes; Free (3 events, no AI) vs Pro ($19/mo, unlimited + AI + version history); upgrade banner on dashboard
- **Marketing landing page**: `components/landing/LandingPage.tsx` — dark zinc-950 hero with dot-grid, Playfair Display italic headings, canvas floor plan mockup, stats bar, 6-card features grid, pricing section, dark CTA footer; `app/page.tsx` shows landing for guests; `app/pricing/page.tsx` has checkout + portal buttons

### Architecture Notes
- Elements are stored as `EventElement` rows (not via `EventLayout` model — that model is unused)
- Save strategy: `PUT /api/events/[id]/elements` is the single source of truth for persisting canvas state
- Version snapshots capture `{ type, name, x, y, width, height, rotation, properties }` — no IDs, fresh ones assigned on restore
- Auth pattern: `auth()` → `session.user.id` → `prisma.event.findFirst({ where: { id, userId } })`
- **Stable boothId**: `PUT` atomic save deletes+recreates all elements so DB IDs change every save. Bids reference `properties.boothId` (UUID generated at drop time, preserved in properties JSON) instead of DB `id`
- **Bid approval cascade**: approving a bid also rejects all other pending bids for same `boothId` and sets element `properties.status = 'rented'` in one `$transaction`
