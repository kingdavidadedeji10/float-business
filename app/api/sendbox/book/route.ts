import { NextRequest, NextResponse } from "next/server";
import { bookSendboxShipment } from "@/lib/sendbox";
import { createDelivery } from "@/lib/helpers";

export async function POST(req: NextRequest) {
  try {
    const {
      order_id,
      origin_address,
      destination_address,
      weight,
      size_category,
      sender_name,
      sender_phone,
      receiver_name,
      receiver_phone,
      receiver_email,
      item_description,
    } = await req.json();

    if (!order_id || !origin_address || !destination_address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const shipment = await bookSendboxShipment({
      origin_address,
      destination_address,
      weight,
      size_category,
      sender_name,
      sender_phone,
      receiver_name,
      receiver_phone,
      receiver_email,
      item_description,
    });

    await createDelivery(order_id, {
      sendbox_shipment_id: shipment.shipment_id,
      tracking_code: shipment.tracking_code,
      courier_name: shipment.courier_name,
      delivery_type: "delivery",
      delivery_method: size_category === "large" || origin_address.state !== destination_address.state ? "van" : "motorcycle",
      origin_address,
      destination_address,
      estimated_cost: 0,
      estimated_delivery_date: shipment.estimated_delivery_date,
    });

    return NextResponse.json(shipment);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sendbox booking error:", message);
    return NextResponse.json({ error: "Failed to book shipment" }, { status: 500 });
  }
}
