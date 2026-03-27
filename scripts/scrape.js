const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'sk-SK,sk;q=0.9,cs;q=0.8',
};
const delay = ms => new Promise(r => setTimeout(r, ms));
const CZK_EUR = 0.04;

// STRICT: Only sealed TCG products pass through
const EXCL = [
  // Accessories
  'album','binder','sleeve','toploader','deck box','ultra pro','playmat','podložka','podlozka',
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
  for (const k of EXCL) if (l.includes(k)) return null;
  if (!l.includes('pokemon') && !l.includes('pokémon') && !l.includes('pok\u00e9mon')) return null;
  if (l.includes('elite trainer box') || /\betb\b/.test(l)) return 'etb';
  if (l.includes('booster bundle')) return 'booster_bundle';
  if ((l.includes('booster box') || l.includes('booster display')) && !l.includes('bundle')) return 'booster_box';
  if (l.includes('booster') && !l.includes('box') && !l.includes('bundle') && !l.includes('display')) return 'booster_pack';
  if (l.includes('collection') || l.includes('kolekcia') || l.match(/\btin\b/) || l.includes('mini tin')
    || l.includes('blister') || l.includes('special') || l.includes('premium')
    || l.includes('chest') || l.includes('ex box') || l.match(/\bbox\b/)) return 'collection_box';
  return null; // STRICT: if we can't categorize it, skip it
}

// Clean product name - remove whitespace garbage
function cleanName(raw) {
  return raw.replace(/\s+/g, ' ').replace(/^\d+\s*/, '').replace(/^Kartová hra\s*/i, '').trim();
}

function parseP(t, czk) {
  if (!t) return null;
  const c = t.replace(/\s/g, '').replace(/[^\d,.\-]/g, '').replace(',', '.');
  const n = parseFloat(c);
  if (isNaN(n) || n === 0) return null;
  return czk ? Math.round(n * CZK_EUR * 100) / 100 : n;
}

function stk(t) {
  const l = (t || '').toLowerCase();
  if (l.includes('ihneď') || l.includes('ihned') || l.includes('skladom') || l.includes('skladem')
    || l.includes('odosielame') || l.includes('posledn') || l.includes('> 5') || l.includes('>5'))
    { const m = t.match(/(\d+)\s*ks/i); return { s: 'in_stock', q: m ? parseInt(m[1]) : null }; }
  if (l.includes('na ceste') || l.includes('očakávame') || l.includes('předobjed') || l.includes('predobjed')
    || l.includes('pripravujeme')) return { s: 'preorder', q: null };
  if (l.includes('nedostupn') || l.includes('vypredané') || l.includes('vypredane') || l.includes('vyprodáno')
    || l.includes('vyprodané') || l.includes('nie je') || l.includes('objednáme') || l.includes('dlhodobo')
    || l.includes('momentálne') || l.includes('sold out')) return { s: 'out_of_stock', q: null };
  return { s: 'unknown', q: null };
}

function resolveUrl(href, base) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  if (href.startsWith('//')) return 'https:' + href;
  return base + (href.startsWith('/') ? '' : '/') + href;
}

