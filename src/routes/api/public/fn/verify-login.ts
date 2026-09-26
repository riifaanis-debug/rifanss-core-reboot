import { createFileRoute } from "@tanstack/react-router";

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

          const ADMIN_USERNAME = process.env["ADMIN_USERNAME"];
          const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"];
          const ADMIN_EMAIL = process.env["ADMIN_EMAIL"];

          // ---- Admin username / password path ----
          if (body.username) {
            if (
              !ADMIN_USERNAME ||
              !ADMIN_PASSWORD ||
              body.username !== ADMIN_USERNAME ||
              password !== ADMIN_PASSWORD
            ) {
              return json({ success: false, error: "بيانات الدخول غير صحيحة" }, 401);
            }

            let { data: adminUser } = await supabaseAdmin
              .from("app_users")
              .select("*")
              .eq("role", "admin")
              .maybeSingle();

            if (!adminUser) {
              const { data: created, error: createError } = await supabaseAdmin
                .from("app_users")
                .insert({
                  id: `admin-${Date.now()}`,
                  full_name: "المسؤول",
                  email: ADMIN_EMAIL ?? null,
                  role: "admin",
                })
                .select("*")
                .single();
              if (createError) throw createError;
              adminUser = created;
            }

            return json({
              success: true,
              user: {
                id: adminUser!.id,
                fullName: adminUser!.full_name,
                name: adminUser!.full_name,
                email: adminUser!.email,
                phone: adminUser!.phone,
                national_id: adminUser!.national_id,
                role: adminUser!.role,
              },
            });
          }

          // ---- Email / password path ----
          const email = (body.email ?? "").toLowerCase().trim();
          if (!email || !password) {
            return json({ success: false, error: "بيانات الدخول غير صحيحة" }, 401);
          }

          const ADMIN_EMAIL_PASSWORD = process.env["ADMIN_EMAIL_PASSWORD"];
          if (
            ADMIN_EMAIL &&
            ADMIN_EMAIL_PASSWORD &&
            email === ADMIN_EMAIL.toLowerCase() &&
            password === ADMIN_EMAIL_PASSWORD
          ) {
            let { data: adminUser } = await supabaseAdmin
              .from("app_users")
              .select("*")
              .eq("role", "admin")
              .maybeSingle();

            if (!adminUser) {
              const { data: created, error: createError } = await supabaseAdmin
                .from("app_users")
                .insert({
                  id: `admin-${Date.now()}`,
                  full_name: "المسؤول",
                  email: ADMIN_EMAIL,
                  role: "admin",
                })
                .select("*")
                .single();
              if (createError) throw createError;
              adminUser = created;
            }

            return json({
              success: true,
              user: {
                id: adminUser!.id,
                fullName: adminUser!.full_name,
                name: adminUser!.full_name,
                email: adminUser!.email,
                phone: adminUser!.phone,
                national_id: adminUser!.national_id,
                role: adminUser!.role,
              },
            });
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

          return json({
            success: true,
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
