# Snap Pixel: separate tracking for exemption and scheduling requests

## What the inspection found
- One Pixel only (`2196cf76-…`), loaded after "أوافق" consent. PAGE_VIEW (deduped per page) and VIEW_CONTENT stay as they are.
- `CUSTOM_EVENT_1` is currently sent for **every** request type (exemption, scheduling, consultation, seized amounts, services, products) from two places: the shared save step and the "resume draft" path in the exemption/scheduling form.
- The shared save step falls back to saving on the device when the database save fails, and still looks successful to the form. The event is already skipped in that case; this stays.
- Request types: exemption = `waive_request`; scheduling = `rescheduling_request` and `scheduling_request` (the "جدولة المديونيات" variant).
- `CUSTOM_EVENT_1` and `CUSTOM_EVENT_2` are official Snap Pixel standard event names (Snap supports CUSTOM_EVENT_1 to 5).

## Changes (tracking file + two call sites only)
1. Replace the generic "application submitted" helper with one helper that takes the saved request's type and ID:
   - `waive_request` -> `CUSTOM_EVENT_1`
   - `rescheduling_request` / `scheduling_request` -> `CUSTOM_EVENT_2`
   - any other type -> no custom event (consultation, products, etc. stop sending CUSTOM_EVENT_1)
2. Call it only after the database returns the saved row (new request or submitted draft). Not on form open, button press, failed save, or device-only fallback.
3. No duplicates: remember the request ID locally after sending; the same request is never sent again (reload, re-shown success message, double tap). The form's existing in-progress lock on the submit button is kept unchanged.
4. Event payload: only the event name and the cleaned page address (no IDs). No description, no amounts, no names, no ID/phone/email, no account or contract numbers, no advanced matching. Consent is read at send time; rejection or withdrawal blocks everything.

## Policy review (Snapchat)
- Snap's business tools terms forbid sending sensitive data, including detailed financial information. The plan sends only a generic event name with no values, which fits.
- Financial services ads on Snapchat are allowed but restricted (local licensing, clear terms, no targeting based on financial hardship). Measuring that a request was submitted is permitted; you should avoid building audiences that imply someone is in debt. I will mention this, not enforce it.
- The privacy notice already names Snapchat and ad measurement; I will add one line that request submissions are counted without personal data.

## Tests (Playwright, mobile width, signed-in customer)
- Successful exemption -> exactly one CUSTOM_EVENT_1.
- Successful scheduling -> exactly one CUSTOM_EVENT_2.
- Forced save failure -> no event.
- Double tap on submit + reload of the success view -> still one event.
- Rejected consent -> zero requests to Snapchat.
- Inspect all Snapchat request bodies for name, ID, phone, email, amounts, account numbers -> none present.
- Test requests are deleted afterwards.

## Not touched
Design, forms, fields, customer portal behaviour, database, permissions, sign-in.
