// Server-only: session minting and caller verification.
// Never import this from browser code.

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

async function getAdmin(): Promise<Admin> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function randomSecret(len = 48) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function findAuthUserByEmail(admin: Admin, email: string) {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) return null;
    const hit = data.users.find((u) => (u.email || "").toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

/**
 * Issue a one-time sign-in token for an app user.
 * MUST only be called after the caller's identity was verified on the server
 * (correct OTP, or correct admin password).
 */
export async function mintSessionToken(appUser: { id: string; email: string | null; role: string; auth_user_id?: string | null }) {
  const admin = await getAdmin();
  const email = (appUser.email || "").toLowerCase().trim();
  if (!email) throw new Error("no_email");

  let authId = appUser.auth_user_id || null;
  if (!authId) {
    const created = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (created.data?.user) {
      authId = created.data.user.id;
    } else {
      const existing = await findAuthUserByEmail(admin, email);
      if (!existing) throw new Error("auth_user_failed");
      authId = existing.id;
      // Neutralise any credentials set on a pre-existing auth user before linking it
      await admin.auth.admin.updateUserById(authId, { password: randomSecret(), email_confirm: true });
      await admin.auth.admin.signOut(authId).catch(() => undefined);
    }
    const { error: linkErr } = await admin.from("app_users").update({ auth_user_id: authId }).eq("id", appUser.id);
    if (linkErr) throw new Error("link_failed");
  }

  if (appUser.role === "admin") {
    await admin.from("user_roles").upsert({ user_id: authId, role: "admin" }, { onConflict: "user_id,role" });
  } else {
    await admin.from("user_roles").upsert({ user_id: authId, role: "user" }, { onConflict: "user_id,role" });
  }

  const { data: link, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = link?.properties?.hashed_token;
  if (error || !tokenHash) throw new Error("link_generation_failed");
  return tokenHash;
}

function readCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

/** Verify the caller from the Authorization bearer token (or the file cookie). */
export async function getCaller(request: Request, opts: { allowCookie?: boolean } = {}) {
  const header = request.headers.get("authorization") || "";
  let token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token && opts.allowCookie) token = readCookie(request, "rf_at") || "";
  if (!token) return null;

  const admin = await getAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data?.user) return null;

  const { data: appUser } = await admin
    .from("app_users")
    .select("id, email, role, full_name, phone, national_id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .eq("role", "admin")
    .maybeSingle();

  return { authUserId: data.user.id, appUser: appUser || null, isAdmin: !!roleRow };
}
