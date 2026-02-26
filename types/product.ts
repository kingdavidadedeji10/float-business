export interface ProductVariant {
  name: string;
  options: string[];
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  weight: number | null;
  size_category: 'small' | 'medium' | 'large' | null;
  variants: ProductVariant[] | null;
  created_at: string;
}
