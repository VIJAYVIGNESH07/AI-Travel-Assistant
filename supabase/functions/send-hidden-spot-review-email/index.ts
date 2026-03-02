type DenoGlobal = {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (request: Request) => Response | Promise<Response>) => void;
};

declare const Deno: DenoGlobal;

type SendRequest = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sendWithRetry = async (
  requestBody: Record<string, unknown>,
  sendgridKey: string,
  maxAttempts = 3
) => {
  let lastStatus = 0;
  let lastDetails = '';

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    console.log(`[SendGrid Attempt ${attempt}] Sending mail to:`, (requestBody.personalizations as Array<{to: Array<{email: string}>}> | undefined)?.[0]?.to?.[0]?.email);
    
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

    const { to, subject, text, html } = (await req.json()) as SendRequest;
    console.log('[HiddenSpot] Payload parsed. Recipient:', to, 'Subject:', subject);

    if (!to || !subject || !text || !html) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload. Required: to, subject, text, html.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ]
    };

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
