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

### Option A — Canvas UX Polish
- [ ] Multi-select (shift+click, drag-to-select)
- [ ] Copy/paste elements
- [ ] Snap to grid while dragging

### Option B — Dashboard Improvements
- [ ] Element count breakdown by type on event cards
- [ ] Duplicate event (clone layout + elements)
- [ ] Sort/filter by date, type, published status

### Option C — Global Marketplace Page
- [ ] `/marketplace` page listing all published events with for-rent booths
- [ ] Filter by category, price range, event date

---

## Review

### Changes Made
- **Atomic save**: `PUT /api/events/[id]/elements` replaces all elements in a DB transaction — eliminates the stale-prop duplication bug
- **Version history**: Every save creates a snapshot (max 20); restore replaces elements atomically
- **Share enhancements**: Expiry date on publish links; Published badge on dashboard
- **AI layout**: Corrected canvas dimensions in Gemini prompt (2000×1500); client-side spiral overlap resolver as fallback
- **Security**: Removed `console.log(GEMINI_API_KEY)` from `lib/gemini.ts`

### Architecture Notes
- Elements are stored as `EventElement` rows (not via `EventLayout` model — that model is unused)
- Save strategy: `PUT /api/events/[id]/elements` is the single source of truth for persisting canvas state
- Version snapshots capture `{ type, name, x, y, width, height, rotation, properties }` — no IDs, fresh ones assigned on restore
- Auth pattern: `auth()` → `session.user.id` → `prisma.event.findFirst({ where: { id, userId } })`
- **Stable boothId**: `PUT` atomic save deletes+recreates all elements so DB IDs change every save. Bids reference `properties.boothId` (UUID generated at drop time, preserved in properties JSON) instead of DB `id`
- **Bid approval cascade**: approving a bid also rejects all other pending bids for same `boothId` and sets element `properties.status = 'rented'` in one `$transaction`
