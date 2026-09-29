import { createFileRoute } from "@tanstack/react-router";

// Processes already-queued email events (queued only by database triggers).
// Takes no input, returns only counts; safe to call repeatedly.
export const Route = createFileRoute("/api/public/email-dispatch")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const { dispatchPendingEmails } = await import("@/lib/email-events.server");
          const r = await dispatchPendingEmails();
          return Response.json({ ok: true, ...r });
        } catch (e) {
          console.error("[email-dispatch] failed", e instanceof Error ? e.message : "error");
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
