CREATE TABLE availability_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  stock_status TEXT NOT NULL,
  stock_quantity INTEGER,
  price DECIMAL(10,2),
  raw_status_text TEXT,
  checked_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_availability_product_time ON availability_checks(product_id, checked_at DESC);

ALTER TABLE availability_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability checks are public readable" ON availability_checks FOR SELECT USING (true);
CREATE POLICY "Service role can manage checks" ON availability_checks FOR ALL USING (true);
