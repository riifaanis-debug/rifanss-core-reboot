import { createFileRoute } from "@tanstack/react-router";
import { mintSessionToken } from "@/lib/auth-session.server";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const Route = createFileRoute("/api/public/fn/verify-login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const body = (await request.json()) as {
            username?: string;
            email?: string;
            password?: string;
          };
          const password = body.password ?? "";

          // Database-only sign-in (no hardcoded or env-based credentials)
          const email = (body.email ?? body.username ?? "").toLowerCase().trim();
          if (!email || !password) {
            return json({ success: false, error: "بيانات الدخول غير صحيحة" }, 401);
          }

          const { data: user } = await supabaseAdmin
            .from("app_users")
            .select("*")
            .eq("email", email)
            .maybeSingle();

          if (!user || !user.password_hash) {
            return json({ success: false, error: "بيانات الدخول غير صحيحة" }, 401);
          }

          const { data: valid, error: verifyError } = await supabaseAdmin.rpc("verify_password", {
            input_password: password,
            stored_hash: user.password_hash,
          });

          if (verifyError || !valid) {
            return json({ success: false, error: "بيانات الدخول غير صحيحة" }, 401);
          }

          const token_hash = await mintSessionToken(user);
          return json({
            success: true,
            token_hash,
            user: {
              id: user.id,
              fullName: user.full_name,
              name: user.full_name,
              email: user.email,
              phone: user.phone,
              national_id: user.national_id,
              role: user.role,
            },
          });
        } catch (err) {
          console.error("verify-login error:", err);
          return json({ success: false, error: "خطأ في الخادم" }, 500);
        }
      },
    },
  },
});
