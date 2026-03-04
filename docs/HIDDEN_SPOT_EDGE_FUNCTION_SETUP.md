# Hidden Spot Email Relay via Supabase Edge Function

This setup moves SendGrid call to server side to avoid mobile TLS/network issues like error `525`.

## 1) Use Supabase CLI (supported)

Global install via `npm install -g supabase` is no longer supported.
Use `npx` instead:

- `npx supabase@latest login`

## 2) Link project

From project root:

- `npx supabase@latest link --project-ref pbrcqiqnxvldjotkqije`

## 3) Deploy functions

Function file is already added at:

- `supabase/functions/send-hidden-spot-review-email/index.ts`
- `supabase/functions/hidden-spot-action/index.ts`

Deploy them:

- `npx supabase@latest functions deploy send-hidden-spot-review-email`
- `npx supabase@latest functions deploy hidden-spot-action`

## 4) Set function secrets

Set secrets in Supabase (server-side, not in app):

- `npx supabase@latest secrets set SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY`
- `npx supabase@latest secrets set SENDGRID_FROM_EMAIL=YOUR_VERIFIED_SENDER_EMAIL`
- `npx supabase@latest secrets set SENDGRID_FROM_NAME=WanderMate`
- `npx supabase@latest secrets set HIDDEN_SPOT_ACTION_TOKEN_SECRET=YOUR_LONG_RANDOM_SECRET`

`HIDDEN_SPOT_ACTION_TOKEN_SECRET` is used to sign and verify approve/reject URLs.

## 5) App env needed

Your app only needs Supabase public keys in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL=https://pbrcqiqnxvldjotkqije.supabase.co`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY`

No SendGrid API key is required in app anymore.

## 6) Restart app

- `npx expo start -c`

## 7) Verify flow

1. Submit hidden spot.
2. App should save pending request.
3. Edge function sends admin email through SendGrid.
4. Approve/reject buttons open HTTPS function URL and mutate DB server-side.

### Quick API tests (PowerShell)

Use your real anon key for both `Authorization` and `apikey`.

```powershell
$anon = "YOUR_SUPABASE_ANON_KEY"
$headers = @{
	Authorization = "Bearer $anon"
	apikey = $anon
	"Content-Type" = "application/json"
}

$body = @{
	to = "admin@example.com"
	payload = @{
		submissionId = "test-123"
		submittedBy = "tester@example.com"
		submittedByHandle = "@tester"
		submittedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
		name = "Test Hidden Spot"
		category = "Nature"
		locationLabel = "Chennai"
		latitude = 13.0827
		longitude = 80.2707
		description = "Quiet sunrise point"
		accessibility = "Easy"
		bestTime = "Morning"
		mediaCount = 1
	}
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method POST -Uri "https://pbrcqiqnxvldjotkqije.supabase.co/functions/v1/send-hidden-spot-review-email" -Headers $headers -Body $body
```

`hidden-spot-action` is designed for secure action links (query params), not a JSON POST body. It expects:

- `action` in query (`approve` or `reject`)
- `requestId` in query
- `token` in query (signed by `send-hidden-spot-review-email`)

If it fails, check logs:

- `npx supabase@latest functions logs send-hidden-spot-review-email --project-ref pbrcqiqnxvldjotkqije`
- `npx supabase@latest functions logs hidden-spot-action --project-ref pbrcqiqnxvldjotkqije`
