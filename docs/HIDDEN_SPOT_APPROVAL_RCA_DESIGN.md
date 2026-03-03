# Hidden Spot Approval RCA + Supabase Design (No-Code Plan)

## 1) Problem Statement

Current admin approve/reject links from email are unreliable and can open the app in the wrong user/session context.
Observed behavior:
- Clicking approve URL from laptop/phone does not reliably approve the intended submission.
- Link can land on auth/onboarding and appears like creating/logging into a different account context.
- Approval action depends on whichever app/device/session receives the deep link.

---

## 2) Deep RCA

### 2.1 Current approval path (today)
1. Submitter creates hidden spot in app.
2. App sends email with deep links like `wandermate://admin-hidden-spot-review?...`.
3. Admin clicks link from mail client.
4. Link opens app route and `AdminHiddenSpotReviewScreen` executes status update.

### 2.2 Why it fails

#### A) Deep link is app-context dependent
- Custom scheme links (`wandermate://...`) require the app to be installed and opened in the right navigation/auth state.
- On laptop or unsupported clients, custom scheme handling is inconsistent.

#### B) Approval logic runs inside client app, not backend
- Approval is currently triggered by app route params and local/session runtime.
- This means approval depends on device state, signed-in user, and navigation boot order.

#### C) Wrong actor/context risk
- Action executes in whichever app session opens the link, not a guaranteed admin backend identity.
- This can route to auth flow first and break/lose the intended action.

#### D) Data ownership mismatch across devices
- Historical local-storage behavior and device-specific state made cross-device admin actions non-deterministic.
- Even with DB present, client-driven approval still has fragile control flow.

### 2.3 Root cause (primary)
Approval side-effects are executed in client app via deep link navigation instead of a secure server-side endpoint.

### 2.4 Contributing causes
- No signed, expiring action token validated server-side.
- No idempotent backend approval transaction.
- No dedicated publish pipeline from `hidden_spot_requests` to destination dataset.

---

## 3) Target Design (Supabase-first)

## 3.1 Core principle
Email links must call HTTPS backend endpoints (Supabase Edge Function), not app deep links for mutation.

## 3.2 New approval flow
1. User submits hidden spot into `hidden_spot_requests` with `status='pending'`, `verify=false`.
2. Backend generates secure approve/reject URLs:
   - `https://<project-ref>.functions.supabase.co/hidden-spot-action?action=approve&requestId=<id>&token=<signed>`
   - `https://<project-ref>.functions.supabase.co/hidden-spot-action?action=reject&requestId=<id>&token=<signed>`
3. Admin clicks URL from any device (laptop/mobile/browser).
4. Edge Function validates token + expiry + action.
5. Function updates `hidden_spot_requests` row in DB.
6. If approved, function publishes to destination dataset (non-VR record).
7. Function returns simple HTML confirmation page (Approved/Rejected).

No app install, no current user session, no deep-link dependency for approval mutation.

---

## 4) Data Model Design

## 4.1 Existing table (keep)
`hidden_spot_requests`
- Keep current fields.
- Ensure fields: `status`, `verify`, `admin_decision_at`, `admin_notes`.

## 4.2 Add/confirm fields for publish tracking
- `published_destination_id` (text, nullable)
- `decision_by` (text, optional admin identifier)

## 4.3 Destination table (for Explore feed)
Create `destinations` (or project-equivalent canonical place table):
- `id` (text/uuid pk)
- `source_request_id` (text unique, links hidden spot request)
- `name`, `location_label`, `latitude`, `longitude`, `category`, `description`
- `image_url` (nullable)
- `vr_link` (text nullable, set `NULL` or empty for non-VR hidden spots)
- `source_type` (e.g., `hidden_spot`)
- `created_at`, `updated_at`

This satisfies: “approved details need update in destination, VR version without VR”.

---

## 5) Approval Transaction Rules

Use one DB transaction in Edge Function:
1. Lock request row (`pending` only).
2. Apply decision:
   - Approve: `status='approved'`, `verify=true`, set `admin_decision_at`.
   - Reject: `status='rejected'`, `verify=false`, set `admin_decision_at`.
3. On approve only:
   - Upsert into `destinations` with `vr_link=NULL`.
   - Write back `published_destination_id` into request row.
4. If already approved/rejected, return idempotent success (no duplicate destination).

---

## 6) Security Design

- Token must be signed server-side and include:
  - `requestId`
  - `action`
  - `exp` (expiry)
  - nonce/jti
- Token verified only in Edge Function.
- Reject expired/invalid tokens.
- Optional one-time-use token table for replay protection.
- Never trust client/app identity for email action mutation.

---

## 7) App Behavior After Design

- App can still open admin review screens for manual moderation.
- Email action no longer requires app route mutation.
- Explore should read approved hidden spots from DB/destination dataset and show with:
  - valid image
  - `vrLink` empty/null (button can be disabled/hidden for these records)

---

## 8) Migration Plan

### Phase 1
- Keep current UI and submit flow.
- Switch email links to HTTPS action endpoint.

### Phase 2
- Introduce destination publish on approve.
- Backfill already-approved hidden spots into `destinations`.

### Phase 3
- Stop relying on deep-link param mutation for approval.
- Keep deep link only for read-only admin review screen navigation.

---

## 9) Acceptance Criteria

1. Approve/reject works from any mail client/device without requiring app session.
2. Approve updates exact request row in Supabase DB.
3. Approved request is published once into destination dataset.
4. Published destination has no VR link (`NULL`/empty) and appears in Explore.
5. Re-clicking same approve URL does not create duplicates (idempotent).
6. Invalid/expired token cannot mutate any record.

---

## 10) Risks + Mitigation

- **Risk:** Large base64 images in DB and email payload overhead.
  - **Mitigation:** Move media to Supabase Storage and store URLs.
- **Risk:** Duplicate publish on retries.
  - **Mitigation:** Unique constraint on `source_request_id` + transactional upsert.
- **Risk:** Broken UX when non-VR place shows “View in VR”.
  - **Mitigation:** Conditional hide/disable VR action when link is null.

---

## 11) Final Recommendation

Adopt backend-driven approval via signed HTTPS links and transactional publish to `destinations`.
This removes device/session dependency, fixes wrong-context approvals, and ensures approved hidden spots reliably enter the non-VR destination feed in Supabase.
