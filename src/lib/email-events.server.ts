// Server-only: turns queued email_events rows into branded emails.
// Data is always read from the database here; nothing comes from the browser.
import { sendMail } from "./rifans-mail.server";

const SITE = "https://rifanss.com";
const LOGO = `${SITE}/rifans-logo.png`;
const C = { purple: "#2A0E32", gold: "#B99A55", white: "#FFFFFF", off: "#FBFAF8" };

const REQUEST_TYPES: Record<string, string> = {
  waive_request: "طلب إعفاء",
  rescheduling_request: "طلب إعادة جدولة",
  scheduling_request: "طلب إعادة جدولة",
  statutory_ratio: "طلب إتاحة النسبة النظامية",
  ratio_request: "طلب إتاحة النسبة النظامية",
  service_request: "طلب خدمة",
  financial_consultation: "استشارة مالية",
  general: "طلب عام",
};
const STATUS_AR: Record<string, string> = {
  pending: "قيد الاستلام", under_review: "تحت الإجراء", processing: "قيد التنفيذ",
  awaiting_documents: "بانتظار مستندات", approved: "تمت الموافقة", rejected: "مرفوض",
  completed: "مكتمل", scheduled: "تم تحديد موعد", cancelled: "ملغى",
};
const typeAr = (t?: string | null) => (t && REQUEST_TYPES[t]) || (t ? t.replace(/_/g, " ") : "طلب");

const esc = (v: unknown) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const fmtDate = (d?: string | null) => {
  const x = d ? new Date(d) : new Date();
  return x.toLocaleString("ar-SA-u-nu-latn", { timeZone: "Asia/Riyadh", dateStyle: "medium", timeStyle: "short" });
};
const fmtAmount = (n: unknown) => {
  const v = Number(n);
  return isNaN(v) ? "" : `${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ريال`;
};

export function renderRifansEmail(o: {
  title: string; intro: string; rows: [string, unknown][]; cta?: { label: string; url: string }; note?: string;
}) {
  const rows = o.rows.filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `<tr><td style="padding:10px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px;width:40%;">${esc(k)}</td><td style="padding:10px 12px;border-bottom:1px solid #eee;color:${C.purple};font-size:14px;font-weight:bold;">${esc(v)}</td></tr>`).join("");
  const cta = o.cta ? `<div style="text-align:center;margin:24px 0 8px;"><a href="${esc(o.cta.url)}" style="display:inline-block;background:${C.gold};color:${C.white};text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:bold;font-size:15px;">${esc(o.cta.label)}</a></div>` : "";
  const note = o.note ? `<div style="background:${C.off};border-right:4px solid ${C.gold};padding:12px;margin:16px 0;font-size:13px;color:#444;white-space:pre-wrap;">${esc(o.note)}</div>` : "";
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Tahoma,Arial,sans-serif;">
<div dir="rtl" style="max-width:600px;margin:0 auto;background:${C.white};">
  <div style="background:${C.purple};padding:22px;text-align:center;"><img src="${LOGO}" alt="ريفانس المالية" style="max-height:56px;max-width:180px;"></div>
  <div style="height:4px;background:${C.gold};"></div>
  <div style="padding:24px 20px;background:${C.off};">
    <h1 style="margin:0 0 12px;color:${C.purple};font-size:20px;">${esc(o.title)}</h1>
    <p style="margin:0 0 16px;color:#333;font-size:14px;line-height:1.8;">${esc(o.intro)}</p>
    ${rows ? `<table style="width:100%;border-collapse:collapse;background:${C.white};border-radius:10px;">${rows}</table>` : ""}
    ${note}${cta}
  </div>
  <div style="background:${C.purple};color:#d9cfe0;padding:16px;text-align:center;font-size:12px;line-height:1.8;">
    <div style="color:${C.gold};font-weight:bold;">شركة ريفانس المالية</div>
    <div>رسالة آلية، يرجى عدم الرد عليها.</div>
    <div><a href="${SITE}" style="color:${C.gold};text-decoration:none;">rifanss.com</a></div>
  </div>
