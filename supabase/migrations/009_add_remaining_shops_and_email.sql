-- Add 7 missing shops
INSERT INTO shops (name, slug, base_url, scrape_url, scraper_type) VALUES
('Pompo SK', 'pomposk', 'https://www.pompo.sk', 'https://www.pompo.sk/pokemon-tcg', 'html'),
('Pompo CZ', 'pompocz', 'https://www.pompo.cz', 'https://www.pompo.cz/pokemon-tcg', 'html'),
('Bambule', 'bambule', 'https://www.bambule.cz', 'https://www.bambule.cz/pokemon-tcg', 'html'),
('Knihy Dobrovský', 'knihydobrovsky', 'https://knihydobrovsky.cz', 'https://knihydobrovsky.cz/pokemon-tcg', 'html'),
('Brloh', 'brloh', 'https://www.brloh.sk', 'https://www.brloh.sk/pokemon-c1781', 'puppeteer'),
('Smarty', 'smarty', 'https://www.smarty.sk', 'https://www.smarty.sk/Vyrobce/pokemon-company', 'puppeteer'),
('Alza', 'alza', 'https://www.alza.sk', 'https://www.alza.sk/search.htm?exps=pokemon+tcg', 'puppeteer');

-- Add email notification columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notify_price_drop BOOLEAN DEFAULT true;
