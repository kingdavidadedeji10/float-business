import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { createPayment } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const {
      productId,
      storeId,
      quantity,
      variantSelections,
      deliveryMethod,
      deliveryFee,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
    } = await req.json();

    if (!productId || !storeId || !quantity || !customerName || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Validate product exists
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("store_id", storeId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch store for subaccount
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single();

    if (storeError || !store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const unitPrice = product.price;
    const subtotal = unitPrice * quantity;
    const fee = deliveryMethod === "delivery" ? (deliveryFee ?? 0) : 0;
    const total = subtotal + fee;

    // Create pending order in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        store_id: storeId,
        product_id: productId,
        quantity,
        variant_selections: variantSelections || null,
        unit_price: unitPrice,
        subtotal,
        delivery_method: deliveryMethod,
        delivery_fee: fee,
        total,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        customer_address: customerAddress || null,
        status: "pending",
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError?.message);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Initialize Paystack payment
    const email = customerEmail || `${customerPhone}@guest.floatbusiness.com`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`;
    const payment = await createPayment({
      email,
      amount: total,
      subaccount: store.subaccount_code || null,
      metadata: { order_id: order.id },
      callbackUrl: `${baseUrl}/order/${order.id}`,
    });

    // Save reference to order
    await supabase
      .from("orders")
      .update({ paystack_reference: payment.data.reference })
      .eq("id", order.id);

    return NextResponse.json({
      authorization_url: payment.data.authorization_url,
      reference: payment.data.reference,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Checkout error:", message);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
