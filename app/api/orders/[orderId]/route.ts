import { NextRequest, NextResponse } from "next/server";
import { getOrderWithDelivery } from "@/lib/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const result = await getOrderWithDelivery(orderId);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Order fetch error:", message);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
}
