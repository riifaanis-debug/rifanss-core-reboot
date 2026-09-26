import { createFileRoute } from "@tanstack/react-router";

const SAR_PER_USD = 3.75;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function paypalConfig() {
  const env = (process.env["PAYPAL_ENV"] || "live").toLowerCase();
  const isSandbox = env === "sandbox";
  return {
    base: isSandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com",
    clientId: isSandbox
      ? process.env["PAYPAL_SANDBOX_CLIENT_ID"]
      : process.env["PAYPAL_CLIENT_ID"],
    clientSecret: isSandbox
      ? process.env["PAYPAL_SANDBOX_CLIENT_SECRET"]
      : process.env["PAYPAL_CLIENT_SECRET"],
  };
}

async function getAccessToken(base: string, clientId: string, clientSecret: string) {
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`PayPal auth failed [${res.status}]: ${text}`);
  return JSON.parse(text).access_token as string;
}

export const Route = createFileRoute("/api/public/fn/paypal-order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { base, clientId, clientSecret } = paypalConfig();
          if (!clientId || !clientSecret) {
            return json({ error: "الدفع الإلكتروني غير مفعّل حاليًا", reason: "paypal_not_configured" }, 503);
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const body = (await request.json()) as any;
          const action = body?.action;

          // ---------- CREATE ORDER ----------
          if (action === "create") {
            const kind: "invoice" | "payment_request" =
              body.kind === "payment_request" ? "payment_request" : "invoice";
            const recordId = String(body.record_id || "");
            const returnUrl = String(body.return_url || "");
            const cancelUrl = String(body.cancel_url || returnUrl);
            if (!recordId || !returnUrl) {
              return json({ error: "record_id and return_url are required" }, 400);
            }

            let amountSar = 0;
            let description = "";
            if (kind === "invoice") {
              const { data, error } = await supabaseAdmin
                .from("invoices")
                .select("id, amount, status, submission_id")
                .eq("id", recordId)
                .maybeSingle();
              if (error || !data) return json({ error: "Invoice not found" }, 404);
              if (data.status === "paid") return json({ error: "الفاتورة مسددة مسبقاً" }, 409);
              amountSar = Number(data.amount || 0);
              description = `فاتورة رقم ${data.id}`;
            } else {
              const { data, error } = await supabaseAdmin
                .from("payment_requests")
                .select("id, amount_sar, amount_usd, status, description")
                .eq("id", recordId)
                .maybeSingle();
              if (error || !data) return json({ error: "Payment request not found" }, 404);
              if (data.status === "paid") return json({ error: "الطلب مسدد مسبقاً" }, 409);
              amountSar = Number(data.amount_sar || 0);
              description = data.description || `طلب سداد ${data.id}`;
            }

            if (!(amountSar > 0)) return json({ error: "قيمة غير صالحة للسداد" }, 400);
            const amountUsd = (amountSar / SAR_PER_USD).toFixed(2);

            const token = await getAccessToken(base, clientId, clientSecret);
            const res = await fetch(`${base}/v2/checkout/orders`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    reference_id: `${kind}:${recordId}`,
                    custom_id: `${kind}:${recordId}`,
                    description: description.slice(0, 127),
                    amount: { currency_code: "USD", value: amountUsd },
                  },
                ],
                payment_source: {
                  paypal: {
                    experience_context: {
                      brand_name: "Rifanis Finance",
                      locale: "ar-SA",
                      user_action: "PAY_NOW",
                      shipping_preference: "NO_SHIPPING",
                      return_url: returnUrl,
                      cancel_url: cancelUrl,
                    },
                  },
                },
              }),
            });

            const text = await res.text();
            if (!res.ok) {
              console.error(`PayPal create order failed [${res.status}]: ${text}`);
              return json(
                { error: "تعذّر إنشاء عملية الدفع", status: res.status, details: text },
                res.status,
              );
            }
            const order = JSON.parse(text);
            const approve = (order.links || []).find(
              (l: any) => l.rel === "payer-action" || l.rel === "approve",
            );
            return json({
              order_id: order.id,
              approve_url: approve?.href,
              amount_usd: amountUsd,
              amount_sar: amountSar,
            });
          }

          // ---------- CAPTURE ORDER ----------
          if (action === "capture") {
            const orderId = String(body.order_id || "");
            if (!orderId) return json({ error: "order_id is required" }, 400);

            const token = await getAccessToken(base, clientId, clientSecret);
            const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            const text = await res.text();
            let order: any = null;
            try {
              order = JSON.parse(text);
            } catch {
              /* ignore */
            }

            const alreadyCaptured =
              !res.ok && JSON.stringify(order?.details || []).includes("ORDER_ALREADY_CAPTURED");

            if (!res.ok && !alreadyCaptured) {
              console.error(`PayPal capture failed [${res.status}]: ${text}`);
              return json(
                { error: "تعذّر تأكيد الدفع", status: res.status, details: text },
                res.status,
              );
            }

            if (alreadyCaptured) {
              const look = await fetch(`${base}/v2/checkout/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              order = await look.json();
            }

            const unit = order?.purchase_units?.[0];
            const custom: string = unit?.custom_id || unit?.reference_id || "";
            const capture = unit?.payments?.captures?.[0];
            const completed = order?.status === "COMPLETED" || capture?.status === "COMPLETED";

            if (!completed) {
              return json(
                { error: "لم تكتمل عملية الدفع", paypal_status: order?.status ?? null },
                402,
              );
            }

            const [kind, recordId] = custom.split(":");
            const paidAt = new Date().toISOString();

            if (kind === "invoice" && recordId) {
              await supabaseAdmin
                .from("invoices")
                .update({ status: "paid", paid_at: paidAt })
                .eq("id", recordId);
            } else if (kind === "payment_request" && recordId) {
              await supabaseAdmin
                .from("payment_requests")
                .update({ status: "paid", paid_at: paidAt })
                .eq("id", recordId);
            }

            return json({
              success: true,
              kind: kind ?? null,
              record_id: recordId ?? null,
              capture_id: capture?.id ?? null,
              amount: capture?.amount ?? null,
              paid_at: paidAt,
            });
          }

          return json({ error: "Unknown action" }, 400);
        } catch (err) {
          console.error("paypal-order error:", err instanceof Error ? err.message : String(err));
          return json({ error: err instanceof Error ? err.message : "خطأ في الخادم" }, 500);
        }
      },
    },
  },
});
