<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Customer/admin sessions come from the built-in auth system; the server issues a one-time magic-link token only after a verified OTP or admin password (src/lib/auth-session.server.ts). Why: browser-held sessions could be forged.
- All table access is enforced by RLS (owner via current_app_user_id(), admin via user_roles/is_admin()); files go only through /api/public/uploads with ownership checks. Why: the browser has direct database access.
- Invoices/promissory notes: one active doc per request (partial unique index on doc_status='active'); replacements mark old 'replaced', never delete/edit. Why: prevent duplicates while keeping history.
- All official documents render through src/components/rifans/documents (A4Document paginates blocks into real A4 pages; DocumentViewer scales them; a4Export clones the same pages for PDF/print). Why: screen, PDF and print must be identical from one source.
- In-site notifications go only through src/lib/notifications.ts: customer rows in notifications (target_type/target_id), admin alerts via notify_admins() into shared admin_notifications with per-admin admin_notification_states. Why: explicit destinations and independent read/archive state per admin.
- Emails are queued by database triggers into email_events (unique event+entity+recipient_role) and sent by /api/public/email-dispatch (src/lib/email-events.server.ts). Why: reliable, deduplicated, never tied to the browser or blocking the main action.
- Snap Pixel tracking goes only through src/lib/snapPixel.ts, loaded only after stored ad consent (ConsentBanner) and never sending personal data or firing on private/ID-bearing pages. Why: privacy compliance and no duplicate tracking.
