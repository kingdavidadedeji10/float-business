import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateDeliveryStatus } from "@/lib/helpers";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-sendbox-signature");

    if (process.env.SENDBOX_WEBHOOK_SECRET) {
      const hash = crypto
        .createHmac("sha512", process.env.SENDBOX_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (hash !== signature) {
        return NextResponse.json({ status: "invalid" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    const { tracking_code, status, description } = event;

    if (tracking_code && status) {
      await updateDeliveryStatus(tracking_code, status, description);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sendbox webhook error:", message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
