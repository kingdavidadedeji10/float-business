import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "@/lib/paystack";
import { fetchStoreById } from "@/lib/helpers";

export async function POST(req: NextRequest) {
  try {
    const { email, amount, storeId } = await req.json();

    const store = await fetchStoreById(storeId);
    const subaccount = store.subaccount_code;

    const payment = await createPayment({ email, amount, subaccount });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json({ error: "Payment initialization failed" }, { status: 500 });
  }
}
