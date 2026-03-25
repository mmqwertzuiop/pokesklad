CREATE TABLE scrape_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shops(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  products_found INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  new_restocks INTEGER DEFAULT 0,
  errors TEXT[],
  duration_ms INTEGER
);

CREATE INDEX idx_scrape_logs_shop ON scrape_logs(shop_id, started_at DESC);

ALTER TABLE scrape_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scrape logs are public readable" ON scrape_logs FOR SELECT USING (true);
CREATE POLICY "Service role can manage logs" ON scrape_logs FOR ALL USING (true);
