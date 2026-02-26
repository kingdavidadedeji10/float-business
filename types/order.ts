import { Address } from './delivery';

export interface Order {
  id: string;
  store_id: string;
  product_id: string;
  buyer_email: string;
  buyer_name: string | null;
  buyer_phone: string | null;
  amount: number;
  subtotal: number | null;
  delivery_fee: number;
  quantity: number;
  selected_variant: Record<string, string> | null;
  delivery_type: 'pickup' | 'delivery' | null;
  delivery_address: Address | null;
  payment_status: string;
  created_at: string;
}
