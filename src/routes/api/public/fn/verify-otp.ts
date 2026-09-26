import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const Route = createFileRoute("/api/public/fn/verify-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const body = (await request.json()) as {
            phone?: string;
            email?: string;
            code?: string;
            userId?: string;
          };

          const key = (body.email || body.phone || "").toLowerCase().trim();
          const code = (body.code || "").trim();

          if (!key || !code) {
            return json(
              { success: false, error: "البريد الإلكتروني ورمز التحقق مطلوبان" },
              400,
            );
          }

          const { data: record } = await supabaseAdmin
            .from("otp_codes")
            .select("*")
            .eq("phone", key)
            .eq("code", code)
            .eq("verified", false)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!record) {
            return json({ success: false, error: "رمز التحقق غير صحيح" }, 401);
          }

          if (new Date(record.expires_at).getTime() < Date.now()) {
            return json({ success: false, error: "رمز التحقق منتهي الصلاحية" }, 401);
          }

          await supabaseAdmin.from("otp_codes").update({ verified: true }).eq("id", record.id);

          const userId = body.userId && body.userId !== "pending" ? body.userId : record.user_id;
          if (userId) {
            await supabaseAdmin
              .from("app_users")
              .update({ phone_verified: true })
              .eq("id", userId);
          }

          await supabaseAdmin.from("otp_codes").delete().eq("id", record.id);

          return json({ success: true });
        } catch (err) {
          console.error("verify-otp error:", err);
          return json({ success: false, error: "خطأ في الخادم" }, 500);
        }
      },
    },
  },
});
