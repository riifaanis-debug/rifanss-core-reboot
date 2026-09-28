# Securing customer accounts and the database

The look, wording and steps stay the same for customers and the admin. No keys are added and no data is moved. Existing tables and customer numbers are kept, so old data can still be moved in later.

## What I found
- All 18 tables are currently readable, and most are writable, by anyone visiting the site. Examples: the customers list, requests, invoices, contracts, notes, messages and notifications.
- A customer "session" is just a record saved in the browser. Anyone can type another customer's number there and be treated as them.
- Anyone can read or upload files, and any file can be opened through the public file link.
- The admin role is taken from the customer record, which the browser can currently edit.

## 1. Real sign-in sessions (same customer steps)
- Sign-up: national ID + mobile + email → email code → account created → customer portal.
- Sign-in: national ID + mobile → code to the saved email → sign-in → customer portal.
- After a correct code, the server issues a real session from the built-in sign-in system. The session is signed by the server and renews itself, so a fake one can't be made in the browser.
- No password or SMS is added for customers.
- Admin sign-in keeps the same screen and uses the email and password stored for the admin, checked on the server. It then gets a real session the same way.
- Sign-out ends the session on the server.

## 2. Admin permission
- The admin role lives in a separate permissions table. Only the server can change it, never the browser.
- Your current admin account is given the admin role. Its email and password stay the same.
- The browser can no longer change the role, national ID, email or account link on a customer record.

## 3. Database rules, enforced by the database itself
- **Anonymous visitor:** can read only published reviews and nothing else.
- **Customer:** only their own record, requests and status history, invoices and payment requests, contracts and notes, open requests, messages, notifications, and reviews. They can't read or change anyone else's, even by editing an ID in a request. They can't delete records.
- **Admin:** full access through the admin dashboard.
- **Internal tables** (verification codes, email logs, passkeys): no browser access at all, server only.
- Live updates (messages, notifications) follow the same rules.

## 4. Files
- New uploads are saved in a folder for each customer.
- The file link now requires a session. A customer can open only their own files, and the admin can open all of them.
- Old-style file names stay accessible to the admin only, which is useful for older data later.

## 5. Removing the bypass routes
- Delete the two old functions that created a customer without a code.
- Remove only the old in-browser storage code and fallbacks (localStorage and the offline store). No customer record or other data is deleted from the database.
- Review every endpoint and every direct database call in the code to confirm none allows creating, changing, deleting or reading a customer record outside the rules above.
- Endpoints that should not be open to the public (admin alerts, HubSpot sync, fee waiver (exemption) requests) will require a session.

## 6. Security tests after the build
Run tests as an anonymous visitor, as two test customers, and as the admin. Each should confirm it's impossible to:
- read the customers list
- create a customer without a code
- change or delete another customer's data
- read another customer's requests or files
- make a fake session
- give yourself the admin role
- get past the code another way

The admin should see everything, and each customer only their own data. I'll delete the test accounts afterward. Then I'll send the report and stop.

## Technical details
- Database changes (additive only):
  - Add `auth_user_id uuid unique` to `app_users`.
  - Add a role enum, the `user_roles` table, `has_role()`, `current_app_user_id()` and `is_admin()` (all security definer).
  - Add a trigger that blocks non-admins from changing `role`, `national_id`, `email`, `auth_user_id` and `file_number`.
  - Drop the old open policies and replace them with owner-or-admin policies on every table. Keep `service_role` full access.
  - Revoke `anon` access everywhere except published `client_reviews`.
- Session minting: `verify-otp` and `verify-login`, after a successful check:
  - Create or link the auth user (admin API, email confirmed, no email sent).
  - Call `generateLink({type:'magiclink'})` and return only the `hashed_token`.
  - The browser calls `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })` to get the session.
- `AuthContext`:
  - The session comes from the auth system.
  - The profile is loaded from `app_users` using `auth_user_id`, and the role from `user_roles`.
  - Remove the `user` and `token` entries kept in the browser's storage.
  - Remove `lookupOrCreateUser`, `loginOrRegisterUser`, `registerNewUser`, `lookupUserByNationalId` and the offline users store.
- Endpoints under `/api/public/fn` that act for a user will check the bearer token server-side. `send-otp` and `verify-otp` stay public but have rate limits.
- Storage: new upload path is `{app_user_id}/...`. `storage.objects` policies check folder = own id, or admin. The public uploads route checks the bearer token and ownership, or admin.
- Existing browser queries keep working with no UI change, because the database rules now enforce access. I'll only touch calls that relied on reading other people's rows.

## Additional requirements
- A session link can be issued only inside the server's code check, and only after a correct code, or after the admin password is checked on the server. No other endpoint can issue one.
- The admin keys never reach the browser. They don't appear in the site's bundle, in network replies, or in the console. The bundle will be searched to confirm.
- Manual tests from outside the site call the database, storage and endpoints directly. They run as an anonymous visitor, customer 1, customer 2 and the admin.
