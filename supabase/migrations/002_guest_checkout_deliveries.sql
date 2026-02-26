-- Add to products table
ALTER TABLE products ADD COLUMN weight numeric;
ALTER TABLE products ADD COLUMN size_category text CHECK (size_category IN ('small', 'medium', 'large'));
ALTER TABLE products ADD COLUMN variants jsonb;

-- Add pickup address to stores
ALTER TABLE stores ADD COLUMN pickup_address jsonb;

-- Update orders table for guest checkout
ALTER TABLE orders ADD COLUMN buyer_name text;
ALTER TABLE orders ADD COLUMN buyer_phone text;
ALTER TABLE orders ADD COLUMN delivery_type text;
ALTER TABLE orders ADD COLUMN delivery_address jsonb;
ALTER TABLE orders ADD COLUMN quantity integer DEFAULT 1;
ALTER TABLE orders ADD COLUMN selected_variant jsonb;
ALTER TABLE orders ADD COLUMN subtotal numeric;
ALTER TABLE orders ADD COLUMN delivery_fee numeric DEFAULT 0;

-- New deliveries table
CREATE TABLE deliveries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  sendbox_shipment_id text,
  tracking_code text,
  courier_name text,
  delivery_type text,
  delivery_method text,
  origin_address jsonb,
  destination_address jsonb,
  estimated_cost numeric,
  actual_cost numeric,
  status text DEFAULT 'pending',
  status_history jsonb DEFAULT '[]',
  estimated_delivery_date timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read for order tracking
CREATE POLICY "Public can view deliveries by order" ON deliveries
FOR SELECT USING (true);

-- Policy: Service role can manage deliveries
CREATE POLICY "Service role can manage deliveries" ON deliveries
FOR ALL USING (auth.role() = 'service_role');
