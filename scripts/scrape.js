const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'sk-SK,sk;q=0.9,cs;q=0.8',
};
const delay = ms => new Promise(r => setTimeout(r, ms));
const CZK_EUR = 0.04;

// ─── Product classifier ───────────────────────────────────────────
// STRICT: Only sealed TCG products pass through.
// Checks for both 'pokemon' AND 'pokémon' (accented).
// Does NOT exclude 'kartová' or 'herná podložka' — those are legitimate product name parts.
const EXCL = [
  // Accessories
  'album','binder','sleeve','toploader','deck box','ultra pro','playmat','podlozka',
  'obal','ochranné','protective','card sleeves','na karty','display case',
  // Toys/merch
  'plyšov','plush','figúrk','figurk','tričk','t-shirt','mikin','hoodie','batoh','backpack',
  'wallet','peňaženk','puzzle','keychain','kľúčenk','mug','hrnček','hrncek','pillow','vankúš',
  'socks','ponožk','cap','čiapk','blanket','deka','lamp','poster','sticker','nálepk',
  'bottle','fľaša','bag','taška','eraser','pencil','gumička','peračník','pero ','notes','zápisník',
  'pokeball','funko','lego','mega construx',
  // Non-TCG Pokemon
  'nintendo','switch','ps4','ps5','xbox','dvd','book','kniha','kocky','dice','coin','minca',
  'energy card','nákupná','shopping',
  // Graded/special
  'acrylic','graded','psa ','bgs ','cgc ','jumbo','oversized','promo card',
  // Non-sealed TCG
  'pin ','trainer toolkit','build & battle','league battle','battle academy','my first battle',
  'ex battle deck','battle deck','adventní','adventný','advent calendar',
  'poškoz','damaged','second quality',
];

function classify(name) {
  const l = name.toLowerCase();
  // Must contain pokemon or pokémon (accented)
  if (!l.includes('pokemon') && !l.includes('pokémon')) return null;
  for (const k of EXCL) if (l.includes(k)) return null;
  if (l.includes('elite trainer box') || /\betb\b/.test(l)) return 'etb';
  if (l.includes('booster bundle')) return 'booster_bundle';
  if ((l.includes('booster box') || l.includes('booster display')) && !l.includes('bundle')) return 'booster_box';
  if (l.includes('booster') && !l.includes('box') && !l.includes('bundle') && !l.includes('display')) return 'booster_pack';
  if (l.includes('collection') || l.includes('kolekcia') || l.match(/\btin\b/) || l.includes('mini tin')
    || l.includes('blister') || l.includes('special') || l.includes('premium')
    || l.includes('chest') || l.includes('ex box') || l.match(/\bbox\b/)) return 'collection_box';
  return null; // STRICT: if we can't categorize it, skip it
}

// ─── Name cleaning ────────────────────────────────────────────────
// Removes: "Kartová hra" prefix, "Novinka" prefix, percentage discounts,
// "Skladom online", whitespace garbage, leading numbers
function cleanName(raw) {
  if (!raw) return '';
  let n = raw;
  // Remove common garbage tokens
  n = n.replace(/Novinka\s*/gi, '');
  n = n.replace(/Kartová\s+hra\s*/gi, '');
  n = n.replace(/Herná\s+podložka\s*/gi, '');
  n = n.replace(/-?\d+\s*%/g, '');              // percentage discounts like "-20%"
  n = n.replace(/Skladom\s+online/gi, '');
  n = n.replace(/Skladem\s+online/gi, '');
  n = n.replace(/Nedostupné/gi, '');
  n = n.replace(/Vypredané/gi, '');
  n = n.replace(/Vyprodáno/gi, '');
  n = n.replace(/Vyprodané/gi, '');
  n = n.replace(/DMOC\s*[\d,.\s]*€/gi, '');     // "DMOC 49,99 €" price labels
  n = n.replace(/[\d,.\s]+€/g, '');              // leftover EUR prices in name
  n = n.replace(/[\d\s]+Kč/g, '');               // leftover CZK prices in name
  n = n.replace(/\s+/g, ' ');
  n = n.replace(/^\d+\s*/, '');                   // leading numbers
  return n.trim();
}

// ─── Price parsing ────────────────────────────────────────────────
function parseP(t, czk) {
  if (!t) return null;
  const c = t.replace(/\s/g, '').replace(/[^\d,.\-]/g, '').replace(',', '.');
  const n = parseFloat(c);
  if (isNaN(n) || n === 0) return null;
  return czk ? Math.round(n * CZK_EUR * 100) / 100 : n;
}

