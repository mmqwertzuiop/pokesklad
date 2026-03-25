CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  base_url TEXT NOT NULL,
  scrape_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  scraper_type TEXT NOT NULL DEFAULT 'html',
  last_scrape_at TIMESTAMPTZ,
  last_scrape_status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shops are public readable" ON shops FOR SELECT USING (true);

INSERT INTO shops (name, slug, base_url, scrape_url, scraper_type) VALUES
('Nekonečno', 'nekonecno', 'https://www.nekonecno.sk', 'https://www.nekonecno.sk/pokemon-tcg/', 'html'),
('Xzone', 'xzone', 'https://www.xzone.sk', 'https://www.xzone.sk/katalog.php?term=pokemon+tcg&s=60', 'html'),
('iHrysko', 'ihrysko', 'https://www.ihrysko.sk', 'https://www.ihrysko.sk/vyhladavanie?search=pokemon+tcg', 'html'),
('Dráčik', 'dracik', 'https://www.dracik.sk', 'https://www.dracik.sk/pokemon-1076/', 'dataLayer');
