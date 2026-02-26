import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { saveOrder, createDelivery } from "@/lib/helpers";
import { bookSendboxShipment } from "@/lib/sendbox";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ status: "invalid" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const orderId = await saveOrder(event.data);

      const metadata = event.data?.metadata ?? {};
      if (metadata.delivery_type === "delivery" && metadata.delivery_address && metadata.product_id) {
        try {
          const supabase = createServerClient();
          const { data: product } = await supabase
            .from("products")
            .select("name, weight, size_category")
            .eq("id", metadata.product_id)
            .single();

          const { data: store } = await supabase
            .from("stores")
            .select("name, pickup_address")
            .eq("id", metadata.store_id)
            .single();

          const deliveryAddress = JSON.parse(metadata.delivery_address);
          const originAddress = store?.pickup_address ?? {
            street: "Lagos",
            city: "Lagos",
            state: "Lagos",
            country: "Nigeria",
          };

          const shipment = await bookSendboxShipment({
            origin_address: originAddress,
            destination_address: deliveryAddress,
            weight: product?.weight ?? 1,
            size_category: product?.size_category ?? "small",
            sender_name: store?.name ?? "Seller",
            sender_phone: metadata.buyer_phone ?? "",
            receiver_name: metadata.buyer_name ?? "",
            receiver_phone: metadata.buyer_phone ?? "",
            receiver_email: event.data?.customer?.email ?? "",
            item_description: product?.name ?? "Product",
          });

          await createDelivery(orderId, {
            sendbox_shipment_id: shipment.shipment_id,
            tracking_code: shipment.tracking_code,
            courier_name: shipment.courier_name,
            delivery_type: "delivery",
            delivery_method:
              (product?.size_category === "large" || originAddress.state !== deliveryAddress.state)
                ? "van"
                : "motorcycle",
            origin_address: originAddress,
            destination_address: deliveryAddress,
            estimated_cost: 0,
            estimated_delivery_date: shipment.estimated_delivery_date,
          });
        } catch (deliveryErr) {
          const deliveryMsg = deliveryErr instanceof Error ? deliveryErr.message : "Unknown";
          console.error("Sendbox booking failed (order still created):", deliveryMsg);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook processing error:", message);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
