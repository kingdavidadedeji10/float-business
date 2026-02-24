export interface Order {
  id: string;
  store_id: string;
  product_id: string;
  buyer_email: string;
  amount: number;
  payment_status: string;
  created_at: string;
}
