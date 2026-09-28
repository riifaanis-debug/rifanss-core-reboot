import { createFileRoute } from "@tanstack/react-router";
import { sendMail } from "@/lib/rifans-mail.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const OTP_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const SEND_FAILED = "تعذّر إرسال رمز التحقق حاليًا، يرجى المحاولة لاحقًا";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, 1)}***@${domain}`;
}

function secureCode() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return (1000 + (arr[0]! % 9000)).toString();
}

export const Route = createFileRoute("/api/public/fn/send-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const body = (await request.json()) as {
            mode?: "register" | "login";
            email?: string;
            nationalId?: string;
            phone?: string;
          };
          const mode = body.mode === "login" ? "login" : "register";
          const nationalId = (body.nationalId || "").trim();
          const phone = (body.phone || "").trim();

          if (!/^[0-9]{10}$/.test(nationalId) || !/^05[0-9]{8}$/.test(phone)) {
            return json({ success: false, error: "يرجى التأكد من رقم الهوية ورقم الجوال" });
          }

          let email = "";
          let userId: string | null = null;

          if (mode === "register") {
            email = (body.email || "").toLowerCase().trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              return json({ success: false, error: "يرجى إدخال بريد إلكتروني صحيح" });
            }
            const { data: existing } = await supabaseAdmin
              .from("app_users")
              .select("id")
              .eq("national_id", nationalId)
              .limit(1);
            if (existing && existing.length > 0) {
              return json({ success: false, error: "يوجد حساب مسجل بهذه الهوية. يرجى تسجيل الدخول." });
            }
          } else {
            const { data: user } = await supabaseAdmin
              .from("app_users")
              .select("id, email, phone")
              .eq("national_id", nationalId)
              .eq("role", "user")
              .maybeSingle();
            if (!user || user.phone !== phone || !user.email) {
              return json({ success: false, error: "بيانات الدخول غير صحيحة" });
            }
            email = user.email.toLowerCase().trim();
            userId = user.id;
          }

          // Cooldown between requests
          const { data: recent } = await supabaseAdmin
            .from("otp_codes")
            .select("created_at")
            .eq("phone", email)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (recent?.created_at) {
            const elapsed = Date.now() - new Date(recent.created_at).getTime();
            if (elapsed < RESEND_COOLDOWN_MS) {
              const retryAfter = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
              return json(
                { success: false, error: `يرجى الانتظار ${retryAfter} ثانية قبل طلب رمز جديد`, retryAfter },
                200,
              );
            }
          }

          // Invalidate previous codes
          await supabaseAdmin.from("otp_codes").delete().eq("phone", email);

          const code = secureCode();
          const { data: inserted, error: insertError } = await supabaseAdmin
            .from("otp_codes")
            .insert({
              phone: email,
              code,
              user_id: userId,
              purpose: mode,
              attempts: 0,
              expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
            })
            .select("id")
            .single();

          if (insertError || !inserted) {
            console.error("OTP insert error");
            return json({ success: false, error: SEND_FAILED }, 500);
          }

          const html = `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; background:#ffffff; padding:16px; max-width:480px; margin:auto; color:#22042C;">
        <div style="text-align:center; padding:12px 0 14px; border-bottom:2px solid #C7A969;">
          <img src="https://rifanss.com/rifans-logo.png" alt="ريفانس المالية" style="height:64px; width:auto; display:inline-block;" />
        </div>
        <div style="padding:18px 6px;">
          <h2 style="color:#22042C; font-size:14px; margin:0 0 8px;">رمز التحقق الخاص بك</h2>
          <p style="font-size:11px; color:#444; line-height:1.6; margin:0 0 14px;">
            مرحبًا، استخدم الرمز التالي لإكمال تسجيل الدخول إلى حسابك:
          </p>
          <div style="text-align:center; background:#22042C; color:#C7A969; font-size:24px; font-weight:bold; letter-spacing:6px; padding:14px; border-radius:10px; margin:12px 0;">
            ${code}
          </div>
          <p style="font-size:10px; color:#666; line-height:1.6; margin:14px 0 0;">
            هذا الرمز صالح لمدة <b>5 دقائق</b>. لا تشارك هذا الرمز مع أي شخص حفاظًا على أمان حسابك.
          </p>
          <p style="font-size:9px; color:#999; margin:10px 0 0;">
            إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.
          </p>
        </div>
        <div style="text-align:center; padding:12px; border-top:1px solid #eee; font-size:9px; color:#999;">
          © ${new Date().getFullYear()} Rifans Finance · جميع الحقوق محفوظة
        </div>
      </div>
    `;

          const messageId = crypto.randomUUID();
          let sent = false;
          try {
            const result: any = await sendMail({
              to: email,
              subject: "رمز التحقق - ريفانس المالية",
              html,
              text: `رمز التحقق الخاص بك في ريفانس المالية: ${code}\n\nهذا الرمز صالح لمدة 5 دقائق. لا تشاركه مع أي شخص.`,
            });
            sent = !result?.skipped;
          } catch {
            sent = false;
          }

          await supabaseAdmin.from("email_send_log").insert({
            message_id: messageId,
            template_name: `otp_${mode}`,
            recipient_email: email,
            status: sent ? "sent" : "failed",
            error_message: sent ? null : "OTP email not sent",
          });

          if (!sent) {
            await supabaseAdmin.from("otp_codes").delete().eq("id", inserted.id);
            return json({ success: false, error: SEND_FAILED });
          }

          return json({ success: true, maskedEmail: maskEmail(email) });
        } catch {
          console.error("send-otp error");
          return json({ success: false, error: SEND_FAILED }, 500);
        }
      },
    },
  },
});
