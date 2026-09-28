// Client shim mirroring the previous edge-function invoke signature,
// routed to the app's own server routes. Attaches the signed-in session token.
import { supabase } from "@/integrations/supabase/client";

export async function authHeader(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const t = data.session?.access_token;
    return t ? { Authorization: `Bearer ${t}` } : {};
  } catch {
    return {};
  }
}

/** Upload a file into the private bucket through the server (ownership checked there). */
export async function uploadPrivateFile(path: string, file: Blob): Promise<{ error: { message: string } | null }> {
  try {
    const resp = await fetch(`/api/public/uploads/${path}`, {
      method: "POST",
      headers: { ...(await authHeader()), "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!resp.ok) return { error: { message: `upload failed (${resp.status})` } };
    return { error: null };
  } catch (e) {
    return { error: { message: e instanceof Error ? e.message : String(e) } };
  }
}

export async function invokeFunction<T = any>(
  name: string,
  options?: { body?: unknown },
): Promise<{ data: T | null; error: { message: string } | null }> {
  try {
    const resp = await fetch(`/api/public/fn/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(options?.body ?? {}),
    });

    const text = await resp.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!resp.ok) {
      const message =
        (data && (data.error || data.message)) || `Request failed with status ${resp.status}`;
      return { data, error: { message: String(message) } };
    }

    return { data: data as T, error: null };
  } catch (err) {
    return { data: null, error: { message: err instanceof Error ? err.message : String(err) } };
  }
}
