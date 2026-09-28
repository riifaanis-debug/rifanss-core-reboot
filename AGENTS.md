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
