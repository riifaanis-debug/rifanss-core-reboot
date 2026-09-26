import { createFileRoute } from "@tanstack/react-router";
import { sendMail, arrayBufferToBase64 } from "@/lib/rifans-mail.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function formatAmount(val: any): string {
  const num = typeof val === "string" ? parseFloat(val.replace(/,/g, "")) : Number(val);
  if (isNaN(num)) return String(val);
  return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const Route = createFileRoute("/api/public/fn/notify-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { requestData, userData } = (await request.json()) as any;

          const ADMIN_EMAIL = process.env["ADMIN_EMAIL"];
          if (!ADMIN_EMAIL) {
            console.warn("[notify-admin] skipped: ADMIN_EMAIL not configured");
            return new Response(JSON.stringify({ success: true, skipped: true, reason: "admin_email_not_configured" }), { status: 200, headers: { "Content-Type": "application/json" } });
          }

          const fullName = userData?.fullName || userData?.full_name || "غير محدد";
          const phone = userData?.phone || "غير محدد";
          const nationalId = userData?.national_id || "غير محدد";
          const email = userData?.email || "غير محدد";
          const typeMap: Record<string, string> = {
            waive_request: "طلب إعفاء",
            rescheduling_request: "طلب جدولة",
            scheduling_request: "طلب جدولة",
            service_request: "طلب خدمة",
            financial_consultation: "استشارة مالية",
            contact: "تواصل",
            general: "طلب عام",
            contract_signed: "توقيع عقد",
            new_client: "عميل جديد",
          };
          const requestType = typeMap[requestData?.type] || requestData?.type || "عام";
          const requestId = requestData?.id || "غير محدد";
          const details = requestData?.details || "";
          const data = requestData?.data || {};
          const files: any[] = requestData?.files || [];

          const productsHtml = data.products
            ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">المنتجات</td><td style="padding:8px;border:1px solid #ddd;">${
                Array.isArray(data.products)
                  ? data.products
                      .map((p: any) => `${p.type}: ${formatAmount(p.amount)} ريال`)
                      .join("<br/>")
                  : String(data.products)
              }</td></tr>`
            : "";

          let filesHtml = "";
          if (files.length > 0) {
            const fileLinks = files
              .map((f: any) => {
                const name = f.fileName || f.name || "مرفق";
                const url = f.filePath || f.publicUrl || f.url || "#";
                const type = f.type || "";
                return `<li style="margin:4px 0;"><a href="${url}" style="color:#C7A969;text-decoration:underline;">${type ? type + " - " : ""}${name}</a></li>`;
              })
              .join("");
            filesHtml = `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">المرفقات (${files.length})</td><td style="padding:8px;border:1px solid #ddd;"><ul style="margin:0;padding-right:16px;">${fileLinks}</ul></td></tr>`;
          }

          const htmlBody = `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#22042C,#3a1a4a);padding:20px;text-align:center;">
          <h1 style="color:#C7A969;margin:0;font-size:22px;">ريفانس المالية - طلب جديد</h1>
        </div>
        <div style="padding:20px;">
          <h2 style="color:#22042C;border-bottom:2px solid #C7A969;padding-bottom:8px;">تفاصيل الطلب #${requestId}</h2>
          <table style="width:100%;border-collapse:collapse;margin:15px 0;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">نوع الطلب</td><td style="padding:8px;border:1px solid #ddd;">${requestType}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">اسم العميل</td><td style="padding:8px;border:1px solid #ddd;">${fullName}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">رقم الهوية</td><td style="padding:8px;border:1px solid #ddd;">${nationalId}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">رقم الجوال</td><td style="padding:8px;border:1px solid #ddd;">${phone}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">البريد الإلكتروني</td><td style="padding:8px;border:1px solid #ddd;">${email}</td></tr>
            ${data.region ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">المنطقة</td><td style="padding:8px;border:1px solid #ddd;">${data.region}</td></tr>` : ""}
            ${data.city ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">المدينة</td><td style="padding:8px;border:1px solid #ddd;">${data.city}</td></tr>` : ""}
            ${data.bank ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">الجهة المالية</td><td style="padding:8px;border:1px solid #ddd;">${data.bank}</td></tr>` : ""}
            ${data.jobStatus ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">الحالة الوظيفية</td><td style="padding:8px;border:1px solid #ddd;">${data.jobStatus}</td></tr>` : ""}
            ${data.totalAmount ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">إجمالي المبلغ</td><td style="padding:8px;border:1px solid #ddd;">${formatAmount(data.totalAmount)} ريال</td></tr>` : ""}
            ${productsHtml}
            ${details ? `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9;">التفاصيل</td><td style="padding:8px;border:1px solid #ddd;">${details}</td></tr>` : ""}
            ${filesHtml}
          </table>
          <p style="color:#666;font-size:12px;text-align:center;margin-top:20px;">تم الإرسال تلقائياً من نظام ريفانس المالية</p>
        </div>
      </div>
    `;

          const subject = `طلب جديد #${requestId} - ${requestType}`;

          // Attach uploaded files when they can be fetched
          const attachments: { filename: string; content: string }[] = [];
          const origin = new URL(request.url).origin;
          for (const file of files) {
            const raw = file.filePath || file.publicUrl || file.url;
            if (!raw) continue;
            const url = String(raw).startsWith("http") ? String(raw) : `${origin}${raw}`;
            try {
              const resp = await fetch(url);
              if (resp.ok) {
                const buffer = await resp.arrayBuffer();
                attachments.push({
                  filename: file.fileName || file.name || "attachment",
                  content: arrayBufferToBase64(buffer),
                });
              }
            } catch (e) {
              console.error("Failed to fetch attachment:", url, e);
            }
          }

          await sendMail({
            to: ADMIN_EMAIL,
            subject,
            html: htmlBody,
            attachments: attachments.length ? attachments : undefined,
          });

          return json({ success: true });
        } catch (err) {
          console.error("notify-admin error:", err);
          return json(
            { success: false, error: err instanceof Error ? err.message : "خطأ في الخادم" },
            500,
          );
        }
      },
    },
  },
});