// ─── Stock status detection ───────────────────────────────────────
function stk(t) {
  const l = (t || '').toLowerCase();
  if (l.includes('ihneď') || l.includes('ihned') || l.includes('skladom') || l.includes('skladem')
    || l.includes('na sklade') || l.includes('odosielame') || l.includes('posledn')
    || l.includes('> 5') || l.includes('>5'))
    { const m = t.match(/(\d+)\s*ks/i); return { s: 'in_stock', q: m ? parseInt(m[1]) : null }; }
  if (l.includes('na ceste') || l.includes('očakávame') || l.includes('předobjed') || l.includes('predobjed')
    || l.includes('pripravujeme')) return { s: 'preorder', q: null };
  if (l.includes('nedostupn') || l.includes('vypredané') || l.includes('vypredane') || l.includes('vyprodáno')
    || l.includes('vyprodané') || l.includes('nie je') || l.includes('objednáme') || l.includes('dlhodobo')
    || l.includes('momentálne') || l.includes('sold out') || l.includes('skončil') || l.includes('strážiť'))
    return { s: 'out_of_stock', q: null };
  return { s: 'unknown', q: null };
}

function resolveUrl(href, base) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  if (href.startsWith('//')) return 'https:' + href;
  return base + (href.startsWith('/') ? '' : '/') + href;
}

// ─── Fetch og:image from a product detail page ───────────────────
async function fetchOgImage(url) {
  try {
    const r = await fetch(url, { headers: H });
    if (!r.ok) return null;
    const $ = cheerio.load(await r.text());
    const img = $('meta[property="og:image"]').attr('content');
    if (img && !img.includes('data:') && !img.includes('svg+xml')) return img;
  } catch {}
  return null;
}

// ═══════════════════════════════════════════════════════════════════
// SCRAPERS
// ═══════════════════════════════════════════════════════════════════

// ===== NEKONEČNO (SK, EUR) =====
async function scrapeNekonecno(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 12; pg++) {
    const url = pg === 1
      ? 'https://www.nekonecno.sk/pokemon-tcg/'
      : `https://www.nekonecno.sk/pokemon-tcg/strana-${pg}/`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) break;
    const $ = cheerio.load(await res.text());
    let f = 0;
    $('.product').each((_, el) => {
      const e = $(el);
      const name = cleanName(e.find('[data-testid="productCardName"]').first().text());
      const href = e.find('a.name, a.image').first().attr('href');
      if (!name || !href) return;
      const cat = classify(name);
      if (!cat) return;
      let img = e.find('.p a.image img').attr('src')
        || e.find('img').first().attr('data-src')
        || e.find('img').first().attr('src');
      if (img && (img.includes('data:') || img.includes('svg+xml'))) img = null;
      const price = parseP(
        e.find('.price-final strong').text() || e.find('.prices strong').first().text(),
        false
      );
      const { s, q } = stk(e.find('.availability').text());
      prods.push({
        shop_id: shopId, name, url: 'https://www.nekonecno.sk' + href,
        image_url: img || null, category: cat,
        current_price: price, current_stock_status: s, current_stock_quantity: q,
      });
      f++;
    });
    if (f === 0 && pg > 1) break;
    await delay(1500);
  }
  return prods;
}

// ===== IHRYSKO (SK, EUR) =====
async function scrapeIhrysko(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 20; pg++) {
    const url = `https://www.ihrysko.sk/vyhladavanie?search=pokemon+tcg&page=${pg}`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) break;
    const $ = cheerio.load(await res.text());
    let f = 0;
    $('.product-thumb').each((_, el) => {
      const e = $(el);
      const name = cleanName(e.find('.product-thumb__name').text());
      const href = e.find('.product-thumb__name a').attr('href');
      if (!name || !href) return;
      const cat = classify(name);
      if (!cat) return;
      // iHrysko uses data-src with // prefix
      let img = e.find('.product-thumb__img img').attr('data-src') || null;
      if (img) img = resolveUrl(img, 'https://www.ihrysko.sk');
      if (img && (img.includes('loading') || img.includes('data:'))) img = null;
      const price = parseP(
        e.find('.product-thumb__price .actual-price, .product-thumb__price').first().text(),
        false
      );
      const { s, q } = stk(e.find('.product-thumb__availability').first().text());
      prods.push({
        shop_id: shopId, name, url: href, image_url: img,
        category: cat, current_price: price,
        current_stock_status: s, current_stock_quantity: q,
      });
      f++;
    });
    if (f === 0 && pg > 1) break;
    await delay(2000);
  }
  return prods;
}

