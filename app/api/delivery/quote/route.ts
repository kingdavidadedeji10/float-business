import { NextRequest, NextResponse } from "next/server";
import { getDeliveryQuote } from "@/lib/sendbox";

export async function POST(req: NextRequest) {
  try {
    const { sizeCategory, weight, pickupAddress, deliveryAddress } = await req.json();

    if (!pickupAddress || !deliveryAddress) {
      return NextResponse.json({ error: "Missing addresses" }, { status: 400 });
    }

    const quote = await getDeliveryQuote(
      sizeCategory || "medium",
      weight || 1,
      pickupAddress,
      deliveryAddress
    );

    return NextResponse.json(quote);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Delivery quote error:", message);
    return NextResponse.json({ error: "Failed to get delivery quote" }, { status: 500 });
  }
}
