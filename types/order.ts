export interface Order {
  id: string;
  store_id: string;
  product_id: string | null;
  quantity: number;
  variant_selections: Record<string, string> | null;
  unit_price: number;
  subtotal: number;
  delivery_method: string;
  delivery_fee: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  customer_city: string | null;
  customer_state: string | null;
  customer_postal_code: string | null;
  customer_landmark: string | null;
  status: string;
  paystack_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  tracking_id: string | null;
  courier: string | null;
  status: string;
  pickup_address: string | null;
  delivery_address: string | null;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
}
