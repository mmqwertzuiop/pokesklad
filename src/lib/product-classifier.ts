import type { ProductCategory } from '@/types/product'
import { KNOWN_SETS } from './constants'

const EXCLUDED_KEYWORDS = [
  'plyšov', 'plush', 'plysov',
  'figúrk', 'figurk', 'figure', 'figurín',
  'tričk', 'trick', 't-shirt', 'tshirt',
  'mikin', 'hoodie', 'sweatshirt',
  'batoh', 'backpack', 'ruksak',
  'peňaženk', 'penazenk', 'wallet',
  'puzzle',
  'kľúčenk', 'klucenk', 'keychain',
  'hrnček', 'hrncek', 'mug',
  'vankúš', 'vankus', 'pillow',
  'ponožk', 'ponozk', 'socks',
  'čiapk', 'ciapk', 'cap', 'hat',
  'deka', 'blanket',
  'obliečk', 'obliecka',
  'obal na karty', 'sleeve', 'toploader',
  'deck box', 'deckbox',
  'portfolio', 'album na karty',
  'ultra pro',
  'playmat', 'herná podložka', 'podlozka',
  'coin', 'minca',
  'dice', 'kocka',
  'kniha', 'book',
  'dvd', 'blu-ray',
  'switch', 'nintendo', 'ps4', 'ps5', 'xbox',
  'lego',
  'funko',
  'pokéball', 'pokeball',
  'svietiaca', 'lamp',
  'šál', 'scarf',
  'obrázok', 'poster',
  'nálepk', 'sticker',
  'gumička', 'eraser',
  'perečník', 'pencil case',
  'fľaša', 'bottle',
  'taška', 'bag',
]

interface CategoryRule {
  category: ProductCategory
  include: string[]
  exclude: string[]
}

const CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'etb',
    include: ['elite trainer box', 'etb', 'elite trénerský', 'elite trenersky'],
    exclude: [],
  },
  {
    category: 'booster_bundle',
    include: ['booster bundle', 'bundle 6', '6 pack bundle'],
    exclude: [],
  },
  {
    category: 'booster_box',
    include: ['booster box', 'booster display', 'display 36', '36 booster', '36 pack'],
    exclude: ['bundle'],
  },
  {
    category: 'booster_pack',
    include: ['booster pack', 'booster balíček', 'booster balicek', 'sleeved booster', 'booster 1 ks', 'single booster'],
    exclude: ['box', 'bundle', 'display'],
  },
  {
    category: 'collection_box',
    include: [
      'collection box', 'kolekcia', 'premium collection',
      'special collection', ' tin ', 'tin box',
      'v box', 'vmax box', 'vstar box', 'ex box',
      'gx box', 'premium box',
      'special illustration', 'poster collection',
      'binder collection', 'tech sticker',
      'surprise box', 'mini tin',
      'lunchbox', 'collectors chest',
      'premium figure', 'premium figure collection',
    ],
    exclude: [],
  },
]

export function classifyProduct(name: string): ProductCategory {
  const lower = name.toLowerCase()

  // Check exclusions first
  for (const keyword of EXCLUDED_KEYWORDS) {
    if (lower.includes(keyword.toLowerCase())) {
      return 'excluded'
    }
  }

  // Check category rules
  for (const rule of CATEGORY_RULES) {
    const matchesInclude = rule.include.some((kw) => lower.includes(kw))
    const matchesExclude = rule.exclude.some((kw) => lower.includes(kw))

    if (matchesInclude && !matchesExclude) {
      return rule.category
    }
  }

  // If it contains "pokemon" or "pokémon" but wasn't classified, mark unknown
  if (lower.includes('pokemon') || lower.includes('pokémon')) {
    return 'unknown'
  }

  return 'excluded'
}

export function extractSetName(name: string): string | null {
  const lower = name.toLowerCase()

  for (const set of KNOWN_SETS) {
    if (lower.includes(set.toLowerCase())) {
      return set
    }
  }

  return null
}

export function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .replace(/pokémon/g, 'pokemon')
    .replace(/pokemon\s*tcg:?\s*/g, '')
    .replace(/\s*-\s*/g, ' ')
    .replace(/[()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