</div></body></html>`;
}

type Built = { to: string | null; subject: string; html: string } | { skip: string };

const portal = (hash: string) => `${SITE}/${hash}`;

export async function buildEmail(admin: any, ev: { event: string; entity_id: string; recipient_role: string }): Promise<Built> {
  const adminEmail = process.env["ADMIN_EMAIL"] || null;
  const forAdmin = ev.recipient_role === "admin";
  const baseId = ev.entity_id.split(":")[0]!;

  const user = async (id: string) =>
    (await admin.from("app_users").select("id, full_name, email, phone, file_number, created_at").eq("id", id).maybeSingle()).data;
  const request = async (id: string) =>
    (await admin.from("requests").select("id, user_id, type, status, created_at").eq("id", id).maybeSingle()).data;
  const lastComment = async (id: string, status: string) => {
    const { data } = await admin.from("request_history").select("comment").eq("request_id", id).eq("status", status)
      .order("created_at", { ascending: false }).limit(1);
    const c = data?.[0]?.comment as string | undefined;
    return c && !c.startsWith("Status changed to") ? c : undefined;
  };
  const toFor = (u: any) => (forAdmin ? adminEmail : u?.email || null);

  switch (ev.event) {
    case "customer_registered": {
      const u = await user(baseId); if (!u) return { skip: "not_found" };
      if (forAdmin) return { to: adminEmail, subject: "تسجيل عميل جديد | ريفانس المالية", html: renderRifansEmail({
        title: "تسجيل عميل جديد", intro: "تم تسجيل عميل جديد في المنصة.",
        rows: [["اسم العميل", u.full_name], ["رقم العميل", u.file_number || u.id], ["البريد الإلكتروني", u.email], ["رقم الجوال", u.phone], ["تاريخ ووقت التسجيل", fmtDate(u.created_at)]],
        cta: { label: "عرض ملف العميل", url: portal("#/admin") } }) };
      return { to: u.email, subject: "تم تسجيل حسابك بنجاح | ريفانس المالية", html: renderRifansEmail({
        title: `مرحبًا ${u.full_name || ""}`, intro: "تم تسجيل حسابك في ريفانس المالية بنجاح. يمكنك الآن الدخول إلى بوابة العميل لتقديم طلباتك ومتابعتها.",
        rows: [["رقم العميل", u.file_number || u.id], ["تاريخ التسجيل", fmtDate(u.created_at)]],
        cta: { label: "الدخول إلى بوابة العميل", url: portal("#/dashboard") } }) };
    }
    case "request_created": {
      const r = await request(baseId); if (!r) return { skip: "not_found" };
      const u = await user(r.user_id); const t = typeAr(r.type);
      if (forAdmin) return { to: adminEmail, subject: `طلب جديد | ${t} | ${r.id}`, html: renderRifansEmail({
        title: "طلب جديد", intro: "تم تقديم طلب جديد من أحد العملاء.",
        rows: [["اسم العميل", u?.full_name], ["رقم العميل", u?.file_number || u?.id], ["نوع الطلب", t], ["رقم الطلب", r.id], ["تاريخ ووقت التقديم", fmtDate(r.created_at)]],
        cta: { label: "عرض الطلب", url: portal("#/admin") } }) };
      return { to: toFor(u), subject: `تم استلام طلبك | ${t} | ${r.id}`, html: renderRifansEmail({
        title: "تم استلام طلبك", intro: "تم استلام طلبك بنجاح، ويمكنك متابعة حالة الطلب من خلال بوابة العميل.",
        rows: [["نوع الطلب", t], ["رقم الطلب", r.id], ["تاريخ التقديم", fmtDate(r.created_at)], ["الحالة الحالية", STATUS_AR[r.status] || r.status]],
        cta: { label: "عرض الطلب", url: portal(`#/dashboard?tab=requests&reqId=${encodeURIComponent(r.id)}`) } }) };
    }
    case "documents_submitted": {
      const { data: o } = await admin.from("open_requests").select("id, user_id, title, submitted_at").eq("id", baseId).maybeSingle();
      if (!o) return { skip: "not_found" };
      const u = await user(o.user_id);
      return { to: adminEmail, subject: `تم استلام مستندات العميل | ${o.id}`, html: renderRifansEmail({
        title: "تم استلام مستندات العميل", intro: "قام العميل برفع المستندات/البيانات المطلوبة.",
        rows: [["اسم العميل", u?.full_name], ["رقم الطلب", o.id], ["نوع الطلب", o.title], ["تاريخ ووقت الرفع", fmtDate(o.submitted_at)]],
        cta: { label: "عرض الطلب", url: portal("#/admin") } }) };
    }
    case "contract_issued": case "contract_signed": {
      const { data: c } = await admin.from("contracts").select("id, submission_id, user_id, type, signed_at, created_at").eq("id", baseId).maybeSingle();
      if (!c) return { skip: "not_found" };
      const u = await user(c.user_id); const r = await request(c.submission_id);
      if (ev.event === "contract_signed") return { to: adminEmail, subject: `تم توقيع العقد | ${c.id}`, html: renderRifansEmail({
        title: "تم توقيع العقد", intro: "قام العميل بتوقيع العقد إلكترونيًا.",
        rows: [["اسم العميل", u?.full_name], ["رقم العميل", u?.file_number || u?.id], ["رقم الطلب", c.submission_id], ["رقم العقد", c.id], ["تاريخ ووقت التوقيع", fmtDate(c.signed_at)]],
        cta: { label: "عرض الطلب", url: portal("#/admin") } }) };
      return { to: toFor(u), subject: `عقد جديد بانتظار توقيعك | ${c.id}`, html: renderRifansEmail({
        title: "عقد جديد بانتظار توقيعك", intro: `تم إصدار عقد مرتبط بطلبك رقم ${c.submission_id}، وهو متاح الآن للمراجعة والتوقيع الإلكتروني من خلال بوابة العميل.`,
        rows: [["رقم العقد", c.id], ["رقم الطلب", c.submission_id], ["نوع الطلب", typeAr(r?.type || c.type)], ["تاريخ الإصدار", fmtDate(c.created_at)]],
        cta: { label: "مراجعة وتوقيع العقد", url: portal(`#/contract/${c.submission_id}`) } }) };
    }
    case "promissory_issued": case "promissory_signed": {
      const { data: n } = await admin.from("promissory_notes").select("id, submission_id, user_id, signed_at, created_at").eq("id", baseId).maybeSingle();
      if (!n) return { skip: "not_found" };
      const u = await user(n.user_id);
      if (ev.event === "promissory_signed") return { to: adminEmail, subject: `تم توقيع السند لأمر | ${n.id}`, html: renderRifansEmail({
        title: "تم توقيع السند لأمر", intro: "قام العميل بتوقيع السند لأمر إلكترونيًا.",
        rows: [["اسم العميل", u?.full_name], ["رقم الطلب", n.submission_id], ["رقم السند", n.id], ["تاريخ ووقت التوقيع", fmtDate(n.signed_at)]],
        cta: { label: "عرض الطلب", url: portal("#/admin") } }) };
      return { to: toFor(u), subject: `سند لأمر بانتظار توقيعك | ${n.id}`, html: renderRifansEmail({
        title: "سند لأمر بانتظار توقيعك", intro: "تم إصدار سند لأمر إلكتروني مرتبط بطلبك، وهو متاح الآن للمراجعة والتوقيع الإلكتروني من خلال بوابة العميل.",
        rows: [["رقم السند", n.id], ["رقم الطلب", n.submission_id], ["تاريخ الإصدار", fmtDate(n.created_at)]],
        cta: { label: "مراجعة وتوقيع السند لأمر", url: portal(`#/promissory/${n.id}`) } }) };
    }
    case "invoice_issued": case "invoice_paid": {
      const { data: i } = await admin.from("invoices").select("id, submission_id, user_id, type, amount, status, paid_at, created_at").eq("id", baseId).maybeSingle();
      if (!i) return { skip: "not_found" };
      const u = await user(i.user_id); const r = await request(i.submission_id);
      if (ev.event === "invoice_paid") return { to: toFor(u), subject: `تم تسجيل سداد الفاتورة | ${i.id}`, html: renderRifansEmail({
        title: "تم تسجيل سداد الفاتورة", intro: `تم تسجيل سداد الفاتورة رقم ${i.id} بنجاح.`,
        rows: [["رقم الفاتورة", i.id], ["المبلغ", fmtAmount(i.amount)], ["تاريخ السداد", fmtDate(i.paid_at)]],
        cta: { label: "عرض الفاتورة", url: portal(`#/invoice/${i.submission_id}`) } }) };
      return { to: toFor(u), subject: `تم إصدار فاتورة جديدة | ${i.id}`, html: renderRifansEmail({
        title: "تم إصدار فاتورة جديدة", intro: "تم إصدار فاتورة جديدة مرتبطة بطلبك، ويمكنك مراجعتها من خلال بوابة العميل.",
        rows: [["رقم الفاتورة", i.id], ["رقم الطلب", i.submission_id], ["نوع الخدمة", typeAr(r?.type || i.type)], ["القيمة المستحقة", fmtAmount(i.amount)], ["تاريخ الإصدار", fmtDate(i.created_at)], ["حالة الفاتورة", i.paid_at || i.status === "paid" ? "مدفوعة" : "غير مدفوعة"]],
        cta: { label: "عرض الفاتورة", url: portal(`#/invoice/${i.submission_id}`) } }) };
    }
    default: {
      if (!ev.event.startsWith("request_status_")) return { skip: "unknown_event" };
      const status = ev.event.slice("request_status_".length);
      const r = await request(baseId); if (!r) return { skip: "not_found" };
      const u = await user(r.user_id); const t = typeAr(r.type);
      const view = { label: "عرض الطلب", url: portal(`#/dashboard?tab=requests&reqId=${encodeURIComponent(r.id)}`) };
      const common: [string, unknown][] = [["رقم الطلب", r.id], ["نوع الطلب", t], ["تاريخ التحديث", fmtDate()]];
      const map: Record<string, { s: string; title: string; intro: string; cta?: any; noteStatus?: boolean }> = {
        under_review: { s: "تحديث حالة طلبك | الطلب تحت الإجراء", title: "الطلب تحت الإجراء", intro: `تم تحديث حالة طلبك رقم ${r.id} إلى تحت الإجراء، ويجري حاليًا العمل على الإجراءات المتعلقة بطلبك.` },
        processing: { s: "تحديث حالة طلبك | قيد التنفيذ", title: "قيد التنفيذ", intro: `تم تحديث حالة طلبك رقم ${r.id} إلى قيد التنفيذ، ويتم حاليًا استكمال الإجراءات المتعلقة بالطلب.` },
        awaiting_documents: { s: `مطلوب استكمال مستندات | ${r.id}`, title: "مطلوب استكمال مستندات", intro: "يحتاج طلبك إلى استكمال بعض المستندات المطلوبة لمواصلة الإجراءات. يرجى الدخول إلى بوابة العميل ورفع المستندات المطلوبة.", cta: { label: "استكمال المستندات", url: view.url }, noteStatus: true },
        approved: { s: `تمت الموافقة على طلبك | ${r.id}`, title: "تمت الموافقة على طلبك", intro: `تمت الموافقة على طلبك رقم ${r.id}، وسيتم استكمال الإجراءات المرتبطة به وفق مسار الطلب.` },
        completed: { s: `اكتملت معالجة طلبك | ${r.id}`, title: "اكتملت معالجة طلبك", intro: `تم إنجاز واكتمال إجراءات طلبك رقم ${r.id} بنجاح.` },
        rejected: { s: `تحديث بشأن طلبك | ${r.id}`, title: "تحديث بشأن طلبك", intro: `تم تحديث حالة طلبك رقم ${r.id}.`, noteStatus: true },
      };
      const m = map[status]; if (!m) return { skip: "status_not_notified" };
      const note = m.noteStatus ? await lastComment(r.id, status) : undefined;
      return { to: toFor(u), subject: m.s, html: renderRifansEmail({
        title: m.title, intro: m.intro,
        rows: status === "rejected" ? [...common, ["الحالة", STATUS_AR.rejected]] : common,
        note: note ? `ملاحظة: ${note}` : undefined, cta: m.cta || view }) };
    }
  }
}

