import { createFileRoute } from "@tanstack/react-router";
import { getCaller } from "@/lib/auth-session.server";
import { sendMail } from "@/lib/rifans-mail.server";

interface RequestPayload {
  requestData?: {
    id?: string;
    type?: string;
    details?: string;
    data?: Record<string, any>;
    files?: Array<{ fileName?: string; filePath?: string }>;
  };
  userData?: {
    full_name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    national_id?: string;
  };
  to?: string;
  subject?: string;
}

const escapeHtml = (s: any) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildHtml = (payload: RequestPayload) => {
  const r = payload.requestData || {};
  const u = payload.userData || {};
  const fullName =
    u.full_name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || "غير محدد";

  const dataRows = Object.entries(r.data || {})
    .map(
      ([k, v]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;background:#faf7f0;font-weight:bold;color:#22042C;width:35%;">${escapeHtml(k)}</td>
          <td style="padding:8px 12px;border:1px solid #e5e7eb;color:#111;">${escapeHtml(v)}</td>
        </tr>`,
    )
    .join("");

  const filesList = (r.files || [])
    .filter(Boolean)
    .map(
      (f) => `
        <li style="margin:4px 0;">
          <a href="${escapeHtml(f.filePath || "#")}" style="color:#C7A969;text-decoration:underline;" target="_blank">
            ${escapeHtml(f.fileName || "ملف مرفق")}
          </a>
        </li>`,
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <title>طلب جديد - ريفانس</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:Tajawal,Arial,sans-serif;">
      <div style="max-width:640px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="background:linear-gradient(135deg,#22042C,#3a0a4a);color:#C7A969;padding:20px 24px;">
          <h1 style="margin:0;font-size:20px;">📩 طلب جديد - ${escapeHtml(r.type || "طلب مفتوح")}</h1>
          <p style="margin:6px 0 0;font-size:13px;color:#e8d9b5;">رقم الطلب: ${escapeHtml(r.id || "-")}</p>
        </div>
        <div style="padding:20px 24px;color:#111;">
          <h2 style="font-size:15px;color:#22042C;margin:0 0 10px;border-bottom:2px solid #C7A969;padding-bottom:6px;">بيانات العميل</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px;">
            <tr><td style="padding:6px 12px;border:1px solid #e5e7eb;background:#faf7f0;font-weight:bold;width:35%;">الاسم</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(fullName)}</td></tr>
            <tr><td style="padding:6px 12px;border:1px solid #e5e7eb;background:#faf7f0;font-weight:bold;">الهوية</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(u.national_id || "-")}</td></tr>
            <tr><td style="padding:6px 12px;border:1px solid #e5e7eb;background:#faf7f0;font-weight:bold;">الجوال</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(u.phone || "-")}</td></tr>
            <tr><td style="padding:6px 12px;border:1px solid #e5e7eb;background:#faf7f0;font-weight:bold;">البريد</td><td style="padding:6px 12px;border:1px solid #e5e7eb;">${escapeHtml(u.email || "-")}</td></tr>
          </table>

          ${r.details ? `<p style="font-size:13px;color:#444;margin:0 0 14px;"><strong>التفاصيل:</strong> ${escapeHtml(r.details)}</p>` : ""}

          <h2 style="font-size:15px;color:#22042C;margin:0 0 10px;border-bottom:2px solid #C7A969;padding-bottom:6px;">بيانات الطلب</h2>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:18px;">
            ${dataRows || `<tr><td style="padding:8px;color:#888;">لا توجد بيانات إضافية</td></tr>`}
          </table>

          ${
            filesList
              ? `
            <h2 style="font-size:15px;color:#22042C;margin:0 0 10px;border-bottom:2px solid #C7A969;padding-bottom:6px;">المرفقات</h2>
            <ul style="padding-right:20px;font-size:13px;">${filesList}</ul>`
              : ""
          }
        </div>
        <div style="background:#22042C;color:#C7A969;padding:14px 24px;text-align:center;font-size:11px;">
          شركة ريفانس المالية © - إشعار آلي من نظام الطلبات
        </div>
      </div>
    </body>
  </html>`;
};

export const Route = createFileRoute("/api/public/fn/send-exemption-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const caller = await getCaller(request);
        if (!caller?.appUser) {
          return new Response(JSON.stringify({ success: false, error: "unauthorized" }), { status: 200, headers: { "Content-Type": "application/json" } });
        }
        try {
          const payload = (await request.json()) as RequestPayload;
          const to = caller.isAdmin && payload.to ? payload.to : process.env["ADMIN_EMAIL"];
          if (!to) {
            console.warn("[send-exemption-request] skipped: no recipient configured");
            return new Response(JSON.stringify({ success: true, skipped: true, reason: "admin_email_not_configured" }), { status: 200, headers: { "Content-Type": "application/json" } });
          }

          const subject =
            payload.subject ||
            `طلب جديد - ${payload.requestData?.type || "طلب مفتوح"} (${payload.requestData?.id || ""})`;

          const data = await sendMail({ to, subject, html: buildHtml(payload) });

          return new Response(JSON.stringify({ success: true, id: data?.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: any) {
          console.error("send-exemption-request error", err);
          return new Response(
            JSON.stringify({ success: false, error: err?.message || String(err) }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