// ===== NEKONEČNO (SK, EUR) =====
async function scrapeNekonecno(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 12; pg++) {
    const url = pg === 1 ? 'https://www.nekonecno.sk/pokemon-tcg/' : `https://www.nekonecno.sk/pokemon-tcg/strana-${pg}/`;
    const res = await fetch(url, { headers: H }); if (!res.ok) break;
    const $ = cheerio.load(await res.text()); let f = 0;
    $('.product').each((_, el) => {
      const e = $(el);
      const name = cleanName(e.find('[data-testid="productCardName"], a.name span').first().text());
      const href = e.find('a.name, a.image').first().attr('href');
      if (!name || !href) return; const cat = classify(name); if (!cat) return;
      let img = e.find('.p a.image img').attr('src') || e.find('img').first().attr('data-src') || e.find('img').first().attr('src');
      if (img && (img.includes('data:') || img.includes('svg+xml'))) img = null;
      const price = parseP(e.find('.price-final strong').text() || e.find('.prices strong').first().text(), false);
      const { s, q } = stk(e.find('.availability').text());
      prods.push({ shop_id: shopId, name, url: 'https://www.nekonecno.sk' + href, image_url: img || null, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
      f++;
    });
    if (f === 0 && pg > 1) break; await delay(1500);
  }
  return prods;
}

// ===== IHRYSKO (SK, EUR) =====
async function scrapeIhrysko(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 20; pg++) {
    const url = `https://www.ihrysko.sk/vyhladavanie?search=pokemon+tcg&page=${pg}`;
    const res = await fetch(url, { headers: H }); if (!res.ok) break;
    const $ = cheerio.load(await res.text()); let f = 0;
    $('.product-thumb').each((_, el) => {
      const e = $(el);
      const name = cleanName(e.find('.product-thumb__name').text());
      const href = e.find('.product-thumb__name a').attr('href');
      if (!name || !href) return; const cat = classify(name); if (!cat) return;
      let img = e.find('.product-thumb__img img').attr('data-src') || null;
      if (img) img = resolveUrl(img, 'https://www.ihrysko.sk');
      if (img && (img.includes('loading') || img.includes('data:'))) img = null;
      const price = parseP(e.find('.product-thumb__price .actual-price, .product-thumb__price').first().text(), false);
      const { s, q } = stk(e.find('.product-thumb__availability').first().text());
      prods.push({ shop_id: shopId, name, url: href, image_url: img, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
      f++;
    });
    if (f === 0 && pg > 1) break; await delay(2000);
  }
  return prods;
}

// ===== XZONE (SK, EUR) =====
async function scrapeXzone(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 8; pg++) {
    const url = `https://www.xzone.sk/katalog.php?term=pokemon+tcg&s=60&page=${pg}`;
    const res = await fetch(url, { headers: H }); if (!res.ok) break;
    const $ = cheerio.load(await res.text()); let f = 0;
    $('.item-wrapper').each((_, el) => {
      const e = $(el);
      const link = e.find('a[href*="xzone"]').first();
      const name = cleanName(link.attr('title') || e.find('.item-title').text());
      const href = link.attr('href');
      if (!name || !href || name.length < 5) return; const cat = classify(name); if (!cat) return;
      const img = e.find('img').first().attr('src');
      const price = parseP(e.find('.price').first().text(), false);
      const { s, q } = stk(e.find('.expedice-date').text());
      prods.push({ shop_id: shopId, name, url: href, image_url: img || null, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
      f++;
    });
    if (f === 0 && pg > 1) break; await delay(1500);
  }
  return prods;
}

// ===== DRÁČIK (SK, EUR) =====
async function scrapeDracik(shopId) {
  const prods = [];
  const res = await fetch('https://www.dracik.sk/pokemon-1076/', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('.ProductCard').each((_, el) => {
    const e = $(el);
    const name = cleanName(e.find('[class*="Name"], h2, h3').first().text());
    const href = e.find('a').first().attr('href');
    if (!name || !href) return; const cat = classify(name); if (!cat) return;
    const imgSrc = e.find('img').first().attr('src');
    const img = imgSrc ? resolveUrl(imgSrc, 'https://www.dracik.sk') : null;
    const price = parseP(e.find('[class*="rice"]').first().text(), false);
    const { s, q } = stk(e.find('[class*="tock"], [class*="vail"]').first().text());
    prods.push({ shop_id: shopId, name, url: resolveUrl(href, 'https://www.dracik.sk'), image_url: img, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
  });
  return prods;
}

// ===== POMPO SK (SK, EUR) - Check each product's actual stock =====
async function scrapePompoSk(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.pompo.sk/pokemon-tcg', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('a[href*="pokemon"][href*="_z"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    if (!href) return;
    const fullUrl = resolveUrl(href, 'https://www.pompo.sk');
    if (seen.has(fullUrl)) return; seen.add(fullUrl);
    const parent = a.closest('.catalog-outer, .catalog');
    // Get clean name from the strong/b tag inside, NOT the entire text block
    const nameEl = parent.find('strong').first().text().trim() || parent.find('b').first().text().trim();
    const name = cleanName(nameEl || a.text());
    if (!name || name.length < 5) return; const cat = classify(name); if (!cat) return;
    const img = parent.find('img').first().attr('src') || null;
    // Get last EUR price (current price, not DMOC)
    const allPrices = parent.text().match(/[\d,]+\s*€/g) || [];
    const price = allPrices.length > 0 ? parseP(allPrices[allPrices.length - 1], false) : null;
    // Check actual stock from page text
    const parentText = parent.text().toLowerCase();
    const stockOnline = parentText.includes('skladom online') || parentText.includes('skladem online');
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: img, category: cat, current_price: price,
      current_stock_status: stockOnline ? 'in_stock' : 'out_of_stock', current_stock_quantity: null });
  });
  return prods;
}

// ===== POMPO CZ (CZ, CZK → EUR) =====
async function scrapePompoCz(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.pompo.cz/pokemon-tcg', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('a[href*="pokemon"][href*="_z"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    if (!href) return;
    const fullUrl = resolveUrl(href, 'https://www.pompo.cz');
    if (seen.has(fullUrl)) return; seen.add(fullUrl);
    const parent = a.closest('.catalog-outer, .catalog');
    const nameEl = parent.find('strong').first().text().trim() || parent.find('b').first().text().trim();
    const name = cleanName(nameEl || a.text());
    if (!name || name.length < 5) return; const cat = classify(name); if (!cat) return;
    const img = parent.find('img').first().attr('src') || null;
    const allPrices = parent.text().match(/[\d\s]+\s*Kč/g) || [];
    const price = allPrices.length > 0 ? parseP(allPrices[allPrices.length - 1], true) : null;
    const parentText = parent.text().toLowerCase();
    const stockOnline = parentText.includes('skladom online') || parentText.includes('skladem online');
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: img, category: cat, current_price: price,
      current_stock_status: stockOnline ? 'in_stock' : 'out_of_stock', current_stock_quantity: null });
  });
  return prods;
}