/** Claims and sends pending events. Safe to call repeatedly. */
export async function dispatchPendingEmails(limit = 20) {
  const { supabaseAdmin: admin } = await import("@/integrations/supabase/client.server");
  const stale = new Date(Date.now() - 5 * 60_000).toISOString();
  const { data: rows } = await admin.from("email_events").select("id, event, entity_id, recipient_role, attempts, status, locked_at")
    .in("status", ["pending", "failed", "processing"]).lt("attempts", 5).order("created_at").limit(limit);
  let sent = 0;
  for (const row of rows || []) {
    if (row.status === "processing" && row.locked_at && row.locked_at > stale) continue;
    const { data: claimed } = await admin.from("email_events")
      .update({ status: "processing", locked_at: new Date().toISOString(), attempts: row.attempts + 1 })
      .eq("id", row.id).eq("status", row.status).eq("attempts", row.attempts).select("id");
    if (!claimed?.length) continue;
    let patch: Record<string, unknown>;
    try {
      const built = await buildEmail(admin, row);
      if ("skip" in built) patch = { status: "skipped", error: built.skip };
      else if (!built.to) patch = row.recipient_role === "admin"
        ? { status: "failed", error: "admin_email_not_configured" }
        : { status: "skipped", error: "no_recipient" };
      else {
        const res: any = await sendMail({ to: built.to, subject: built.subject, html: built.html });
        patch = res?.skipped ? { status: "failed", error: String(res.reason || "not_configured") }
          : { status: "sent", sent_at: new Date().toISOString(), error: null };
        if (!res?.skipped) sent++;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const code = /\[(\d{3})\]/.exec(msg)?.[1];
      patch = { status: "failed", error: code ? `provider_error_${code}` : "send_error" };
    }
    await admin.from("email_events").update(patch).eq("id", row.id);
  }
  return { processed: rows?.length || 0, sent };
}
