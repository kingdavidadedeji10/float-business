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
  metadata?: { store_id?: string; product_id?: string };
  customer?: { email?: string };
  amount?: number;
  reference?: string;
}): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("orders").insert({
    store_id: paymentData.metadata?.store_id,
    product_id: paymentData.metadata?.product_id,
    buyer_email: paymentData.customer?.email,
    amount: (paymentData.amount ?? 0) / 100,
    payment_status: "paid",
  });

  if (error) throw new Error(error.message);
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
