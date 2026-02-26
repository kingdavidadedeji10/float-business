import { createClient } from "@/lib/supabase/server";

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admins")
    .select("id")
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function getStoresPendingPayment() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, slug, bank_name, account_number, account_name, payment_status, owner_id, created_at")
    .eq("payment_status", "submitted")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function approveStorePayment(storeId: string, subaccountCode: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({ subaccount_code: subaccountCode, payment_status: "active" })
    .eq("id", storeId);

  if (error) throw error;
}
