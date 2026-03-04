# Hidden Spot Supabase Architecture — Root Cause Analysis (Verified)

## Problem Statement

The Hidden Spot feature using Supabase has a fundamentally broken architecture. This RCA identifies **7 critical architectural flaws** across security, data integrity, reliability, and correctness that make the current system non-functional or fragile.

---

## RCA #1: Approve/Reject Action URLs Are Broken (Critical Bug)

### Where
[send-hidden-spot-review-email/index.ts](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/supabase/functions/send-hidden-spot-review-email/index.ts#L239-L240)

### What's wrong
The Edge Function constructs the admin action URLs like this:

```typescript
const functionOrigin = new URL(req.url).origin;
const actionBaseUrl = `${functionOrigin}/hidden-spot-action`;
```

When invoked via `supabase.functions.invoke()`, the request URL is:
`https://pbrcqiqnxvldjotkqije.supabase.co/functions/v1/send-hidden-spot-review-email`

So `origin` = `https://pbrcqiqnxvldjotkqije.supabase.co`, and the generated action URL becomes:
`https://pbrcqiqnxvldjotkqije.supabase.co/hidden-spot-action?action=approve&...`

> [!CAUTION]
> **This URL is wrong.** The correct URL should be:
> `https://pbrcqiqnxvldjotkqije.supabase.co/functions/v1/hidden-spot-action?action=approve&...`
>
> The `/functions/v1/` path segment is missing. When admin clicks Approve/Reject in the email, they get a **404 error** or a Supabase dashboard page — the action never reaches the Edge Function.

### Impact
**Admin approval/rejection never works.** Every approve/reject link in every email sent to the admin is broken. Submissions stay in `pending` state forever.

### Live Verification (Tested 2026-03-04)

| URL | Response | Conclusion |
|-----|----------|------------|
| `https://pbrcqiqnxvldjotkqije.supabase.co/functions/v1/hidden-spot-action` | **401** (Unauthorized — expected without valid token) | ✅ Function exists and is reachable |
| `https://pbrcqiqnxvldjotkqije.supabase.co/hidden-spot-action` (what the email generates) | **404** (Not Found) | ❌ **Nothing exists here — admin lands on a dead page** |

Also confirmed: both existing submissions (`hs-1772563173396` and `hs-1772552934018`) are stuck at `status=pending`, `verify=false`, `admin_decision_at=null` — admin action never reached the Edge Function.

### Fix
```diff
-const actionBaseUrl = `${functionOrigin}/hidden-spot-action`;
+const actionBaseUrl = `${functionOrigin}/functions/v1/hidden-spot-action`;
```

---

## RCA #2: SendGrid API Key Exposed in Client Bundle

### Where
[.env](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/.env#L1) and [admin.ts](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/config/admin.ts#L2)

### What's wrong
```
EXPO_PUBLIC_SENDGRID_API_KEY=SG.5thIaHgoRT2...
```

In Expo, **every `EXPO_PUBLIC_*` variable is bundled into the JavaScript** and shipped to the client. This means:
- The SendGrid API key is visible to anyone who decompiles the app or inspects the JS bundle
- Anyone can use it to send emails as `2k22aids60@kiot.ac.in`
- SendGrid will likely flag/ban the key for abuse

> [!WARNING]
> This is a **security vulnerability**. API keys for email services should NEVER be in client code.

### Why it exists
The [hiddenSpotMail.ts](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/hiddenSpotMail.ts) has a "direct SendGrid" fallback path that calls the SendGrid API directly from the mobile app. This was added to handle SSL/TLS errors from the Edge Function, but it requires the key to be in the client.

### Fix
- Remove `EXPO_PUBLIC_SENDGRID_API_KEY` from [.env](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/.env) entirely
- Remove the [sendViaDirectSendGrid](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/hiddenSpotMail.ts#112-157) fallback from [hiddenSpotMail.ts](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/hiddenSpotMail.ts)
- Keep SendGrid key **only** as a Supabase Edge Function secret (server-side)
- If the Edge Function fails, show the user an error — don't fallback to client-side email sending

---

## RCA #3: No User Authentication — Fake Data Isolation

### Where
[supabaseClient.ts](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/supabaseClient.ts#L6-L9), [HIDDEN_SPOT_SUPABASE_SETUP.md](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/docs/HIDDEN_SPOT_SUPABASE_SETUP.md#L49-L65)

### What's wrong

| Layer | Problem |
|-------|---------|
| **Supabase Client** | Auth is disabled: `persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`. No login/signup flow. |
| **RLS Policies** | All three policies (select, insert, update) use `using (true)` — completely open to anyone with the anon key. |
| **Data Isolation** | Explore filter relies on `submitted_by_handle = current_user_handle`, but the handle is a **client-provided string** from Redux state — not a verified server identity. |

### Consequence
- **Any user can read ALL submissions** (including other users' pending/rejected spots)
- **Any user can modify ANY row** (change status, approve their own submissions)
- **Any user can impersonate another** by setting their handle to someone else's
- The anon key is in the [.env](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/.env) file — anyone who extracts it has full read/write to the table

### Fix
- Implement Supabase Auth (email/password, OAuth, or anonymous auth)
- Write proper RLS policies that check `auth.uid()` or `auth.jwt()` claims
- Store `user_id` (from Supabase Auth) instead of relying on client-provided handles

---

## RCA #4: Images Stored as Base64 in the Database

### Where
[hiddenSpotStorage.ts](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/hiddenSpotStorage.ts#L108), [HIDDEN_SPOT_SUPABASE_SETUP.md](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/docs/HIDDEN_SPOT_SUPABASE_SETUP.md#L34)

### What's wrong
Images are stored as base64 strings inside a `jsonb` column (`image_base64_list`):
- A single image at 0.7 quality ≈ **500KB–2MB** as base64
- Multiple images per submission = **5–10MB per row**
- Supabase REST API has response size limits (default ~2MB per response)
- Querying `SELECT *` fetches ALL image data for EVERY row

### Consequences
- [getHiddenSpotSubmissions()](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/hiddenSpotStorage.ts#133-174) fetches ALL rows with ALL images → **massive payload** → slow/timeout/crash
- [getApprovedHiddenSpotPlaces()](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/hiddenSpotStorage.ts#230-290) loads full base64 data just to display a list → **memory pressure on mobile**
- As submissions grow, the entire system grinds to a halt
- Supabase may reject INSERT for rows that exceed payload limits

### Fix
- Use **Supabase Storage** (S3-compatible bucket) for images
- Store only the image **URLs** in the database
- Upload images to storage first, then insert the URL references

---

## RCA #5: Submit Flow Is Not Transactional

### Where
[HiddenSpotScreen.tsx](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/screens/HiddenSpotScreen.tsx#L160-L229)

### What's wrong
The submit flow does two sequential async operations:

```
Step 1: await addHiddenSpotSubmission(...)  →  INSERT into DB
Step 2: await sendHiddenSpotReviewEmail(...)  →  Call Edge Function → Send email
```

If Step 1 succeeds but Step 2 fails:
- The DB row exists with `status='pending'`
- The admin **never receives an email**
- The user sees: *"Submission is saved as pending, but admin email failed"*
- **There is no way to retry sending the email** — the submission is orphaned forever

### Consequences
- Orphaned pending submissions with no admin notification
- No admin dashboard or retry mechanism to find/action these
- User has no visibility into whether admin was actually notified

### Fix
- Option A: Use a Supabase **Database Trigger** — when a row is inserted with `status='pending'`, automatically invoke the email Edge Function
- Option B: Add a "retry notification" button for pending submissions
- Option C: Move the entire submit flow to a single Edge Function that does both INSERT + email atomically

---

## RCA #6: Edge Function Uses Wrong Auth for DB Mutations

### Where
[hidden-spot-action/index.ts](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/supabase/functions/hidden-spot-action/index.ts#L120-L171)

### What's wrong
The `hidden-spot-action` Edge Function uses raw REST API calls with the **service role key** to read and update the database:

```typescript
const response = await fetch(url, {
  headers: {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`
  }
});
```

While this bypasses RLS (necessary for admin actions), the function:
- Does a **GET then PATCH** (read-then-write) without any row locking
- Uses `status=eq.pending` as a filter on PATCH — this is a weak form of optimistic concurrency, not a proper transaction
- If two admin clicks happen simultaneously, both could read `status=pending` and both could try to process

### Fix
- Use a Supabase client library inside the Edge Function (supports transactions)
- Or use a PostgreSQL `UPDATE ... WHERE status = 'pending' RETURNING *` pattern to make it truly atomic

---

## RCA #7: No Error Handling for Supabase Connectivity

### Where
[hiddenSpotStorage.ts](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/hiddenSpotStorage.ts#L133-L145), [ExploreScreen.tsx](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/screens/ExploreScreen.tsx#L24-L33)

### What's wrong
The Explore screen calls [getApprovedHiddenSpotPlaces()](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/utils/hiddenSpotStorage.ts#230-290) inside `useFocusEffect` with no error handling:

```typescript
useFocusEffect(
  React.useCallback(() => {
    const load = async () => {
      const approvedHiddenSpots = await getApprovedHiddenSpotPlaces(user?.handle);
      setAllPlaces([...approvedHiddenSpots, ...places]);
    };
    load();
  }, [user?.handle])
);
```

If Supabase is unreachable or the query fails, the error is **unhandled** → crash or silent failure that drops all places (including hardcoded ones) from the screen.

The same issue exists in [ProfileScreen.tsx](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/screens/ProfileScreen.tsx) and [AdminHiddenSpotReviewScreen.tsx](file:///c:/Users/sudarsan%20kumar/OneDrive/Desktop/AI-Travel-Assistant/src/screens/AdminHiddenSpotReviewScreen.tsx).

### Fix
- Wrap all Supabase calls in try/catch
- On failure, fall back to showing at least the hardcoded mock places
- Show a toast/banner indicating the backend is unreachable

---

## Summary of All Issues

| # | Issue | Severity | Category |
|---|-------|----------|----------|
| 1 | Approve/Reject URLs missing `/functions/v1/` path | 🔴 Critical | **Correctness** |
| 2 | SendGrid API key in client bundle | 🔴 Critical | **Security** |
| 3 | No authentication, wide-open RLS | 🔴 Critical | **Security** |
| 4 | Base64 images in database (JSONB) | 🟠 High | **Performance** |
| 5 | Non-transactional submit (orphaned submissions) | 🟠 High | **Reliability** |
| 6 | Non-atomic read-then-write in Edge Function | 🟡 Medium | **Data Integrity** |
| 7 | No error handling for Supabase calls in screens | 🟡 Medium | **Reliability** |

---

## Root Cause (Primary)

The architecture was designed as a **"quick migration from local storage to Supabase"** rather than a proper backend system. It carried forward client-centric assumptions:
- Client manages all logic (submit, email, approve)
- No server-side identity verification
- Secrets embedded in client code
- Images stored inline instead of in object storage

The broken action URLs (RCA #1) are the most likely reason the feature appears completely non-functional — admin can never approve anything.

---

## Recommended Fix Priority

1. **Fix action URLs** (RCA #1) — immediate, one-line fix to unblock approve/reject
2. **Remove client SendGrid key** (RCA #2) — security fix
3. **Add error handling** (RCA #7) — prevents crashes
4. **Move images to Supabase Storage** (RCA #4) — prevents data bloat
5. **Add proper auth + RLS** (RCA #3) — security
6. **Make submit transactional** (RCA #5) — reliability
7. **Atomic DB updates** (RCA #6) — data integrity

> [!IMPORTANT]
> If you want me to fix any or all of these issues, let me know which ones to prioritize and I'll create an implementation plan.
