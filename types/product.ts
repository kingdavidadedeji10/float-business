export interface Product {
  id: string;
  store_id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  created_at: string;
}
