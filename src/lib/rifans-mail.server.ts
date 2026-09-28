// Server-only helper: sends transactional email through the Resend connector gateway.
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export interface MailAttachment {
  filename: string;
  content: string; // base64
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  attachments?: MailAttachment[];
}) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    console.warn(`[mail] skipped (email service not configured): "${opts.subject}" -> ${opts.to}`);
    return { skipped: true, reason: "email_not_configured" } as any;
  }
  if (!opts.to) {
    console.warn(`[mail] skipped (no recipient): "${opts.subject}"`);
    return { skipped: true, reason: "no_recipient" } as any;
  }

  const body: Record<string, unknown> = {
    from: opts.from || "ريفانس المالية <no-reply@mail.rifanss.com>",
    to: [opts.to],
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.text) body.text = opts.text;
  if (opts.attachments?.length) body.attachments = opts.attachments;

  const resp = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": resendKey,
    },
    body: JSON.stringify(body),
  });

  const text = await resp.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* ignore */
  }
  if (!resp.ok) {
    console.error(`Resend request failed [${resp.status}]: ${text}`);
    throw new Error(`Resend API failed [${resp.status}]: ${text}`);
  }
  return data;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}