// ===== XZONE (SK, EUR) =====
async function scrapeXzone(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 8; pg++) {
    const url = `https://www.xzone.sk/katalog.php?term=pokemon+tcg&s=60&page=${pg}`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) break;
    const $ = cheerio.load(await res.text());
    let f = 0;
    $('.item-wrapper').each((_, el) => {
      const e = $(el);
      const link = e.find('a[title]').first();
      const name = cleanName(link.attr('title') || e.find('.item-title').text());
      const href = link.attr('href');
      if (!name || !href || name.length < 5) return;
      const cat = classify(name);
      if (!cat) return;
      const img = e.find('img').first().attr('src');
      const price = parseP(e.find('.price').first().text(), false);
      const { s, q } = stk(e.find('.expedice-date').text());
      prods.push({
        shop_id: shopId, name, url: href, image_url: img || null,
        category: cat, current_price: price,
        current_stock_status: s, current_stock_quantity: q,
      });
      f++;
    });
    if (f === 0 && pg > 1) break;
    await delay(1500);
  }
  return prods;
}

// ===== DRÁČIK (SK, EUR) =====
async function scrapeDracik(shopId) {
  const prods = [];
  const res = await fetch('https://www.dracik.sk/pokemon-1076/', { headers: H });
  if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('.ProductCard').each((_, el) => {
    const e = $(el);
    const name = cleanName(e.find('[class*="Name"], h2, h3').first().text());
    const href = e.find('a').first().attr('href');
    if (!name || !href) return;
    const cat = classify(name);
    if (!cat) return;
    const imgSrc = e.find('img').first().attr('src');
    const img = imgSrc ? resolveUrl(imgSrc, 'https://www.dracik.sk') : null;
    const price = parseP(e.find('[class*="rice"]').first().text(), false);
    const { s, q } = stk(e.find('[class*="tock"], [class*="vail"]').first().text());
    prods.push({
      shop_id: shopId, name,
      url: resolveUrl(href, 'https://www.dracik.sk'),
      image_url: img, category: cat,
      current_price: price, current_stock_status: s, current_stock_quantity: q,
    });
  });
  return prods;
}

// ===== POMPO SK (SK, EUR) =====
// Product names come from link text — cleaned of "Novinka", percentage discounts,
// "Skladom online", prices, etc. Stock detected from text: "Skladom online" = in_stock,
// "Nedostupné"/"Vypredané" = out_of_stock. Price from last EUR match in text.
async function scrapePompoSk(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.pompo.sk/pokemon-tcg', { headers: H });
  if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('a[href*="pokemon"][href*="_z"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    if (!href) return;
    const fullUrl = resolveUrl(href, 'https://www.pompo.sk');
    if (seen.has(fullUrl)) return;
    seen.add(fullUrl);

    // The link text contains name + garbage — clean it
    const rawText = a.text();
    const name = cleanName(rawText);
    if (!name || name.length < 5) return;
    const cat = classify(name);
    if (!cat) return;

    // Image from closest catalog container or the link itself
    const parent = a.closest('.catalog-outer, .catalog, [class*="product"], li, div');
    const img = parent.find('img').first().attr('src') || a.find('img').first().attr('src') || null;

    // Price: last EUR match in the parent/link text block
    const textBlock = parent.length ? parent.text() : rawText;
    const allPrices = textBlock.match(/[\d,]+\s*€/g) || [];
    const price = allPrices.length > 0 ? parseP(allPrices[allPrices.length - 1], false) : null;

    // Stock: detect from text containing "Skladom online" vs "Nedostupné"/"Vypredané"
    const lt = textBlock.toLowerCase();
    let stockStatus = 'out_of_stock';
    if (lt.includes('skladom online') || lt.includes('skladem online')) {
      stockStatus = 'in_stock';
    } else if (lt.includes('nedostupn') || lt.includes('vypredané') || lt.includes('vypredane')) {
      stockStatus = 'out_of_stock';
    }

    prods.push({
      shop_id: shopId, name, url: fullUrl, image_url: img,
      category: cat, current_price: price,
      current_stock_status: stockStatus, current_stock_quantity: null,
    });
  });
  return prods;
}

