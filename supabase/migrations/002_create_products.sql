CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  external_id TEXT,
  name TEXT NOT NULL,
  normalized_name TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL DEFAULT 'unknown',
  set_name TEXT,
  current_price DECIMAL(10,2),
  current_stock_status TEXT NOT NULL DEFAULT 'unknown',
  current_stock_quantity INTEGER,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  last_in_stock_at TIMESTAMPTZ,
  is_tracked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(shop_id, url)
);

CREATE INDEX idx_products_category ON products(category) WHERE is_tracked = true;
CREATE INDEX idx_products_stock ON products(current_stock_status) WHERE is_tracked = true;
CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_normalized_name ON products(normalized_name);
CREATE INDEX idx_products_tracked ON products(is_tracked, current_stock_status);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are public readable" ON products FOR SELECT USING (true);
CREATE POLICY "Service role can manage products" ON products FOR ALL USING (true);
