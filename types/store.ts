export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  theme_id: string;
  subaccount_code: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  payment_status: 'pending' | 'submitted' | 'active' | null;
  created_at: string;
}
