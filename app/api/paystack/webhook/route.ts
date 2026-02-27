import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@/lib/supabase";
import { bookShipment } from "@/lib/sendbox";

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
      const reference = event.data?.reference;
      if (!reference) {
        return NextResponse.json({ received: true });
      }

      const supabase = createServerClient();

      // Update order status to paid
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .update({ status: "paid", updated_at: new Date().toISOString() })
        .eq("paystack_reference", reference)
        .select()
        .single();

      if (orderError || !order) {
        console.error("Order update error:", orderError?.message);
        return NextResponse.json({ received: true });
      }

      // Decrement product stock
      if (order.product_id && order.quantity) {
        const { data: productData } = await supabase
          .from("products")
          .select("quantity")
          .eq("id", order.product_id)
          .single();

        if (productData && productData.quantity != null) {
          const newQty = Math.max(0, productData.quantity - order.quantity);
          await supabase
            .from("products")
            .update({ quantity: newQty })
            .eq("id", order.product_id)
            .gte("quantity", order.quantity);
        }
      }

      // If delivery, book shipment and create delivery record
      if (order.delivery_method === "delivery" && order.customer_address) {
        // Fetch store for pickup address
        const { data: store } = await supabase
          .from("stores")
          .select("pickup_address, name")
          .eq("id", order.store_id)
          .single();

        // Fetch product for size category
        const { data: product } = order.product_id
          ? await supabase
              .from("products")
              .select("size_category")
              .eq("id", order.product_id)
              .single()
          : { data: null };

        const pickupAddress = store?.pickup_address || store?.name || "Store";
        const sizeCategory = product?.size_category || "medium";

        try {
          const shipment = await bookShipment(
            order.id,
            pickupAddress,
            order.customer_address,
            sizeCategory
          );

          await supabase.from("deliveries").insert({
            order_id: order.id,
            tracking_id: shipment.trackingId,
            courier: shipment.courier,
            status: shipment.status,
            pickup_address: pickupAddress,
            delivery_address: order.customer_address,
            estimated_delivery: sizeCategory === "large" ? "3-5 days" : "1-2 days",
          });
        } catch (shipmentErr) {
          console.error("Shipment booking error:", shipmentErr);
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
