import { NextRequest, NextResponse } from "next/server";
import { getSendboxQuote } from "@/lib/sendbox";

export async function POST(req: NextRequest) {
  try {
    const { origin_address, destination_address, weight, size_category } = await req.json();

    if (!origin_address || !destination_address || !weight || !size_category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await getSendboxQuote({
      origin_address,
      destination_address,
      weight,
      size_category,
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sendbox quote error:", message);
    return NextResponse.json({ error: "Failed to get delivery quote" }, { status: 500 });
  }
}
