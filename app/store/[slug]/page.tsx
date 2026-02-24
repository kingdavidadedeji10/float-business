import { fetchStoreBySlug } from "@/lib/helpers";
import { createServerClient } from "@/lib/supabase";
import ThemeRenderer from "@/components/store/ThemeRenderer";
import { notFound } from "next/navigation";

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let store;
  try {
    store = await fetchStoreBySlug(slug);
  } catch {
    notFound();
  }

  const supabase = createServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  return <ThemeRenderer theme={store.theme_id} store={store} products={products || []} />;
}
