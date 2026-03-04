export { };

type DenoGlobal = {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (request: Request) => Response | Promise<Response>) => void;
};

declare const Deno: DenoGlobal;

type HiddenSpotMailPayload = {
  submissionId: string;
  submittedBy: string;
  submittedByHandle: string;
  submittedAt: number;
  name: string;
  category: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  description: string;
  accessibility: string;
  bestTime: string;
  mediaCount: number;
};

type SendRequest = {
  to: string;
  payload: HiddenSpotMailPayload;
};

type ActionTokenPayload = {
  requestId: string;
  action: 'approve' | 'reject';
  exp: number;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const textEncoder = new TextEncoder();

const toBase64Url = (value: Uint8Array | string): string => {
  const bytes = typeof value === 'string' ? textEncoder.encode(value) : value;
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const signActionToken = async (
  payload: ActionTokenPayload,
  secret: string
): Promise<string> => {
  const encodedPayload = toBase64Url(JSON.stringify(payload));

  const key = await crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    textEncoder.encode(encodedPayload)
  );

  const signature = toBase64Url(new Uint8Array(signatureBuffer));
  return `${encodedPayload}.${signature}`;
};

const buildSubject = (payload: HiddenSpotMailPayload) => {
  return `Hidden Spot Review Request - ${payload.name || 'Untitled Spot'} - ${payload.submissionId}`;
};

const buildBody = (
  payload: HiddenSpotMailPayload,
  approveUrl: string,
  rejectUrl: string
) => {
  const submittedTime = new Date(payload.submittedAt).toLocaleString();

  return [
    'Hidden Spot Review Request',
    '',
    `Submission ID: ${payload.submissionId}`,
    `Submitted At: ${submittedTime}`,
    `Submitted By: ${payload.submittedBy} (${payload.submittedByHandle})`,
    '',
    `Spot Name: ${payload.name}`,
    `Category: ${payload.category}`,
    `Location Label: ${payload.locationLabel}`,
    `Coordinates: ${payload.latitude}, ${payload.longitude}`,
    '',
    'Description:',
    payload.description || 'N/A',
    '',
    `Accessibility: ${payload.accessibility || 'Not specified'}`,
    `Best Time: ${payload.bestTime || 'Not specified'}`,
    `Media Count: ${payload.mediaCount}`,
    '',
    'Secure Admin Actions:',
    `Approve: ${approveUrl}`,
    `Reject: ${rejectUrl}`
  ].join('\n');
};

const buildHtmlBody = (
  payload: HiddenSpotMailPayload,
  approveUrl: string,
  rejectUrl: string
) => {
  const submittedTime = new Date(payload.submittedAt).toLocaleString();

  return `
  <div style="font-family:Arial,sans-serif;padding:16px;color:#1e293b;">
    <h2 style="margin:0 0 12px;">Hidden Spot Review Request</h2>
    <p style="margin:0 0 14px;">A new hidden spot submission needs admin approval.</p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;font-weight:700;">Submission ID</td><td style="padding:6px 0;">${payload.submissionId}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Submitted At</td><td style="padding:6px 0;">${submittedTime}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Submitted By</td><td style="padding:6px 0;">${payload.submittedBy} (${payload.submittedByHandle})</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Spot Name</td><td style="padding:6px 0;">${payload.name}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Category</td><td style="padding:6px 0;">${payload.category}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Location</td><td style="padding:6px 0;">${payload.locationLabel}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Coordinates</td><td style="padding:6px 0;">${payload.latitude}, ${payload.longitude}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Accessibility</td><td style="padding:6px 0;">${payload.accessibility || 'Not specified'}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Best Time</td><td style="padding:6px 0;">${payload.bestTime || 'Not specified'}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;">Media Count</td><td style="padding:6px 0;">${payload.mediaCount}</td></tr>
      <tr><td style="padding:6px 0;font-weight:700;vertical-align:top;">Description</td><td style="padding:6px 0;">${payload.description || 'N/A'}</td></tr>
    </table>
    <div style="margin-top:16px;display:flex;gap:8px;">
      <a href="${approveUrl}" style="background:#10B981;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Approve</a>
      <a href="${rejectUrl}" style="background:#EF4444;color:#fff;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Reject</a>
    </div>
    <p style="margin-top:10px;color:#64748B;">Signed links expire automatically and work from any browser.</p>
    <p style="margin:6px 0;color:#0EA5E9;word-break:break-all;">${approveUrl}</p>
    <p style="margin:6px 0;color:#EF4444;word-break:break-all;">${rejectUrl}</p>
  </div>`;
};

const sendWithRetry = async (
  requestBody: Record<string, unknown>,
  sendgridKey: string,
  maxAttempts = 3
) => {
  let lastStatus = 0;
  let lastDetails = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    console.log(`[SendGrid Attempt ${attempt}] Sending mail to:`, (requestBody.personalizations as Array<{ to: Array<{ email: string }> }> | undefined)?.[0]?.to?.[0]?.email);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`[SendGrid Attempt ${attempt}] Response status:`, response.status);

    if (response.ok) {
      console.log(`[SendGrid Attempt ${attempt}] Success!`);
      return { ok: true as const };
    }

    lastStatus = response.status;
    lastDetails = await response.text();
    console.log(`[SendGrid Attempt ${attempt}] Error response:`, lastStatus, lastDetails);

    const isTransient = response.status === 525 || response.status >= 500;
    if (!isTransient || attempt === maxAttempts) {
      break;
    }

    console.log(`[SendGrid Attempt ${attempt}] Transient error, retrying in ${attempt * 500}ms...`);
    await sleep(attempt * 500);
  }

  return {
    ok: false as const,
    upstreamStatus: lastStatus,
    details: lastDetails
  };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const sendgridKey = Deno.env.get('SENDGRID_API_KEY');
    const fromEmail = Deno.env.get('SENDGRID_FROM_EMAIL');
    const fromName = Deno.env.get('SENDGRID_FROM_NAME') || 'WanderMate';

    console.log('[HiddenSpot] Request received. Secrets check:');
    console.log('[HiddenSpot] SENDGRID_API_KEY present:', !!sendgridKey, sendgridKey ? `(prefix: ${sendgridKey.substring(0, 10)}...)` : 'MISSING');
    console.log('[HiddenSpot] SENDGRID_FROM_EMAIL:', fromEmail || 'MISSING');
    console.log('[HiddenSpot] SENDGRID_FROM_NAME:', fromName);

    if (!sendgridKey || !fromEmail) {
      console.log('[HiddenSpot] ERROR: Missing secrets!');
      return new Response(
        JSON.stringify({ error: 'Missing SENDGRID_API_KEY or SENDGRID_FROM_EMAIL in function secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const actionTokenSecret = Deno.env.get('HIDDEN_SPOT_ACTION_TOKEN_SECRET');
    if (!actionTokenSecret) {
      return new Response(
        JSON.stringify({ error: 'Missing HIDDEN_SPOT_ACTION_TOKEN_SECRET in function secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { to, payload } = (await req.json()) as SendRequest;
    console.log('[HiddenSpot] Payload parsed. Recipient:', to, 'Submission:', payload?.submissionId);

    if (!to || !payload?.submissionId || !payload?.name) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload. Required: to and payload.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const functionOrigin = new URL(req.url).origin;
    const actionBaseUrl = `${functionOrigin}/functions/v1/hidden-spot-action`;
    console.log('[HiddenSpot] Action base URL:', actionBaseUrl);
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

    const approveToken = await signActionToken(
      {
        requestId: payload.submissionId,
        action: 'approve',
        exp
      },
      actionTokenSecret
    );

    const rejectToken = await signActionToken(
      {
        requestId: payload.submissionId,
        action: 'reject',
        exp
      },
      actionTokenSecret
    );

    const approveUrl = `${actionBaseUrl}?action=approve&requestId=${encodeURIComponent(payload.submissionId)}&token=${encodeURIComponent(approveToken)}`;
    const rejectUrl = `${actionBaseUrl}?action=reject&requestId=${encodeURIComponent(payload.submissionId)}&token=${encodeURIComponent(rejectToken)}`;
    const subject = buildSubject(payload);
    const text = buildBody(payload, approveUrl, rejectUrl);
    const html = buildHtmlBody(payload, approveUrl, rejectUrl);

    if (!subject || !text || !html) {
      console.log('[HiddenSpot] ERROR: Empty email content. Subject:', !!subject, 'Text:', !!text, 'HTML:', !!html);
      return new Response(
        JSON.stringify({ error: 'Failed to build email content. Subject, text, or HTML body is empty.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestBody = {
      personalizations: [
        {
          to: [{ email: to }],
          subject
        }
      ],
      from: {
        email: fromEmail,
        name: fromName
      },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ]
    };

    console.log('[HiddenSpot] SendGrid payload ready. To:', to, 'Subject:', subject.substring(0, 50), 'From:', fromEmail);

    const result = await sendWithRetry(requestBody, sendgridKey, 3);

    if (!result.ok) {
      return new Response(
        JSON.stringify({
          error: 'SendGrid request failed',
          upstreamStatus: result.upstreamStatus,
          details: result.details
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
