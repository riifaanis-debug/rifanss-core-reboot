import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sendMail } from "@/lib/rifans-mail.server";
import { renderRifansEmail } from "@/lib/email-events.server";

const name = z.string().trim().min(1).max(40);
const schema = z.object({
  first: name, middle: name, last: name,
  nationalId: z.string().regex(/^\d{10}$/),
  phone: z.string().regex(/^05\d{8}$/),
  email: z.string().trim().email().max(120),
  region: z.string().trim().min(1).max(60),
  city: z.string().trim().min(1).max(60),
  age: z.number().int().min(18).max(100),
  job: z.string().trim().min(1).max(40),
  bank: z.string().trim().min(1).max(80),
  notes: z.string().max(1000).optional().default(""),
  website: z.string().max(0).optional(),
  products: z.array(z.object({
    type: z.string().trim().min(1).max(40),
    account: z.string().trim().max(40).optional().default(""),
    amount: z.number().positive().max(100_000_000),
  })).min(1).max(10),
});

export const Route = createFileRoute("/api/public/fn/guest-waiver")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try { body = await request.json(); } catch { return Response.json({ error: "طلب غير صالح" }, { status: 400 }); }
        const p = schema.safeParse(body);
        if (!p.success) return Response.json({ error: "يرجى التحقق من البيانات المدخلة" }, { status: 400 });
        const d = p.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const { count } = await supabaseAdmin.from("guest_waiver_requests")
          .select("id", { count: "exact", head: true })
          .or(`phone.eq.${d.phone},national_id.eq.${d.nationalId}`).gte("created_at", since);
        if ((count ?? 0) >= 3) return Response.json({ error: "تم استلام طلبات سابقة منك، سيتواصل معك فريقنا قريبًا" }, { status: 429 });

        const now = new Date();
        const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
        const id = `RF-W-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
        const full_name = `${d.first} ${d.middle} ${d.last}`;
        const total = d.products.reduce((s, x) => s + x.amount, 0);

        const { error } = await supabaseAdmin.from("guest_waiver_requests").insert({
          id, full_name, national_id: d.nationalId, phone: d.phone, email: d.email,
          region: d.region, city: d.city, age: d.age, job_status: d.job, bank: d.bank,
          products: d.products, total_amount: total, notes: d.notes || null,
        });
        if (error) { console.error("guest waiver insert", error.message); return Response.json({ error: "تعذر حفظ الطلب" }, { status: 500 }); }

        try {
          await supabaseAdmin.from("admin_notifications").insert({
            event: "guest_waiver_submitted", title: "طلب إعفاء جديد من صفحة الهبوط",
            message: `قدّم ${full_name} (${d.phone}) طلب إعفاء بسبب العجز الصحي رقم ${id}.`,
            target_type: "guest_waiver", target_id: id,
          });
        } catch (e) { console.error("guest waiver notify", e); }

        try {
          const to = process.env["ADMIN_EMAIL"];
          if (to) await sendMail({
            to, subject: `طلب إعفاء جديد (صفحة الهبوط) | ${id}`,
            html: renderRifansEmail({
              title: "طلب إعفاء جديد من صفحة الهبوط",
              intro: "وصل طلب إعفاء جديد بسبب العجز الصحي من زائر غير مسجل.",
              rows: [["رقم الطلب", id], ["الاسم", full_name], ["الجوال", d.phone], ["الهوية", d.nationalId], ["البريد", d.email],
                ["المنطقة / المدينة", `${d.region} / ${d.city}`], ["الجهة المالية", d.bank], ["المجموع", `${total.toFixed(2)} ر.س`]],
              note: d.notes || undefined,
            }),
          });
        } catch (e) { console.error("guest waiver mail", e); }

        return Response.json({ id });
      },
    },
  },
});
