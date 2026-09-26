import { createFileRoute } from "@tanstack/react-router";
import { sendMail } from "@/lib/rifans-mail.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export const Route = createFileRoute("/api/public/fn/send-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { email, userId } = (await request.json()) as {
            email?: string;
            userId?: string;
            phone?: string;
          };

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return json({ success: false, error: "يرجى إدخال بريد إلكتروني صحيح" }, 400);
          }

          const code = Math.floor(1000 + Math.random() * 9000).toString();
          const key = email.toLowerCase();

          await supabaseAdmin.from("otp_codes").delete().eq("phone", key);

          const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
          const { error: insertError } = await supabaseAdmin.from("otp_codes").insert({
            phone: key,
            code,
            user_id: userId && userId !== "pending" ? userId : null,
            expires_at: expiresAt,
          });

          if (insertError) {
            console.error("OTP insert error:", insertError);
            return json({ success: false, error: "خطأ في حفظ رمز التحقق" }, 500);
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

          await supabaseAdmin.from("email_send_log").insert({
            message_id: messageId,
            template_name: "otp_email",
            recipient_email: email,
            status: "pending",
          });

          try {
            await sendMail({
              to: email,
              subject: `رمز التحقق: ${code} - ريفانس المالية`,
              html,
              text: `رمز التحقق الخاص بك في ريفانس المالية: ${code}\n\nهذا الرمز صالح لمدة 5 دقائق. لا تشاركه مع أي شخص.\n\nإذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.`,
            });
          } catch (sendError) {
            console.error("OTP email send error:", sendError);
            await supabaseAdmin.from("email_send_log").insert({
              message_id: messageId,
              template_name: "otp_email",
              recipient_email: email,
              status: "failed",
              error_message: "Failed to send OTP email",
            });
            return json(
              { success: false, error: "فشل إرسال رمز التحقق إلى البريد الإلكتروني" },
              500,
            );
          }

          return json({ success: true, messageId });
        } catch (err) {
          console.error("send-otp error:", err);
          return json({ success: false, error: "خطأ في الخادم" }, 500);
        }
      },
    },
  },
});
