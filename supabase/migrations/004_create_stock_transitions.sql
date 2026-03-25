CREATE TABLE stock_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  previous_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  transitioned_at TIMESTAMPTZ DEFAULT now(),
  notification_sent BOOLEAN DEFAULT false
);

CREATE INDEX idx_transitions_pending ON stock_transitions(notification_sent) WHERE notification_sent = false;
CREATE INDEX idx_transitions_product ON stock_transitions(product_id, transitioned_at DESC);
CREATE INDEX idx_transitions_restocks ON stock_transitions(transitioned_at DESC) WHERE new_status = 'in_stock';

ALTER TABLE stock_transitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transitions are public readable" ON stock_transitions FOR SELECT USING (true);
CREATE POLICY "Service role can manage transitions" ON stock_transitions FOR ALL USING (true);
