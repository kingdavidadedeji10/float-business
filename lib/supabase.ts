import { createClient as createBrowserClient } from './supabase/client'
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Legacy export for backwards compatibility
export const supabase = createBrowserClient()

export function createServerClient() {
  // This should only be used in API routes
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