// ===== BAMBULE (CZ, CZK → EUR) =====
async function scrapeBambule(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.bambule.cz/pokemon-tcg', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('[class*="ProductCard"]').each((_, el) => {
    const e = $(el);
    const link = e.find('[class*="title"] a').first();
    const href = link.attr('href'); const name = cleanName(link.text());
    if (!name || !href) return;
    const fullUrl = 'https://www.bambule.cz' + href;
    if (seen.has(fullUrl)) return; seen.add(fullUrl);
    const cat = classify(name); if (!cat) return;
    const srcset = e.find('img').first().attr('srcset') || '';
    const srcs = srcset.split(',').map(s => s.trim().split(' ')[0]).filter(s => s && !s.includes('data:'));
    const img = srcs.length > 0 ? srcs[srcs.length - 1] : null;
    const price = parseP(e.find('[class*="Price"]').first().text(), true);
    const { s, q } = stk(e.find('[class*="Stock"]').first().text());
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: img, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
  });
  return prods;
}

// ===== KNIHY DOBROVSKÝ (CZ, CZK → EUR) =====
async function scrapeKnihy(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://knihydobrovsky.cz/pokemon-tcg', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('a[href*="/hra/pokemon"], a[href*="/hra/Pok"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    if (!href) return;
    const fullUrl = resolveUrl(href, 'https://knihydobrovsky.cz');
    if (seen.has(fullUrl)) return; seen.add(fullUrl);
    const parent = a.closest('li, [class*="product"], [class*="item"]');
    const name = cleanName(parent.find('h3').text() || a.text());
    if (!name || name.length < 5) return; const cat = classify(name); if (!cat) return;
    const imgSrc = parent.find('img').first().attr('src');
    const img = imgSrc ? resolveUrl(imgSrc, 'https://knihydobrovsky.cz') : null;
    const priceMatch = parent.text().match(/(\d[\d\s]*)\s*Kč/);
    const price = priceMatch ? parseP(priceMatch[1], true) : null;
    const hasCart = parent.text().includes('Do košíku');
    const hasSupplier = parent.text().includes('dodavatele');
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: img, category: cat, current_price: price,
      current_stock_status: hasCart ? 'in_stock' : (hasSupplier ? 'preorder' : 'out_of_stock'), current_stock_quantity: null });
  });
  return prods;
}

