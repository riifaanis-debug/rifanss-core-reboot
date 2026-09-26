// Client shim that mirrors the previous `supabase.functions.invoke` signature,
// routed to the app's own server routes.
export async function invokeFunction<T = any>(
  name: string,
  options?: { body?: unknown },
): Promise<{ data: T | null; error: { message: string } | null }> {
  try {
    const resp = await fetch(`/api/public/fn/${name}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
