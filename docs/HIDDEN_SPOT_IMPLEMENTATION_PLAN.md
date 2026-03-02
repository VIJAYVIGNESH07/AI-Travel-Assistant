# Hidden Spot Backend Plan (Realtime + User Scoped)

## 1) Goal

Move only **Hidden Spot** from local JSON to database-backed realtime flow.

- Keep all other app modules as they are.
- Hidden Spot submit/approve/reject must sync across devices.
- Approved spot should appear only in the user account that submitted it.

---

## 2) Why Local Method Fails

Current local AsyncStorage approach cannot support reliable admin approval from email links because:
- Data exists only on the device where it was submitted.
- Admin action from another device cannot update submitter's local storage.
- Deep links can open app, but do not guarantee cross-device state sync.

---

## 3) Recommended Architecture

Use database only for Hidden Spot with this flow:

1. App submits hidden spot to backend DB with `verify=false`.
2. Backend sends admin email with secure approval links.
3. Admin clicks approve/reject link.
4. Backend updates record (`verify=true` when approved).
5. App listens/re-fetches and shows approved spot in Explore for that same user.

---

## 4) Tech Choice (Simple + Fast)

### Preferred
- **Supabase** (Postgres + realtime + row-level security + easy REST).

### Alternative
- Firebase Firestore + Cloud Functions.

This plan is written provider-agnostic, but examples map cleanly to Supabase.

---

## 5) Data Model (Hidden Spot only)

Table: `hidden_spot_requests`

- `id` (uuid, pk)
- `submitted_by_user_id` (text)
- `submitted_by_handle` (text)
- `submitted_by_name` (text)
- `name` (text)
- `location_label` (text)
- `latitude` (double precision)
- `longitude` (double precision)
- `category` (text)
- `description` (text)
- `accessibility` (text)
- `best_time` (text)
- `media_urls` (jsonb array) or `media_base64` (jsonb temporary)
- `verify` (boolean, default `false`)
- `status` (text: `pending|approved|rejected`)
- `admin_notes` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)
- `approved_at` (timestamp nullable)

### Rule
- Explore must include only records where:
  - `verify = true`
  - `submitted_by_handle = current_user_handle`

---

## 6) API Contract

### User APIs
1. `POST /hidden-spot`
	- Create request with `verify=false`, `status=pending`.
2. `GET /hidden-spot/my-approved?handle=<handle>`
	- Returns only approved records for that user.
3. `GET /hidden-spot/my-requests?handle=<handle>`
	- Optional status list for user dashboard.

### Admin APIs
1. `POST /hidden-spot/:id/approve`
	- Set `verify=true`, `status=approved`, `approved_at=now`.
2. `POST /hidden-spot/:id/reject`
	- Set `verify=false`, `status=rejected`.

### Security
- Admin endpoints must require admin secret token or signed URL token.

---

## 7) Email Approval Flow (Backend-driven)

On submit, backend sends SendGrid email containing:
- Approve URL: `https://api.yourdomain.com/hidden-spot/{id}/approve?token=...`
- Reject URL: `https://api.yourdomain.com/hidden-spot/{id}/reject?token=...`

When admin clicks:
- Backend validates token.
- Updates DB status.
- Returns success page (simple HTML: "Approved" / "Rejected").

This avoids relying on mobile deep-link behavior in email clients.

---

## 8) App Changes Required

### Keep
- Existing Hidden Spot UI steps and validation.

### Replace
- Replace local `hiddenSpotStorage.ts` write path with API submit call.
- Replace Explore local read with API/realtime approved feed.

### Add
- Small API client module: `src/utils/hiddenSpotApi.ts`
- Optional polling/realtime subscribe for approved updates.
- Graceful offline fallback (queue submit locally, sync later).

---

## 9) Realtime Strategy

### Option A (best)
- Use Supabase realtime subscription on `hidden_spot_requests` filtered by:
  - `submitted_by_handle = current_user_handle`
  - `verify = true`

### Option B
- Poll every 15–30 seconds while Explore is active.

---

## 10) Migration Plan (Low Risk)

### Phase 1
- Introduce backend + new table + admin email links.
- Keep current local JSON flow as fallback behind feature flag.

### Phase 2
- Switch submit to backend first.
- Switch Explore to backend approved feed.

### Phase 3
- Remove local Hidden Spot storage dependency after validation.

---

## 11) Implementation Tasks (Ordered)

1. Create DB schema and admin approval endpoints.
2. Add SendGrid email with secure approve/reject URLs.
3. Add `hiddenSpotApi.ts` in app and wire submit.
4. Wire Explore approved list to backend (user scoped).
5. Add realtime subscription or polling.
6. Add status screen (`pending/approved/rejected`) for submitter.
7. E2E test: submit on device A, approve from browser, show on device A.

---

## 12) Acceptance Criteria

1. Hidden Spot submit creates DB record with `verify=false`.
2. Admin email approve link flips `verify=true` in DB.
3. Approved destination appears in Explore for submitting user only.
4. Other users do not see that destination.
5. State sync works across devices without manual refresh (or within polling interval).

---

## 13) Open Decisions

1. Backend choice: Supabase or Firebase?
2. Media storage: base64 in DB (temporary) or object storage URLs (recommended)?
3. Realtime mode: subscription or polling?

Once you confirm these 3 choices, implementation can start immediately with backend-only Hidden Spot migration.