// ===== BRLOH (SK, EUR) - Puppeteer required =====
async function scrapeBrloh(shopId) {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { console.log('  Puppeteer not available'); return []; }
  const prods = [];
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  try {
    await page.goto('https://www.brloh.sk/pokemon-c1781', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(5000);
    const rawProducts = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('[class*="product"], .item').forEach(el => {
        if (!el.querySelector('img') || !el.querySelector('a')) return;
        const text = el.textContent || '';
        if (!text.includes('€')) return;
        const nameEl = el.querySelector('h2, h3, h4, [class*="name"], [class*="title"]') || el.querySelector('a');
        results.push({
          name: nameEl?.textContent?.trim() || '',
          href: el.querySelector('a')?.href || '',
          img: el.querySelector('img')?.src || '',
          price: text.match(/([\d,]+)\s*€/)?.[1] || '',
          hasCart: !!el.querySelector('[class*="cart"], [class*="buy"], button'),
        });
      });
      return results;
    });
    const seen = new Set();
    for (const p of rawProducts) {
      if (seen.has(p.href)) continue; seen.add(p.href);
      const cat = classify(p.name); if (!cat) continue;
      const price = parseP(p.price, false);
      prods.push({ shop_id: shopId, name: cleanName(p.name), url: p.href, image_url: p.img || null,
        category: cat, current_price: price, current_stock_status: p.hasCart ? 'in_stock' : 'out_of_stock', current_stock_quantity: null });
    }
  } catch(e) { console.log('  Brloh error:', e.message.substring(0, 60)); }
  await browser.close();
  return prods;
}

// ===== SMARTY (SK, EUR) - Puppeteer required =====
async function scrapeSmarty(shopId) {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { console.log('  Puppeteer not available'); return []; }
  const prods = [];
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  try {
    await page.goto('https://www.smarty.sk/Vyrobce/pokemon-company', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(5000);
    const rawProducts = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('[class*="product"], .item, [class*="tile"], [data-product]').forEach(el => {
        const nameEl = el.querySelector('h2, h3, a, [class*="name"], [class*="title"]');
        const name = nameEl?.textContent?.trim() || '';
        const href = (el.querySelector('a[href]') || {}).href || '';
        const img = (el.querySelector('img') || {}).src || '';
        const text = el.textContent || '';
        const price = text.match(/([\d\s,]+)\s*€/)?.[1] || '';
        if (name.length > 5 && (name.toLowerCase().includes('pokemon') || name.toLowerCase().includes('pokémon'))) {
          results.push({ name, href, img, price });
        }
      });
      return results;
    });
    const seen = new Set();
    for (const p of rawProducts) {
      if (seen.has(p.href)) continue; seen.add(p.href);
      const cat = classify(p.name); if (!cat) continue;
      const price = parseP(p.price, false);
      prods.push({ shop_id: shopId, name: cleanName(p.name), url: p.href, image_url: p.img || null,
        category: cat, current_price: price, current_stock_status: 'in_stock', current_stock_quantity: null });
    }
  } catch(e) { console.log('  Smarty error:', e.message.substring(0, 60)); }
  await browser.close();
  return prods;
}

