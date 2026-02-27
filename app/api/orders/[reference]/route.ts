import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const supabase = createServerClient();

    // Try lookup by paystack_reference first, then by order ID
    let order = null;
    const { data: byRef } = await supabase
      .from("orders")
      .select("*")
      .eq("paystack_reference", reference)
      .single();

    if (byRef) {
      order = byRef;
    } else {
      const { data: byId } = await supabase
        .from("orders")
        .select("*")
        .eq("id", reference)
        .single();
      order = byId;
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Fetch delivery info if applicable
    let delivery = null;
    if (order.delivery_method === "delivery") {
      const { data } = await supabase
        .from("deliveries")
        .select("*")
        .eq("order_id", order.id)
        .single();
      delivery = data;
    }

    // Fetch product info
    let product = null;
    if (order.product_id) {
      const { data } = await supabase
        .from("products")
        .select("name, image_url, price")
        .eq("id", order.product_id)
        .single();
      product = data;
    }

    // Fetch store info
    const { data: store } = await supabase
      .from("stores")
      .select("name, slug")
      .eq("id", order.store_id)
      .single();

    return NextResponse.json({ order, delivery, product, store });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Order fetch error:", message);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
