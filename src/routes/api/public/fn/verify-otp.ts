import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const MAX_ATTEMPTS = 5;
const INVALID = "رمز التحقق غير صحيح";

function fileNumber() {
  const now = new Date();
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const rand = 1000 + (arr[0]! % 9000);
  return `RF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${rand}`;
}

const toClient = (u: any) => ({
  id: u.id,
  fullName: u.full_name,
  name: u.full_name,
  email: u.email,
  phone: u.phone,
  mobile: u.phone,
  national_id: u.national_id,
  nationalId: u.national_id,
  file_number: u.file_number,
  fileNumber: u.file_number,
  role: u.role,
});

export const Route = createFileRoute("/api/public/fn/verify-otp")({
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
            code?: string;
          };
          const mode = body.mode === "login" ? "login" : "register";
          const nationalId = (body.nationalId || "").trim();
          const phone = (body.phone || "").trim();
          const code = (body.code || "").trim();

          if (!/^[0-9]{4}$/.test(code) || !/^[0-9]{10}$/.test(nationalId)) {
            return json({ success: false, error: INVALID });
          }

          // Resolve the email the code was sent to (server-side only)
          let email = "";
          let loginUser: any = null;
          if (mode === "register") {
            email = (body.email || "").toLowerCase().trim();
          } else {
            const { data: u } = await supabaseAdmin
              .from("app_users")
              .select("*")
              .eq("national_id", nationalId)
              .eq("role", "user")
              .maybeSingle();
            if (!u || u.phone !== phone || !u.email) return json({ success: false, error: INVALID });
            loginUser = u;
            email = u.email.toLowerCase().trim();
          }
          if (!email) return json({ success: false, error: INVALID });

          const { data: record } = await supabaseAdmin
            .from("otp_codes")
            .select("*")
            .eq("phone", email)
            .eq("purpose", mode)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!record) {
            return json({ success: false, error: "لا يوجد رمز صالح، يرجى طلب رمز جديد" });
          }
          if (new Date(record.expires_at).getTime() < Date.now()) {
            await supabaseAdmin.from("otp_codes").delete().eq("id", record.id);
            return json({ success: false, error: "رمز التحقق منتهي الصلاحية، يرجى طلب رمز جديد" });
          }
          if (record.code !== code) {
            const attempts = (record.attempts || 0) + 1;
            if (attempts >= MAX_ATTEMPTS) {
              await supabaseAdmin.from("otp_codes").delete().eq("id", record.id);
              return json({ success: false, error: "تجاوزت عدد المحاولات، يرجى طلب رمز جديد" });
            }
            await supabaseAdmin.from("otp_codes").update({ attempts }).eq("id", record.id);
            return json({ success: false, error: INVALID });
          }

          // Single use: delete before acting
          await supabaseAdmin.from("otp_codes").delete().eq("id", record.id);

          if (mode === "login") {
            await supabaseAdmin.from("app_users").update({ phone_verified: true }).eq("id", loginUser.id);
            return json({ success: true, user: toClient(loginUser) });
          }

          // Register: create the account only now
          if (!/^05[0-9]{8}$/.test(phone)) return json({ success: false, error: INVALID });
          const { data: existing } = await supabaseAdmin
            .from("app_users")
            .select("id")
            .eq("national_id", nationalId)
            .limit(1);
          if (existing && existing.length > 0) {
            return json({ success: false, error: "يوجد حساب مسجل بهذه الهوية. يرجى تسجيل الدخول." });
          }

          const { data: created, error: createError } = await supabaseAdmin
            .from("app_users")
            .insert({
              id: Date.now().toString(),
              full_name: `عميل ${nationalId.slice(-4)}`,
              email,
              phone,
              national_id: nationalId,
              file_number: fileNumber(),
              role: "user",
              phone_verified: true,
            })
            .select("*")
            .single();
          if (createError || !created) {
            return json({ success: false, error: "تعذّر إنشاء الحساب" }, 500);
          }
          return json({ success: true, user: toClient(created), created: true });
        } catch {
          console.error("verify-otp error");
          return json({ success: false, error: "خطأ في الخادم" }, 500);
        }
      },
    },
  },
});
