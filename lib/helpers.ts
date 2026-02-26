import { createServerClient } from "./supabase";
import { Store } from "@/types/store";

export async function fetchStoreById(storeId: string): Promise<Store> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (error) throw new Error(error.message);
  return data as Store;
}

export async function fetchStoreBySlug(slug: string): Promise<Store> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) throw new Error(error.message);
  return data as Store;
}

export async function saveOrder(paymentData: {
  metadata?: {
    store_id?: string;
    product_id?: string;
    buyer_name?: string;
    buyer_phone?: string;
    delivery_type?: string;
    delivery_address?: string;
    quantity?: number;
    selected_variant?: string;
    subtotal?: number;
    delivery_fee?: number;
  };
  customer?: { email?: string };
  amount?: number;
  reference?: string;
}): Promise<string> {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("orders").insert({
    store_id: paymentData.metadata?.store_id,
    product_id: paymentData.metadata?.product_id,
    buyer_email: paymentData.customer?.email,
    buyer_name: paymentData.metadata?.buyer_name ?? null,
    buyer_phone: paymentData.metadata?.buyer_phone ?? null,
    amount: (paymentData.amount ?? 0) / 100,
    subtotal: paymentData.metadata?.subtotal ?? null,
    delivery_fee: paymentData.metadata?.delivery_fee ?? 0,
    quantity: paymentData.metadata?.quantity ?? 1,
    selected_variant: paymentData.metadata?.selected_variant
      ? JSON.parse(paymentData.metadata.selected_variant)
      : null,
    delivery_type: paymentData.metadata?.delivery_type ?? null,
    delivery_address: paymentData.metadata?.delivery_address
      ? JSON.parse(paymentData.metadata.delivery_address)
      : null,
    payment_status: "paid",
  }).select("id").single();

  if (error) throw new Error(error.message);
  return (data as { id: string }).id;
}

export async function createDelivery(
  orderId: string,
  shipmentData: {
    sendbox_shipment_id: string;
    tracking_code: string;
    courier_name: string;
    delivery_type: string;
    delivery_method: string;
    origin_address: object;
    destination_address: object;
    estimated_cost: number;
    estimated_delivery_date: string;
  }
): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("deliveries").insert({
    order_id: orderId,
    ...shipmentData,
    status: "pending",
    status_history: [],
  });

  if (error) throw new Error(error.message);
}

export async function updateDeliveryStatus(
  trackingCode: string,
  status: string,
  description?: string
): Promise<void> {
  const supabase = createServerClient();
  const { data: delivery, error: fetchError } = await supabase
    .from("deliveries")
    .select("status_history")
    .eq("tracking_code", trackingCode)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const history = Array.isArray(delivery?.status_history) ? delivery.status_history : [];
  history.push({ status, timestamp: new Date().toISOString(), description });

  const update: Record<string, unknown> = { status, status_history: history };
  if (status === "delivered") {
    update.delivered_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("deliveries")
    .update(update)
    .eq("tracking_code", trackingCode);

  if (error) throw new Error(error.message);
}

export async function getOrderWithDelivery(orderId: string) {
  const supabase = createServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError) throw new Error(orderError.message);

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("*")
    .eq("order_id", orderId)
    .single();

  return { order, delivery };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