// ===== POMPO CZ (CZ, CZK -> EUR) =====
// Same as Pompo SK but with CZK prices converted to EUR.
async function scrapePompoCz(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.pompo.cz/pokemon-tcg', { headers: H });
  if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('a[href*="pokemon"][href*="_z"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    if (!href) return;
    const fullUrl = resolveUrl(href, 'https://www.pompo.cz');
    if (seen.has(fullUrl)) return;
    seen.add(fullUrl);

    const rawText = a.text();
    const name = cleanName(rawText);
    if (!name || name.length < 5) return;
    const cat = classify(name);
    if (!cat) return;

    const parent = a.closest('.catalog-outer, .catalog, [class*="product"], li, div');
    const img = parent.find('img').first().attr('src') || a.find('img').first().attr('src') || null;

    // Price: last CZK match in text -> convert to EUR
    const textBlock = parent.length ? parent.text() : rawText;
    const allPrices = textBlock.match(/[\d\s]+\s*Kč/g) || [];
    const price = allPrices.length > 0 ? parseP(allPrices[allPrices.length - 1], true) : null;

    const lt = textBlock.toLowerCase();
    let stockStatus = 'out_of_stock';
    if (lt.includes('skladom online') || lt.includes('skladem online')) {
      stockStatus = 'in_stock';
    } else if (lt.includes('nedostupn') || lt.includes('vyprodáno') || lt.includes('vyprodané')) {
      stockStatus = 'out_of_stock';
    }

    prods.push({
      shop_id: shopId, name, url: fullUrl, image_url: img,
      category: cat, current_price: price,
      current_stock_status: stockStatus, current_stock_quantity: null,
    });
  });
  return prods;
}

// ===== BAMBULE (CZ, CZK -> EUR) =====
async function scrapeBambule(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.bambule.cz/pokemon-tcg', { headers: H });
  if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('[class*="ProductCard"]').each((_, el) => {
    const e = $(el);
    const link = e.find('[class*="title"] a').first();
    const href = link.attr('href');
    const name = cleanName(link.text());
    if (!name || !href) return;
    const fullUrl = 'https://www.bambule.cz' + href;
    if (seen.has(fullUrl)) return;
    seen.add(fullUrl);
    const cat = classify(name);
    if (!cat) return;
    // Images from srcset: pick the largest
    const srcset = e.find('img').first().attr('srcset') || '';
    const srcs = srcset.split(',').map(s => s.trim().split(' ')[0]).filter(s => s && !s.includes('data:'));
    const img = srcs.length > 0 ? srcs[srcs.length - 1] : null;
    const price = parseP(e.find('[class*="Price"]').first().text(), true);
    const { s, q } = stk(e.find('[class*="Stock"]').first().text());
    prods.push({
      shop_id: shopId, name, url: fullUrl, image_url: img,
      category: cat, current_price: price,
      current_stock_status: s, current_stock_quantity: q,
    });
  });
  return prods;
}

// ===== KNIHY DOBROVSKY (CZ, CZK -> EUR) =====
async function scrapeKnihy(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://knihydobrovsky.cz/pokemon-tcg', { headers: H });
  if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('a[href*="/hra/pokemon"], a[href*="/hra/Pok"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    if (!href) return;
    const fullUrl = resolveUrl(href, 'https://knihydobrovsky.cz');
    if (seen.has(fullUrl)) return;
    seen.add(fullUrl);
    const parent = a.closest('li, [class*="product"], [class*="item"]');
    const name = cleanName(parent.find('h3').text() || a.text());
    if (!name || name.length < 5) return;
    const cat = classify(name);
    if (!cat) return;
    const imgSrc = parent.find('img').first().attr('src');
    const img = imgSrc ? resolveUrl(imgSrc, 'https://knihydobrovsky.cz') : null;
    // Price from "X Kč" pattern (CZK -> EUR)
    const priceMatch = parent.text().match(/(\d[\d\s]*)\s*Kč/);
    const price = priceMatch ? parseP(priceMatch[1], true) : null;
    const hasCart = parent.text().includes('Do košíku');
    const hasSupplier = parent.text().includes('dodavatele');
    prods.push({
      shop_id: shopId, name, url: fullUrl, image_url: img,
      category: cat, current_price: price,
      current_stock_status: hasCart ? 'in_stock' : (hasSupplier ? 'preorder' : 'out_of_stock'),
      current_stock_quantity: null,
    });
  });
  return prods;
}

