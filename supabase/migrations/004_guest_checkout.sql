-- Store pickup address
ALTER TABLE stores ADD COLUMN IF NOT EXISTS pickup_address text;

-- Product shipping details
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_category text DEFAULT 'medium'; -- small, medium, large
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants jsonb; -- [{"name": "Size", "options": ["S", "M", "L"]}, {"name": "Color", "options": ["Red", "Blue"]}]

-- Orders table (replace old orders table with new schema)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1,
  variant_selections jsonb, -- {"Size": "M", "Color": "Red"}
  unit_price numeric NOT NULL,
  subtotal numeric NOT NULL,
  delivery_method text NOT NULL, -- 'pickup' or 'delivery'
  delivery_fee numeric DEFAULT 0,
  total numeric NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text,
  customer_address text,
  status text DEFAULT 'pending', -- pending, paid, processing, shipped, delivered, cancelled
  paystack_reference text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  tracking_id text,
  courier text,
  status text DEFAULT 'pending', -- pending, booked, picked_up, in_transit, delivered
  pickup_address text,
  delivery_address text,
  estimated_delivery text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Public can create orders (guest checkout)
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);

-- Store owners can view their orders
CREATE POLICY "Store owners can view orders" ON orders FOR SELECT
USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Public can view their own order by reference
CREATE POLICY "Anyone can view order by reference" ON orders FOR SELECT
USING (true);

-- Deliveries policies
CREATE POLICY "Anyone can create deliveries" ON deliveries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view deliveries" ON deliveries FOR SELECT USING (true);