// ===== ALZA (SK, EUR) - Puppeteer required =====
async function scrapeAlza(shopId) {
  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch { console.log('  Puppeteer not available'); return []; }
  const prods = [], seen = new Set();
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  try {
    await page.goto('https://www.alza.sk/', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    await page.goto('https://www.alza.sk/search.htm?exps=pokemon+tcg', { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(10000);
    const rawProducts = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll('.box.browsingitem').forEach(box => {
        const nameLink = box.querySelector('a.name.browsinglink, a.name');
        if (!nameLink) return;
        const name = nameLink.textContent.trim();
        const href = nameLink.href;
        const img = box.querySelector('img')?.src || '';
        const priceMatch = box.textContent.match(/([\d\s,]+)\s*€/);
        const price = priceMatch ? priceMatch[1].replace(/\s/g, '') : '';
        const availText = box.querySelector('[class*="avail"]')?.textContent?.trim() || '';
        const isInStock = availText.includes('Na sklade') || availText.includes('Skladom');
        const isSoldOut = availText.includes('nedostupné') || availText.includes('skončil') || availText.includes('Strážiť');
        results.push({ name, href, img, price, isInStock, availText });
      });
      return results;
    });
    for (const p of rawProducts) {
      if (!p.name || seen.has(p.href)) continue; seen.add(p.href);
      const cat = classify(p.name); if (!cat) continue;
      const price = parseP(p.price, false);
      prods.push({ shop_id: shopId, name: cleanName(p.name), url: p.href, image_url: p.img || null,
        category: cat, current_price: price, current_stock_status: p.isInStock ? 'in_stock' : 'out_of_stock', current_stock_quantity: null });
    }
  } catch(e) { console.log('  Alza error:', e.message.substring(0, 60)); }
  await browser.close();
  return prods;
}

const SCRAPERS = {
  nekonecno: scrapeNekonecno, ihrysko: scrapeIhrysko, xzone: scrapeXzone,
  dracik: scrapeDracik, pomposk: scrapePompoSk, pompocz: scrapePompoCz,
  bambule: scrapeBambule, knihydobrovsky: scrapeKnihy,
  brloh: scrapeBrloh, smarty: scrapeSmarty, alza: scrapeAlza,
};

async function main() {
  const { data: shops } = await supabase.from('shops').select('id, slug, name').eq('is_active', true);
  const sm = {}; shops.forEach(s => sm[s.slug] = { id: s.id, name: s.name });

  let totalProducts = 0, totalRestocks = 0;

  for (const [slug, fn] of Object.entries(SCRAPERS)) {
    if (!sm[slug]) continue;
    console.log(`Scraping ${sm[slug].name}...`);
    try {
      const products = await fn(sm[slug].id);
      console.log(`  ${products.length} products`);
      totalProducts += products.length;

      for (const p of products) {
        // Fix missing images for in-stock products
        if (!p.image_url && p.current_stock_status === 'in_stock') {
          try {
            const r = await fetch(p.url, { headers: H }); if (!r.ok) continue;
            const $ = cheerio.load(await r.text());
            let img = $('meta[property="og:image"]').attr('content');
            if (img && !img.includes('data:')) p.image_url = img;
            await delay(500);
          } catch {}
        }

        const norm = p.name.toLowerCase().replace(/pokémon/g, 'pokemon').replace(/pokemon\s*tcg:?\s*/g, '').replace(/\s+/g, ' ').trim();
        const { data: existing } = await supabase.from('products')
          .select('id, current_stock_status, current_price, image_url')
          .eq('shop_id', p.shop_id).eq('url', p.url).single();

        if (existing) {
          if (existing.current_stock_status !== 'in_stock' && p.current_stock_status === 'in_stock') {
            await supabase.from('stock_transitions').insert({
              product_id: existing.id, previous_status: existing.current_stock_status,
              new_status: 'in_stock', previous_price: existing.current_price, new_price: p.current_price,
            });
            totalRestocks++;
            console.log(`  *** RESTOCK: ${p.name.substring(0, 50)} ***`);
          }
          await supabase.from('products').update({
            name: p.name, current_price: p.current_price, current_stock_status: p.current_stock_status,
            current_stock_quantity: p.current_stock_quantity, image_url: p.image_url || existing.image_url,
            last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            last_in_stock_at: p.current_stock_status === 'in_stock' ? new Date().toISOString() : undefined,
          }).eq('id', existing.id);
        } else {
          await supabase.from('products').insert({
            ...p, normalized_name: norm, is_tracked: true,
            last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString(),
            last_in_stock_at: p.current_stock_status === 'in_stock' ? new Date().toISOString() : null,
          });
        }
      }
    } catch (e) {
      console.log(`  ERROR: ${e.message.substring(0, 80)}`);
    }
  }

  // Notifications
  if (totalRestocks > 0) {
    const { data: transitions } = await supabase.from('stock_transitions')
      .select('*, product:products(*)').eq('notification_sent', false).eq('new_status', 'in_stock');
    for (const t of (transitions || [])) {
      if (!t.product) continue;
      const { data: users } = await supabase.from('profiles').select('id').eq('notify_in_app', true);
      const notifs = (users || []).map(u => ({
        user_id: u.id, type: 'restock',
        title: `${t.product.name} je skladom!`,
        body: `${t.product.current_price ? t.product.current_price + ' €' : ''} - doskladnené!`,
        product_id: t.product.id,
      }));
      if (notifs.length > 0) await supabase.from('notifications').insert(notifs);
      await supabase.from('stock_transitions').update({ notification_sent: true }).eq('id', t.id);
    }
  }

  console.log(`\nDONE: ${totalProducts} products | ${totalRestocks} restocks`);
}

main().catch(e => { console.error(e); process.exit(1); });
