import { isSupabaseConfigured } from '../config/supabase';
import { supabase } from './supabaseClient';
import { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME } from '../config/admin';

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
  approveUrl?: string;
  rejectUrl?: string;
};

const buildSubject = (payload: HiddenSpotMailPayload) => {
  return `Hidden Spot Review Request - ${payload.name || 'Untitled Spot'} - ${payload.submissionId}`;
};

const buildBody = (payload: HiddenSpotMailPayload) => {
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
    'Admin Action:',
    '- Reply with APPROVED or REJECTED',
    '- Add optional review notes'
  ].join('\n');
};

const buildHtmlBody = (payload: HiddenSpotMailPayload) => {
  const submittedTime = new Date(payload.submittedAt).toLocaleString();
  const approveUrl = payload.approveUrl || `wandermate://admin-hidden-spot-review?submissionId=${encodeURIComponent(payload.submissionId)}&action=approved`;
  const rejectUrl = payload.rejectUrl || `wandermate://admin-hidden-spot-review?submissionId=${encodeURIComponent(payload.submissionId)}&action=rejected`;

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
    <p style="margin-top:10px;color:#64748B;">If buttons do not open, copy one of these links into your phone browser:</p>
    <p style="margin:6px 0;color:#0EA5E9;word-break:break-all;">${approveUrl}</p>
    <p style="margin:6px 0;color:#EF4444;word-break:break-all;">${rejectUrl}</p>
  </div>`;
};

const extractFunctionErrorMessage = async (error: unknown): Promise<string> => {
  if (!error || typeof error !== 'object') {
    return 'Edge function send failed';
  }

  const errorRecord = error as Record<string, unknown>;
  const baseMessage = typeof errorRecord.message === 'string' ? errorRecord.message : 'Edge function send failed';
  const context = errorRecord.context as { text?: () => Promise<string> } | undefined;

  if (!context?.text) {
    return baseMessage;
  }

  try {
    const raw = await context.text();
    if (!raw) {
      return baseMessage;
    }

    const parsed = JSON.parse(raw) as {
      error?: string;
      details?: string;
      upstreamStatus?: number;
    };

    const upstream = parsed.upstreamStatus ? `Upstream status: ${parsed.upstreamStatus}` : '';
    const detail = parsed.details ? `Details: ${parsed.details}` : '';
    const message = parsed.error || baseMessage;

    return [message, upstream, detail].filter(Boolean).join('\n');
  } catch {
    return baseMessage;
  }
};

const sendViaDirectSendGrid = async (adminEmail: string, payload: HiddenSpotMailPayload): Promise<boolean> => {
  if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
    throw new Error('SendGrid credentials not configured in environment');
  }

  const subject = buildSubject(payload);
  const text = buildBody(payload);
  const html = buildHtmlBody(payload);

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: adminEmail }],
            subject
          }
        ],
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME
        },
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html }
        ]
      })
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`SendGrid API error ${response.status}: ${details}`);
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Direct SendGrid call failed';
    throw new Error(`Fallback SendGrid send failed: ${message}`);
  }
};

export const sendHiddenSpotReviewEmail = async (adminEmail: string, payload: HiddenSpotMailPayload): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    // If Supabase not configured, try direct SendGrid as fallback
    console.warn('[Mail] Supabase not configured, attempting direct SendGrid...');
    return sendViaDirectSendGrid(adminEmail, payload);
  }

  try {
    // Try Supabase function first
    const { error, data } = await supabase.functions.invoke('send-hidden-spot-review-email', {
      body: {
        to: adminEmail,
        subject: buildSubject(payload),
        text: buildBody(payload),
        html: buildHtmlBody(payload)
      }
    });

    if (error) {
      const message = await extractFunctionErrorMessage(error);

      // If it's a 525 SSL error or network error, fallback to direct SendGrid
      if (message.includes('525') || message.includes('SSL') || message.includes('Handshake')) {
        console.warn('[Mail] SSL/TLS error from Supabase function, falling back to direct SendGrid...');
        return sendViaDirectSendGrid(adminEmail, payload);
      }

      if (message.includes('404')) {
        throw new Error(
          'Supabase function not found. Deploy function: send-hidden-spot-review-email.'
        );
      }

      throw new Error(message);
    }

    if (data && typeof data === 'object' && 'ok' in data && (data as { ok?: boolean }).ok === false) {
      // Also fallback if function returns unsuccessful
      return sendViaDirectSendGrid(adminEmail, payload);
    }

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // If Supabase function invoke failed, try direct SendGrid as last resort
    if (message.includes('525') || message.includes('SSL') || message.includes('Network')) {
      console.warn('[Mail] Supabase function failed, attempting direct SendGrid fallback...');
      return sendViaDirectSendGrid(adminEmail, payload);
    }

    throw error;
  }
};
