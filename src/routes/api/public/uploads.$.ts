import { createFileRoute } from "@tanstack/react-router";
import { getCaller } from "@/lib/auth-session.server";

// Files in the private "uploads" bucket are only reachable through here.
// Path layout: "{appUserId}/..." or "chat/{appUserId}/...".
// Customers may only access their own folder; admins may access everything.

function ownerOf(path: string): string | null {
  const seg = path.split("/");
  if (seg[0] === "chat") return seg.length >= 3 ? seg[1]! : null;
  return seg.length >= 2 ? seg[0]! : null;
}

function validPath(p: string) {
  return !!p && !p.includes("..") && !p.startsWith("/") && /^[\w\-./]+$/.test(p);
}

export const Route = createFileRoute("/api/public/uploads/$")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const objectPath = params._splat ?? "";
        if (!validPath(objectPath)) return new Response("Not found", { status: 404 });

        const caller = await getCaller(request, { allowCookie: true });
        if (!caller?.appUser) return new Response("Unauthorized", { status: 401 });
        if (!caller.isAdmin && ownerOf(objectPath) !== caller.appUser.id) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("uploads").download(objectPath);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "application/octet-stream",
            "Cache-Control": "private, no-store",
          },
        });
      },
      POST: async ({ params, request }) => {
        const objectPath = params._splat ?? "";
        const json = (b: unknown, s = 200) =>
          new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
        if (!validPath(objectPath)) return json({ error: "invalid_path" }, 400);

        const caller = await getCaller(request);
        if (!caller?.appUser) return json({ error: "unauthorized" }, 401);
        if (!caller.isAdmin && ownerOf(objectPath) !== caller.appUser.id) {
          return json({ error: "forbidden" }, 403);
        }

        const body = await request.arrayBuffer();
        if (body.byteLength > 20 * 1024 * 1024) return json({ error: "too_large" }, 413);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.storage.from("uploads").upload(objectPath, body, {
          contentType: request.headers.get("content-type") || "application/octet-stream",
          upsert: false,
        });
        if (error) return json({ error: "upload_failed" }, 500);
        return json({ path: objectPath });
      },
    },
  },
});
