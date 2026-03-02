# Hidden Spot Email Relay via Supabase Edge Function

This setup moves SendGrid call to server side to avoid mobile TLS/network issues like error `525`.

## 1) Install Supabase CLI (one time)

- `npm install -g supabase`
- `supabase login`

## 2) Link project

From project root:

- `supabase link --project-ref pbrcqiqnxvldjotkqije`

## 3) Deploy function

Function file is already added at:

- `supabase/functions/send-hidden-spot-review-email/index.ts`

Deploy it:

- `supabase functions deploy send-hidden-spot-review-email`

## 4) Set function secrets

Set secrets in Supabase (server-side, not in app):

- `supabase secrets set SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY`
- `supabase secrets set SENDGRID_FROM_EMAIL=YOUR_VERIFIED_SENDER_EMAIL`
- `supabase secrets set SENDGRID_FROM_NAME=WanderMate`

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

If it fails, check logs:

- `supabase functions logs send-hidden-spot-review-email --project-ref pbrcqiqnxvldjotkqije`
