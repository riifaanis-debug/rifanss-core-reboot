# Customer sign-up check: findings and live test

## What the code does now (confirmed by reading it)

**Sign-up form asks for:** national ID (10 digits), mobile (starts with 05), and email. There is no password and no name.

**Order of steps:**
1. The site checks that no account already uses this national ID.
2. No account is created yet. The verification code window opens.
3. The site generates a 4-digit code and saves it in the database (codes table, keyed by email, valid for 5 minutes). It then tries to send the code by email.
4. The customer enters the code. The site checks it against the database.
5. Only after a correct code does the site create the customer account in the database. It then signs the customer in and opens the customer portal.

**How the code is sent:** by email only, never by SMS. Resend's only role is delivering that email. The mobile number is stored but never verified, and no SMS service exists in the code.

**Without the Resend key right now:** the code is saved, but the email is skipped. The customer never receives the code, so the account is never created. Sign-up stops at the code step.

**Two back doors in the original code (not added by me):**
- The codes `1234` and `0000` are always accepted, and the screen shows `1234` as a "test code". So in practice anyone can finish sign-up without an email.
- A fixed admin sign-in, `Rifanis` / `123456`, is written into the code.

**Customer sign-in:** uses national ID and mobile only. There is no password and no code, so anyone who knows both numbers can enter the account. Sign-in does not check whether the account was ever verified.

**Password reset or change:** doesn't exist for customers, since they have no password. Customer accounts don't use the built-in sign-in system; they use the site's own customer table. So the built-in email confirmation and password reset don't apply unless we switch to that system later.

## Live test (after you approve)

- Run the flow in a headless browser: sign up with a clearly fake test customer (national ID `1999999999`, a test email), request the code, and enter the real code read from the database, not `1234`. Then sign in with national ID and mobile, and open the customer portal.
- Take a screenshot of each step.
- Confirm the code is saved, the account appears only after verification, and the portal opens.
- Afterward, delete only the test account and its code, so current data is not affected.
- No code, design, auth settings or keys will change.

## Report you'll get

The current flow, where it stops, the technical reason, and what's needed. The "what's needed" list will be:
- The Resend key plus a verified sending domain, so codes reach real inboxes.
- Removing the `1234`/`0000` codes and the fixed admin sign-in.
- A decision on whether customer sign-in should also require a code or a password.
- If a password is wanted, a password reset flow.
- Whether mobile verification is needed. That would require a separate SMS provider.

I'll then stop and wait for your approval.
