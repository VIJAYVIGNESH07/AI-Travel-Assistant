export {};

type DenoGlobal = {
  env: {
    get: (key: string) => string | undefined;
  };
  serve: (handler: (request: Request) => Response | Promise<Response>) => void;
};

declare const Deno: DenoGlobal;

type ActionTokenPayload = {
  requestId: string;
  action: 'approve' | 'reject';
  exp: number;
};

type HiddenSpotRequestRow = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  verify: boolean;
};

const textEncoder = new TextEncoder();

const htmlPage = (title: string, message: string, color = '#0f172a') => `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
      <h2 style="margin:0 0 10px;color:${color};">${title}</h2>
      <p style="margin:0;font-size:14px;line-height:1.6;">${message}</p>
    </div>
  </body>
</html>`;

const toBase64Url = (value: Uint8Array): string => {
  let binary = '';
  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (value: string): Uint8Array => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return diff === 0;
};

const verifyActionToken = async (
  token: string,
  secret: string
): Promise<ActionTokenPayload | null> => {
  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) {
    return null;
  }

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
    textEncoder.encode(payloadEncoded)
  );

  const expectedSignature = toBase64Url(new Uint8Array(signatureBuffer));
  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payloadJson = new TextDecoder().decode(fromBase64Url(payloadEncoded));
    const parsed = JSON.parse(payloadJson) as ActionTokenPayload;

    if (!parsed.requestId || (parsed.action !== 'approve' && parsed.action !== 'reject') || !parsed.exp) {
      return null;
    }

    if (parsed.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const fetchHiddenSpotRequest = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  requestId: string
): Promise<{ data: HiddenSpotRequestRow | null; error: string | null }> => {
  const url = `${supabaseUrl}/rest/v1/hidden_spot_requests?id=eq.${encodeURIComponent(requestId)}&select=id,status,verify&limit=1`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`
    }
  });

  if (!response.ok) {
    return { data: null, error: await response.text() };
  }

  const rows = (await response.json()) as HiddenSpotRequestRow[];
  return { data: rows[0] || null, error: null };
};

const updateHiddenSpotRequest = async (
  supabaseUrl: string,
  serviceRoleKey: string,
  requestId: string,
  targetStatus: 'approved' | 'rejected',
  targetVerify: boolean
): Promise<{ error: string | null }> => {
  const url = `${supabaseUrl}/rest/v1/hidden_spot_requests?id=eq.${encodeURIComponent(requestId)}&status=eq.pending`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({
      status: targetStatus,
      verify: targetVerify,
      admin_decision_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    return { error: await response.text() };
  }

  return { error: null };
};

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const requestId = url.searchParams.get('requestId');
    const token = url.searchParams.get('token');

    if (!action || !requestId || !token) {
      return new Response(htmlPage('Invalid link', 'Missing required parameters.', '#dc2626'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (action !== 'approve' && action !== 'reject') {
      return new Response(htmlPage('Invalid action', 'Action must be approve or reject.', '#dc2626'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const secret = Deno.env.get('HIDDEN_SPOT_ACTION_TOKEN_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!secret || !supabaseUrl || !serviceRoleKey) {
      return new Response(
        htmlPage('Server configuration error', 'Required secrets are missing. Contact the admin.', '#dc2626'),
        {
          status: 500,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    const verified = await verifyActionToken(token, secret);
    if (!verified) {
      return new Response(htmlPage('Invalid or expired link', 'This action link is not valid anymore.', '#dc2626'), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (verified.requestId !== requestId || verified.action !== action) {
      return new Response(htmlPage('Link mismatch', 'The link payload does not match request details.', '#dc2626'), {
        status: 401,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const targetStatus = action === 'approve' ? 'approved' : 'rejected';
    const targetVerify = action === 'approve';

    const { data: existing, error: existingError } = await fetchHiddenSpotRequest(
      supabaseUrl,
      serviceRoleKey,
      requestId
    );

    if (existingError) {
      return new Response(htmlPage('Database error', existingError, '#dc2626'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (!existing) {
      return new Response(htmlPage('Request not found', 'The hidden spot request does not exist.', '#dc2626'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (existing.status === targetStatus && existing.verify === targetVerify) {
      const doneText = targetStatus === 'approved' ? 'already approved' : 'already rejected';
      return new Response(htmlPage('Already processed', `This request is ${doneText}.`), {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    if (existing.status !== 'pending') {
      return new Response(
        htmlPage('Already processed', `This request was already marked as ${existing.status}. No change made.`),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    const { error: updateError } = await updateHiddenSpotRequest(
      supabaseUrl,
      serviceRoleKey,
      requestId,
      targetStatus,
      targetVerify
    );

    if (updateError) {
      return new Response(htmlPage('Update failed', updateError, '#dc2626'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    const successText =
      targetStatus === 'approved'
        ? 'Hidden spot has been approved successfully.'
        : 'Hidden spot has been rejected successfully.';

    return new Response(htmlPage('Action completed', successText, targetStatus === 'approved' ? '#16a34a' : '#dc2626'), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(htmlPage('Unexpected error', message, '#dc2626'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
});
