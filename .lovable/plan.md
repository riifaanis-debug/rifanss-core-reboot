# Securing customer sign-up and sign-in

Design, pages and wording stay as they are. Only the sign-in and verification logic changes. No keys are added, no SMS, no customer passwords, and no data is moved.

## 1. Remove the bypass codes
- The codes `1234` and `0000` will no longer be accepted anywhere.
- The "test code 1234" note is removed from the code screen, along with its button. The rest of the screen stays the same.
- A code is accepted only if it is real and saved for that email. It must also be unexpired and not used yet.
- After a successful check, the code is deleted immediately, so it works only once.

## 2. Secure admin sign-in
- Remove the fixed `Rifanis / 123456` sign-in from the sign-in screen.
- Remove admin sign-in based on a fixed username and password in the server settings.
- Admin sign-in will rely only on the account in the database, using email and password. The current admin account and its password stay unchanged.

## 3. Customer sign-up (same fields)
National ID + mobile + email → a code is sent to the email → the code is entered → then the account is created → the customer is signed in and taken to the customer portal.
- The account is created on the server, and only after the code is checked. The browser can no longer create the account directly.

## 4. Customer sign-in
National ID + mobile → a code is sent to the email already on file → the code is entered → sign-in.
- The screen shows the email partly hidden, like `m***@example.com`. It can't be changed.
- If the ID and mobile don't match any account, a general message appears that doesn't reveal which one is wrong.
- Remove the fallback that signed in a "local" customer without the database. That was another bypass route.

## 5. Code rules (sign-up and sign-in)
- A code expires after 5 minutes and works once.
- A new code cancels the previous ones.
- After 5 wrong tries the code is cancelled, and the customer must request a new one.
- A new code can be requested only 60 seconds after the last one. The server enforces this, not just the button.
- The code never appears in the screen, the browser console, error messages, or any reply sent to the browser.

## 6. Without the Resend key
- If the code can't be sent, it is deleted right away. The customer sees: "تعذّر إرسال رمز التحقق حاليًا، يرجى المحاولة لاحقًا" ("We couldn't send the verification code right now, please try again later").
- There is no bypass and no sign-in. The rest of the site keeps working normally.

## 7. Final review
- Search all the code for fixed codes, fixed sign-in details, or any other way around verification.
- Then run a technical test without a real email: the server should refuse sign-up and sign-in, show the right message, and create no account.
- Then give the report and stop.

## Technical details
- Database: add `attempts int default 0` and `purpose text` (register | login) to `otp_codes`. That's the only database change.
- `send-otp`: takes `{mode: 'register', email, nationalId, phone}` or `{mode: 'login', nationalId, phone}`.
  - For login it finds the email on the server and returns only the masked email.
  - It enforces the 60-second wait, deletes older codes, and deletes the new code if the email send is `skipped` or fails (503).
- `verify-otp`: counts attempts, enforces expiry, and deletes the code on success.
  - For register it creates the `app_users` row on the server (checking the national ID isn't already used) and returns the user.
  - For login it returns the user.
- `verify-login`: remove the `ADMIN_USERNAME/ADMIN_PASSWORD` and `ADMIN_EMAIL_PASSWORD` branches, and keep checking against the database.
- `AuthPage.tsx`, `OtpVerification.tsx`, `AuthContext.tsx` (`lookupUserByNationalId` / `registerNewUser`, offline fallback): update them to use the flow above with no visual change.
- A limit to note in the report: the session is still stored in the browser (the original design), and current database permissions let the browser read customer data directly. Fixing that fully needs moving to the built-in sign-in system. That's a separate step, and I won't do it without your approval.
