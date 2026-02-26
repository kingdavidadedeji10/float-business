import { Address } from './delivery';

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  theme_id: string;
  subaccount_code: string | null;
  pickup_address: Address | null;
  created_at: string;
}
