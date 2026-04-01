export const SHOPS_CONFIG = [
  {
    name: 'Nekonečno',
    slug: 'nekonecno',
    base_url: 'https://www.nekonecno.sk',
    scrape_url: 'https://www.nekonecno.sk/pokemon-tcg/',
    scraper_type: 'html' as const,
  },
  {
    name: 'Xzone',
    slug: 'xzone',
    base_url: 'https://www.xzone.sk',
    scrape_url: 'https://www.xzone.sk/katalog.php?term=pokemon+tcg&s=60',
    scraper_type: 'html' as const,
  },
  {
    name: 'iHrysko',
    slug: 'ihrysko',
    base_url: 'https://www.ihrysko.sk',
    scrape_url: 'https://www.ihrysko.sk/vyhladavanie?search=pokemon+tcg',
    scraper_type: 'html' as const,
  },
  {
    name: 'Dráčik',
    slug: 'dracik',
    base_url: 'https://www.dracik.sk',
    scrape_url: 'https://www.dracik.sk/pokemon-1076/',
    scraper_type: 'dataLayer' as const,
  },
  {
    name: 'Pompo SK',
    slug: 'pomposk',
    base_url: 'https://www.pompo.sk',
    scrape_url: 'https://www.pompo.sk/pokemon-tcg',
    scraper_type: 'html' as const,
  },
  {
    name: 'Pompo CZ',
    slug: 'pompocz',
    base_url: 'https://www.pompo.cz',
    scrape_url: 'https://www.pompo.cz/pokemon-tcg',
    scraper_type: 'html' as const,
  },
  {
    name: 'Bambule',
    slug: 'bambule',
    base_url: 'https://www.bambule.cz',
    scrape_url: 'https://www.bambule.cz/pokemon-tcg',
    scraper_type: 'html' as const,
  },
  {
    name: 'Knihy Dobrovský',
    slug: 'knihydobrovsky',
    base_url: 'https://knihydobrovsky.cz',
    scrape_url: 'https://knihydobrovsky.cz/pokemon-tcg',
    scraper_type: 'html' as const,
  },
  {
    name: 'Brloh',
    slug: 'brloh',
    base_url: 'https://www.brloh.sk',
    scrape_url: 'https://www.brloh.sk/pokemon-c1781',
    scraper_type: 'puppeteer' as const,
  },
  {
    name: 'Smarty',
    slug: 'smarty',
    base_url: 'https://www.smarty.sk',
    scrape_url: 'https://www.smarty.sk/Vyrobce/pokemon-company',
    scraper_type: 'puppeteer' as const,
  },
  {
    name: 'Alza',
    slug: 'alza',
    base_url: 'https://www.alza.sk',
    scrape_url: 'https://www.alza.sk/search.htm?exps=pokemon+tcg',
    scraper_type: 'puppeteer' as const,
  },
] as const

export const CATEGORY_LABELS: Record<string, string> = {
  etb: 'Elite Trainer Box',
  booster_box: 'Booster Box',
  booster_pack: 'Booster Pack',
  booster_bundle: 'Booster Bundle',
  collection_box: 'Collection Box',
  unknown: 'Ostatné',
  excluded: 'Vylúčené',
}

export const STOCK_STATUS_LABELS: Record<string, string> = {
  in_stock: 'Skladom',
  out_of_stock: 'Vypredané',
  preorder: 'Predobjednávka',
  unknown: 'Neznámy',
}

export const CATEGORY_COLORS: Record<string, string> = {
  etb: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  booster_box: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  booster_pack: 'bg-green-500/20 text-green-400 border-green-500/30',
  booster_bundle: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  collection_box: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

export const SCRAPE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'sk-SK,sk;q=0.9,cs;q=0.8,en;q=0.7',
}

export const KNOWN_SETS = [
  'Prismatic Evolutions',
  'Surging Sparks',
  'Stellar Crown',
  'Shrouded Fable',
  'Twilight Masquerade',
  'Temporal Forces',
  'Paldean Fates',
  'Paradox Rift',
  'Obsidian Flames',
  'Paldea Evolved',
  'Scarlet & Violet',
  'Crown Zenith',
  'Silver Tempest',
  'Lost Origin',
  'Astral Radiance',
  'Brilliant Stars',
  'Fusion Strike',
  'Evolving Skies',
  'Chilling Reign',
  'Battle Styles',
  'Shining Fates',
  'Vivid Voltage',
  'Champions Path',
  'Darkness Ablaze',
  'Rebel Clash',
  'Sword & Shield',
  '151',
  'Journey Together',
  'Destined Rivals',
]