// ===== BRLOH (SK, EUR) - Puppeteer required =====
async function scrapeBrloh(shopId) {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { console.log('  Puppeteer not available, skipping Brloh'); return []; }
  const prods = [];
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent(H['User-Agent']);
  try {
    await page.goto('https://www.brloh.sk/pokemon-c1781', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(5000);
    const rawProducts = await page.evaluate(() => {
      const results = [];
      // Try multiple selectors for Brloh's layout
      const containers = document.querySelectorAll('.box.browsingitem, [class*="product"], .item');
      containers.forEach(el => {
        if (!el.querySelector('img') || !el.querySelector('a')) return;
        const text = el.textContent || '';
        if (!text.includes('€')) return;
        const nameEl = el.querySelector('h2, h3, h4, [class*="name"], [class*="title"]') || el.querySelector('a');
        const linkEl = el.querySelector('a[href]');
        results.push({
          name: nameEl?.textContent?.trim() || '',
          href: linkEl?.href || '',
          img: el.querySelector('img')?.src || '',
          price: text.match(/([\d,]+)\s*€/)?.[1] || '',
          hasCart: !!el.querySelector('[class*="cart"], [class*="buy"], button'),
        });
      });
      return results;
    });
    const seen = new Set();
    for (const p of rawProducts) {
      if (!p.name || !p.href || seen.has(p.href)) continue;
      seen.add(p.href);
      const name = cleanName(p.name);
      const cat = classify(name);
      if (!cat) continue;
      const price = parseP(p.price, false);
      prods.push({
        shop_id: shopId, name, url: p.href,
        image_url: p.img || null, category: cat,
        current_price: price,
        current_stock_status: p.hasCart ? 'in_stock' : 'out_of_stock',
        current_stock_quantity: null,
      });
    }
  } catch(e) { console.log('  Brloh error:', e.message.substring(0, 80)); }
  await browser.close();
  return prods;
}

// ===== SMARTY (SK, EUR) - Puppeteer required =====
// After loading the listing page, visit each product detail page to get the price.
async function scrapeSmarty(shopId) {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { console.log('  Puppeteer not available, skipping Smarty'); return []; }
  const prods = [];
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent(H['User-Agent']);
  try {
    await page.goto('https://www.smarty.sk/Vyrobce/pokemon-company', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(5000);

    // First: collect product links and names from the listing page
    const rawProducts = await page.evaluate(() => {
      const results = [];
      const containers = document.querySelectorAll('[class*="product"], .item, [class*="tile"], [data-product], .productItem, .product-item');
      containers.forEach(el => {
        const nameEl = el.querySelector('h2, h3, a[class*="name"], [class*="name"], [class*="title"]');
        const name = nameEl?.textContent?.trim() || '';
        const linkEl = el.querySelector('a[href]');
        const href = linkEl?.href || '';
        const imgEl = el.querySelector('img');
        const img = imgEl?.src || imgEl?.getAttribute('data-src') || '';
        // Try to get price from the listing tile first
        const text = el.textContent || '';
        const priceMatch = text.match(/([\d\s,]+)\s*€/);
        const price = priceMatch ? priceMatch[1] : '';
        // Check for stock/availability text
        const availEl = el.querySelector('[class*="avail"], [class*="stock"], [class*="dostupn"]');
        const availText = availEl?.textContent?.trim() || '';
        if (name.length > 5 && (name.toLowerCase().includes('pokemon') || name.toLowerCase().includes('pokémon'))) {
          results.push({ name, href, img, price, availText });
        }
      });
      return results;
    });

    const seen = new Set();
    for (const p of rawProducts) {
      if (!p.name || !p.href || seen.has(p.href)) continue;
      seen.add(p.href);
      const name = cleanName(p.name);
      const cat = classify(name);
      if (!cat) continue;

      let price = parseP(p.price, false);

      // If no price from listing, fetch the product detail page for price
      if (!price && p.href) {
        try {
          await page.goto(p.href, { waitUntil: 'networkidle2', timeout: 20000 });
          await delay(2000);
          const detail = await page.evaluate(() => {
            const text = document.body?.textContent || '';
            const priceMatch = text.match(/([\d\s,]+)\s*€/);
            const availEl = document.querySelector('[class*="avail"], [class*="stock"], [class*="dostupn"]');
            return {
              price: priceMatch ? priceMatch[1] : '',
              availText: availEl?.textContent?.trim() || '',
              img: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '',
            };
          });
          price = parseP(detail.price, false);
          // Update availability from detail page if we have it
          if (detail.availText) p.availText = detail.availText;
          if (!p.img && detail.img) p.img = detail.img;
        } catch { /* skip detail fetch errors */ }
      }

      // Determine stock status
      const { s } = stk(p.availText);
      const stockStatus = s !== 'unknown' ? s : 'in_stock'; // Smarty usually only shows available items

      prods.push({
        shop_id: shopId, name, url: p.href,
        image_url: p.img || null, category: cat,
        current_price: price,
        current_stock_status: stockStatus,
        current_stock_quantity: null,
      });
    }
  } catch(e) { console.log('  Smarty error:', e.message.substring(0, 80)); }
  await browser.close();
  return prods;
}

// ===== ALZA (SK, EUR) - Puppeteer required =====
// Uses `a.name` selector for product names (not `a.browsinglink`).
// Checks `[class*="avail"]` text for "Na sklade" vs "Momentálne nedostupné".
async function scrapeAlza(shopId) {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { console.log('  Puppeteer not available, skipping Alza'); return []; }
  const prods = [], seen = new Set();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent(H['User-Agent']);
  try {
    // Visit homepage first to get cookies
    await page.goto('https://www.alza.sk/', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    // Now search
    await page.goto('https://www.alza.sk/search.htm?exps=pokemon+tcg', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(10000);

    const rawProducts = await page.evaluate(() => {
      const results = [];
      // Main product containers
      document.querySelectorAll('.box.browsingitem, [class*="browsingitem"], [class*="product-box"]').forEach(box => {
        // Use a.name selector for names (NOT a.browsinglink)
        const nameLink = box.querySelector('a.name');
        if (!nameLink) return;
        const name = nameLink.textContent.trim();
        const href = nameLink.href;
        const img = box.querySelector('img')?.src || '';
        const priceMatch = box.textContent.match(/([\d\s,]+)\s*€/);
        const price = priceMatch ? priceMatch[1].replace(/\s/g, '') : '';
        // Check [class*="avail"] for stock text
        const availEl = box.querySelector('[class*="avail"]');
        const availText = availEl?.textContent?.trim() || '';
        results.push({ name, href, img, price, availText });
      });
      return results;
    });

    for (const p of rawProducts) {
      if (!p.name || seen.has(p.href)) continue;
      seen.add(p.href);
      const name = cleanName(p.name);
      const cat = classify(name);
      if (!cat) continue;
      const price = parseP(p.price, false);
      // Stock: "Na sklade" / "Skladom" = in_stock, "Momentálne nedostupné" / "skončil" = out_of_stock
      const al = p.availText.toLowerCase();
      let stockStatus = 'unknown';
      if (al.includes('na sklade') || al.includes('skladom')) {
        stockStatus = 'in_stock';
      } else if (al.includes('nedostupné') || al.includes('skončil') || al.includes('strážiť') || al.includes('momentálne')) {
        stockStatus = 'out_of_stock';
      }
      prods.push({
        shop_id: shopId, name, url: p.href,
        image_url: p.img || null, category: cat,
        current_price: price,
        current_stock_status: stockStatus,
        current_stock_quantity: null,
      });
    }
  } catch(e) { console.log('  Alza error:', e.message.substring(0, 80)); }
  await browser.close();
  return prods;
}

// ═══════════════════════════════════════════════════════════════════
// SCRAPER REGISTRY
// ═══════════════════════════════════════════════════════════════════
const SCRAPERS = {
  nekonecno: scrapeNekonecno,
  ihrysko: scrapeIhrysko,
  xzone: scrapeXzone,
  dracik: scrapeDracik,
  pomposk: scrapePompoSk,
  pompocz: scrapePompoCz,
  bambule: scrapeBambule,
  knihydobrovsky: scrapeKnihy,
  brloh: scrapeBrloh,
  smarty: scrapeSmarty,
  alza: scrapeAlza,
};

// ═══════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════
async function main() {
  const { data: shops } = await supabase.from('shops').select('id, slug, name').eq('is_active', true);
  if (!shops || shops.length === 0) {
    console.log('No active shops found.');
    return;
  }
  const sm = {};
  shops.forEach(s => sm[s.slug] = { id: s.id, name: s.name });

  let totalProducts = 0, totalRestocks = 0;

  for (const [slug, fn] of Object.entries(SCRAPERS)) {
    if (!sm[slug]) continue;
    console.log(`Scraping ${sm[slug].name}...`);
    try {
      const products = await fn(sm[slug].id);
      console.log(`  ${products.length} products found`);
      totalProducts += products.length;

      for (const p of products) {
        // ─── Fix missing images for in-stock products ───
        if (!p.image_url && p.current_stock_status === 'in_stock') {
          const ogImg = await fetchOgImage(p.url);
          if (ogImg) p.image_url = ogImg;
          await delay(500);
        }

        // ─── Normalized name for matching ───
        const norm = p.name.toLowerCase()
          .replace(/pokémon/g, 'pokemon')
          .replace(/pokemon\s*tcg:?\s*/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        // ─── Upsert: deduplicate by shop_id + url ───
        // First check if the product exists (for stock transition detection)
        const { data: existing } = await supabase.from('products')
          .select('id, current_stock_status, current_price, image_url')
          .eq('shop_id', p.shop_id)
          .eq('url', p.url)
          .single();

        const now = new Date().toISOString();

        if (existing) {
          // ─── Stock transition: out_of_stock -> in_stock ───
          if (existing.current_stock_status !== 'in_stock' && p.current_stock_status === 'in_stock') {
            await supabase.from('stock_transitions').insert({
              product_id: existing.id,
              previous_status: existing.current_stock_status,
              new_status: 'in_stock',
              previous_price: existing.current_price,
              new_price: p.current_price,
            });
            totalRestocks++;
            console.log(`  *** RESTOCK: ${p.name.substring(0, 50)} ***`);

            // ─── Create notifications for users with notify_in_app=true ───
            const { data: users } = await supabase.from('profiles')
              .select('id, email, notify_email')
              .eq('notify_in_app', true);
            if (users && users.length > 0) {
              const notifs = users.map(u => ({
                user_id: u.id,
                type: 'restock',
                title: `${p.name} je skladom!`,
                body: `${p.current_price ? p.current_price + ' \u20ac' : ''} - doskladnen\u00e9!`,
                product_id: existing.id,
              }));
              await supabase.from('notifications').insert(notifs);
            }

            // ─── Send restock emails ───
            try {
              const resendKey = process.env.RESEND_API_KEY;
              if (resendKey && users && users.length > 0) {
                const emailUsers = users.filter(u => u.notify_email && u.email);
                for (const eu of emailUsers) {
                  try {
                    const priceText = p.current_price ? `${p.current_price} \u20ac` : 'neuveden\u00e1 cena';
                    const emailHtml = `<!DOCTYPE html><html lang="sk"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background-color:#0a0a1a;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e;border-radius:12px;overflow:hidden;"><tr><td style="background-color:#a855f7;padding:24px 32px;"><h1 style="margin:0;color:#fff;font-size:22px;">Pok\u00e9Sklad</h1></td></tr><tr><td style="padding:32px;"><h2 style="color:#fff;margin:0 0 16px;">Produkt je op\u00e4\u0165 skladom!</h2><p style="color:#d1d5db;font-size:16px;margin:0 0 8px;"><strong style="color:#a855f7;">${p.name}</strong></p><p style="color:#d1d5db;font-size:14px;margin:0 0 4px;">Obchod: <strong style="color:#fff;">${sm[slug].name}</strong></p><p style="color:#d1d5db;font-size:14px;margin:0 0 24px;">Cena: <strong style="color:#fff;">${priceText}</strong></p><a href="${p.url}" style="display:inline-block;background-color:#a855f7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:bold;">Zobrazi\u0165 produkt</a></td></tr><tr><td style="padding:24px 32px;border-top:1px solid #2a2a3e;"><p style="color:#6b7280;font-size:12px;margin:0;">Pre odhl\u00e1senie z emailov upravte nastavenia vo svojom profile na Pok\u00e9Sklad.</p></td></tr></table></td></tr></table></body></html>`;
                    await fetch('https://api.resend.com/emails', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
                      body: JSON.stringify({
                        from: 'Pok\u00e9Sklad <noreply@pokesklad.sk>',
                        to: eu.email,
                        subject: `${p.name} je op\u00e4\u0165 skladom!`,
                        html: emailHtml,
                      }),
                    });
                  } catch (emailErr) {
                    console.log(`  Email error for ${eu.email}: ${emailErr.message}`);
                  }
                }
              }
            } catch (emailErr) {
              console.log(`  Email batch error: ${emailErr.message}`);
            }
          }

          // ─── Price drop detection & notifications ───
          if (existing.current_price && p.current_price && p.current_price < existing.current_price) {
            console.log(`  *** PRICE DROP: ${p.name.substring(0, 50)} ${existing.current_price}\u20ac -> ${p.current_price}\u20ac ***`);

            // Create price_drop notifications for users with notify_price_drop=true
            const { data: priceDropUsers } = await supabase.from('profiles')
              .select('id, email, notify_email')
              .eq('notify_in_app', true)
              .eq('notify_price_drop', true);
            if (priceDropUsers && priceDropUsers.length > 0) {
              const pdNotifs = priceDropUsers.map(u => ({
                user_id: u.id,
                type: 'price_drop',
                title: `Zn\u00ed\u017eenie ceny: ${p.name}`,
                body: `${existing.current_price} \u20ac \u2192 ${p.current_price} \u20ac`,
                product_id: existing.id,
              }));
              await supabase.from('notifications').insert(pdNotifs);
            }

            // Send price drop emails
            try {
              const resendKey = process.env.RESEND_API_KEY;
              if (resendKey && priceDropUsers && priceDropUsers.length > 0) {
                const emailUsers = priceDropUsers.filter(u => u.notify_email && u.email);
                for (const eu of emailUsers) {
                  try {
                    const savings = Math.round((existing.current_price - p.current_price) * 100) / 100;
                    const pctOff = Math.round((savings / existing.current_price) * 100);
                    const emailHtml = `<!DOCTYPE html><html lang="sk"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background-color:#0a0a1a;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a;padding:40px 20px;"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e;border-radius:12px;overflow:hidden;"><tr><td style="background-color:#a855f7;padding:24px 32px;"><h1 style="margin:0;color:#fff;font-size:22px;">Pok\u00e9Sklad</h1></td></tr><tr><td style="padding:32px;"><h2 style="color:#fff;margin:0 0 16px;">Zn\u00ed\u017eenie ceny!</h2><p style="color:#d1d5db;font-size:16px;margin:0 0 8px;"><strong style="color:#a855f7;">${p.name}</strong></p><p style="color:#d1d5db;font-size:14px;margin:0 0 4px;">Obchod: <strong style="color:#fff;">${sm[slug].name}</strong></p><p style="color:#d1d5db;font-size:14px;margin:0 0 4px;">P\u00f4vodn\u00e1 cena: <span style="text-decoration:line-through;color:#9ca3af;">${existing.current_price} \u20ac</span></p><p style="color:#d1d5db;font-size:14px;margin:0 0 4px;">Nov\u00e1 cena: <strong style="color:#22c55e;font-size:18px;">${p.current_price} \u20ac</strong></p><p style="color:#22c55e;font-size:14px;margin:0 0 24px;">U\u0161etr\u00edte ${savings} \u20ac (${pctOff}%)</p><a href="${p.url}" style="display:inline-block;background-color:#a855f7;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:bold;">Zobrazi\u0165 produkt</a></td></tr><tr><td style="padding:24px 32px;border-top:1px solid #2a2a3e;"><p style="color:#6b7280;font-size:12px;margin:0;">Pre odhl\u00e1senie z emailov upravte nastavenia vo svojom profile na Pok\u00e9Sklad.</p></td></tr></table></td></tr></table></body></html>`;
                    await fetch('https://api.resend.com/emails', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
                      body: JSON.stringify({
                        from: 'Pok\u00e9Sklad <noreply@pokesklad.sk>',
                        to: eu.email,
                        subject: `Zn\u00ed\u017eenie ceny: ${p.name}`,
                        html: emailHtml,
                      }),
                    });
                  } catch (emailErr) {
                    console.log(`  Price drop email error for ${eu.email}: ${emailErr.message}`);
                  }
                }
              }
            } catch (emailErr) {
              console.log(`  Price drop email batch error: ${emailErr.message}`);
            }
          }

          // Update existing product
          await supabase.from('products').update({
            name: p.name,
            normalized_name: norm,
            current_price: p.current_price,
            current_stock_status: p.current_stock_status,
            current_stock_quantity: p.current_stock_quantity,
            image_url: p.image_url || existing.image_url,
            category: p.category,
            last_seen_at: now,
            updated_at: now,
            last_in_stock_at: p.current_stock_status === 'in_stock' ? now : undefined,
          }).eq('id', existing.id);

        } else {
          // Insert new product — use upsert with onConflict to prevent race-condition duplicates
          await supabase.from('products').upsert({
            shop_id: p.shop_id,
            name: p.name,
            normalized_name: norm,
            url: p.url,
            image_url: p.image_url,
            category: p.category,
            current_price: p.current_price,
            current_stock_status: p.current_stock_status,
            current_stock_quantity: p.current_stock_quantity,
            is_tracked: true,
            last_seen_at: now,
            updated_at: now,
            last_in_stock_at: p.current_stock_status === 'in_stock' ? now : null,
          }, {
            onConflict: 'shop_id,url',
            ignoreDuplicates: false,
          });
        }
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message.substring(0, 100)}`);
    }
  }

  // ─── Mark stock_transitions as notified ───
  if (totalRestocks > 0) {
    await supabase.from('stock_transitions')
      .update({ notification_sent: true })
      .eq('notification_sent', false)
      .eq('new_status', 'in_stock');
  }

  console.log(`\nDONE: ${totalProducts} products | ${totalRestocks} restocks`);
}

main().catch(e => { console.error(e); process.exit(1); });
