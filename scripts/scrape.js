const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'sk-SK,sk;q=0.9,cs;q=0.8',
};
const delay = ms => new Promise(r => setTimeout(r, ms));
const CZK_EUR = 0.04;

// ===== PRODUCT CLASSIFICATION =====
const EXCL = ['album','plyšov','plush','figúrk','figurk','tričk','t-shirt','mikin','hoodie','batoh','wallet','puzzle','keychain','mug','pillow','socks','cap','blanket','sleeve','toploader','deck box','ultra pro','playmat','podložka','podlozka','coin','dice','book','kniha','dvd','nintendo','ps4','xbox','lego','funko','pokeball','lamp','poster','sticker','bottle','bag','eraser','pencil','binder','obal','ochranné','protective','card sleeves','gumička','peračník','notes','zápisník','energy card','herná podložka','hracia podložka','acrylic','graded','psa ','bgs ','jumbo','oversized','promo card','pin ','trainer toolkit','na karty','kartová','mega construx','adventný','advent calendar','build & battle','league battle','trainer box (','poškoz'];

function classify(name) {
  const l = name.toLowerCase();
  for (const k of EXCL) if (l.includes(k)) return null;
  if (!l.includes('pokemon') && !l.includes('pokémon')) return null;
  if (l.includes('elite trainer box') || /\betb\b/.test(l)) return 'etb';
  if (l.includes('booster bundle')) return 'booster_bundle';
  if ((l.includes('booster box') || l.includes('booster display')) && !l.includes('bundle')) return 'booster_box';
  if (l.includes('booster') && !l.includes('box') && !l.includes('bundle') && !l.includes('display')) return 'booster_pack';
  if (l.includes('collection') || l.includes('kolekcia') || l.match(/\btin\b/) || l.includes('blister') || l.includes('special') || l.includes('premium') || l.includes('chest') || l.includes('mini tin')) return 'collection_box';
  return 'unknown';
}

function parseP(t, czk) {
  if (!t) return null;
  // Handle "€ 15,99" and "15,99 €" and "999 Kč"
  const c = t.replace(/[^\d,.\-]/g, '').replace(',', '.');
  const n = parseFloat(c);
  if (isNaN(n)) return null;
  return czk ? Math.round(n * CZK_EUR * 100) / 100 : n;
}

function stk(t) {
  const l = (t || '').toLowerCase();
  if (l.includes('ihneď') || l.includes('ihned') || l.includes('skladom') || l.includes('skladem') || l.includes('odosielame') || l.includes('posledn') || l.includes('> 5') || l.includes('>5'))
    { const m = t.match(/(\d+)\s*ks/i); return { s: 'in_stock', q: m ? parseInt(m[1]) : null }; }
  if (l.includes('na ceste') || l.includes('očakávame') || l.includes('předobjed') || l.includes('predobjed') || l.includes('pripravujeme')) return { s: 'preorder', q: null };
  if (l.includes('nedostupn') || l.includes('vypredané') || l.includes('vypredane') || l.includes('vyprodáno') || l.includes('vyprodané') || l.includes('nie je') || l.includes('objednáme') || l.includes('dlhodobo') || l.includes('momentálne')) return { s: 'out_of_stock', q: null };
  return { s: 'unknown', q: null };
}

function resolveUrl(href, base) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  if (href.startsWith('//')) return 'https:' + href;
  return base + (href.startsWith('/') ? '' : '/') + href;
}

// ===== SHOP SCRAPERS =====

// NEKONEČNO (SK, EUR) - Shoptet platform
// Container: .product | Name: [data-testid="productCardName"] | Price: .price-final strong | Stock: .availability
async function scrapeNekonecno(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 12; pg++) {
    const url = pg === 1 ? 'https://www.nekonecno.sk/pokemon-tcg/' : `https://www.nekonecno.sk/pokemon-tcg/strana-${pg}/`;
    const res = await fetch(url, { headers: H }); if (!res.ok) break;
    const $ = cheerio.load(await res.text()); let f = 0;
    $('.product').each((_, el) => {
      const e = $(el);
      const name = e.find('[data-testid="productCardName"], a.name span').first().text().trim();
      const href = e.find('a.name, a.image').first().attr('href');
      if (!name || !href) return; const cat = classify(name); if (!cat) return;
      const img = e.find('.p a.image img').attr('src') || e.find('img').first().attr('data-src');
      const price = parseP(e.find('.price-final strong').text() || e.find('.prices strong').first().text(), false);
      const { s, q } = stk(e.find('.availability').text().trim());
      prods.push({ shop_id: shopId, name, url: 'https://www.nekonecno.sk' + href, image_url: img || null, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
      f++;
    });
    if (f === 0 && pg > 1) break; await delay(1500);
  }
  return prods;
}

// IHRYSKO (SK, EUR)
// Container: .product-thumb | Name: .product-thumb__name | Price: .product-thumb__price | Stock: .product-thumb__availability
async function scrapeIhrysko(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 20; pg++) {
    const url = `https://www.ihrysko.sk/vyhladavanie?search=pokemon+tcg&page=${pg}`;
    const res = await fetch(url, { headers: H }); if (!res.ok) break;
    const $ = cheerio.load(await res.text()); let f = 0;
    $('.product-thumb').each((_, el) => {
      const e = $(el);
      const name = e.find('.product-thumb__name').text().trim();
      const href = e.find('.product-thumb__name a').attr('href');
      if (!name || !href) return; const cat = classify(name); if (!cat) return;
      let img = e.find('.product-thumb__img img').attr('data-src') || null;
      if (img) img = resolveUrl(img, 'https://www.ihrysko.sk');
      if (img && img.includes('loading')) img = null;
      const price = parseP(e.find('.product-thumb__price .actual-price, .product-thumb__price').first().text(), false);
      const { s, q } = stk(e.find('.product-thumb__availability').first().text().trim());
      prods.push({ shop_id: shopId, name, url: href, image_url: img, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
      f++;
    });
    if (f === 0 && pg > 1) break; await delay(2000);
  }
  return prods;
}

// XZONE (SK, EUR)
// Container: .item-wrapper | Price: .price | Stock: .expedice-date | Name from link text
async function scrapeXzone(shopId) {
  const prods = [];
  for (let pg = 1; pg <= 8; pg++) {
    const url = `https://www.xzone.sk/katalog.php?term=pokemon+tcg&s=60&page=${pg}`;
    const res = await fetch(url, { headers: H }); if (!res.ok) break;
    const $ = cheerio.load(await res.text()); let f = 0;
    $('.item-wrapper').each((_, el) => {
      const e = $(el);
      const link = e.find('a[href*="xzone"]').first();
      const href = link.attr('href');
      const name = link.attr('title') || e.find('.item-title').text().trim() || link.text().trim();
      if (!name || !href || name.length < 5) return; const cat = classify(name); if (!cat) return;
      const img = e.find('img').first().attr('src') || e.find('img').first().attr('data-src');
      const price = parseP(e.find('.price').first().text(), false);
      const { s, q } = stk(e.find('.expedice-date').text().trim());
      prods.push({ shop_id: shopId, name, url: href, image_url: img || null, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
      f++;
    });
    if (f === 0 && pg > 1) break; await delay(1500);
  }
  return prods;
}

// DRÁČIK (SK, EUR) - custom platform
// Container: .ProductCard | Name: [class*=Name] | Price: [class*=price] text with "€" | Stock: [class*=stock]
async function scrapeDracik(shopId) {
  const prods = [];
  const res = await fetch('https://www.dracik.sk/pokemon-1076/', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('.ProductCard').each((_, el) => {
    const e = $(el);
    const name = e.find('[class*="Name"], [class*="name"], h2, h3').first().text().trim();
    const href = e.find('a').first().attr('href');
    if (!name || !href) return; const cat = classify(name); if (!cat) return;
    const imgSrc = e.find('img').first().attr('src');
    const img = imgSrc ? resolveUrl(imgSrc, 'https://www.dracik.sk') : null;
    const priceText = e.find('[class*="price"], [class*="Price"]').first().text().trim();
    const price = parseP(priceText, false);
    const { s, q } = stk(e.find('[class*="stock"], [class*="Stock"], [class*="avail"]').first().text().trim());
    prods.push({ shop_id: shopId, name, url: resolveUrl(href, 'https://www.dracik.sk'), image_url: img, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
  });
  return prods;
}

// POMPO SK (SK, EUR)
// Pokemon products in .catalog-outer with links containing "pokemon"
async function scrapePompoSk(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.pompo.sk/pokemon-tcg', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('a[href*="pokemon"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    if (!href || !href.includes('_z')) return; // only product links
    const fullUrl = resolveUrl(href, 'https://www.pompo.sk');
    if (seen.has(fullUrl)) return; seen.add(fullUrl);
    const parent = a.closest('.catalog-outer, .catalog');
    const name = parent.find('strong, b, h3').first().text().trim() || a.text().trim();
    if (!name || name.length < 5) return; const cat = classify(name); if (!cat) return;
    const img = parent.find('img').first().attr('src') || null;
    const priceMatch = parent.text().match(/([\d,]+)\s*€/g);
    const price = priceMatch ? parseP(priceMatch[priceMatch.length - 1], false) : null; // last price = current
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: img, category: cat, current_price: price, current_stock_status: 'in_stock', current_stock_quantity: null }); // Pompo only shows available
  });
  return prods;
}

// POMPO CZ (CZ, CZK → EUR)
async function scrapePompoCz(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.pompo.cz/pokemon-tcg', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('a[href*="pokemon"]').each((_, el) => {
    const a = $(el);
    const href = a.attr('href');
    if (!href || !href.includes('_z')) return;
    const fullUrl = resolveUrl(href, 'https://www.pompo.cz');
    if (seen.has(fullUrl)) return; seen.add(fullUrl);
    const parent = a.closest('.catalog-outer, .catalog');
    const name = parent.find('strong, b, h3').first().text().trim() || a.text().trim();
    if (!name || name.length < 5) return; const cat = classify(name); if (!cat) return;
    const img = parent.find('img').first().attr('src') || null;
    const priceMatch = parent.text().match(/([\d\s]+)\s*Kč/g);
    const price = priceMatch ? parseP(priceMatch[priceMatch.length - 1], true) : null;
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: img, category: cat, current_price: price, current_stock_status: 'in_stock', current_stock_quantity: null });
  });
  return prods;
}

// BAMBULE (CZ, CZK → EUR)
// Container: [class*="ProductCard"] | Name: [class*="title"] a | Price: [class*="Price"] | Stock: [class*="Stock"]
async function scrapeBambule(shopId) {
  const prods = [], seen = new Set();
  const res = await fetch('https://www.bambule.cz/pokemon-tcg', { headers: H }); if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('[class*="ProductCard"]').each((_, el) => {
    const e = $(el);
    const link = e.find('[class*="title"] a').first();
    const href = link.attr('href'); const name = link.text().trim();
    if (!name || !href) return;
    const fullUrl = 'https://www.bambule.cz' + href;
    if (seen.has(fullUrl)) return; seen.add(fullUrl);
    const cat = classify(name); if (!cat) return;
    const srcset = e.find('img').first().attr('srcset') || '';
    const srcs = srcset.split(',').map(s => s.trim().split(' ')[0]).filter(s => s && !s.includes('data:'));
    const img = srcs.length > 0 ? srcs[srcs.length - 1] : null;
    const price = parseP(e.find('[class*="Price"]').first().text(), true);
    const { s, q } = stk(e.find('[class*="Stock"]').first().text().trim());
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: img, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
  });
  return prods;
}

// KNIHY DOBROVSKÝ (CZ, CZK → EUR)
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
    const parent = a.closest('li, [class*="product"], [class*="item"]') || a.parent().parent();
    const name = parent.find('h3, [class*="title"]').text().trim() || a.text().trim();
    if (!name || name.length < 5) return; const cat = classify(name); if (!cat) return;
    const img = parent.find('img').first().attr('src') || null;
    const imgUrl = img ? resolveUrl(img, 'https://knihydobrovsky.cz') : null;
    const priceMatch = parent.text().match(/(\d[\d\s]*)\s*Kč/);
    const price = priceMatch ? parseP(priceMatch[1].replace(/\s/g, ''), true) : null;
    // If "Do košíku" button exists = in stock
    const hasCart = parent.text().includes('Do košíku') || parent.find('button, [class*="cart"]').length > 0;
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: imgUrl, category: cat, current_price: price, current_stock_status: hasCart ? 'in_stock' : 'unknown', current_stock_quantity: null });
  });
  return prods;
}

const SCRAPERS = {
  nekonecno: scrapeNekonecno,
  ihrysko: scrapeIhrysko,
  xzone: scrapeXzone,
  dracik: scrapeDracik,
  pomposk: scrapePompoSk,
  pompocz: scrapePompoCz,
  bambule: scrapeBambule,
  knihydobrovsky: scrapeKnihy,
};

// ===== MAIN =====
async function main() {
  const { data: shops } = await supabase.from('shops').select('id, slug, name').eq('is_active', true);
  const sm = {}; shops.forEach(s => sm[s.slug] = { id: s.id, name: s.name });

  let totalProducts = 0, totalRestocks = 0;

  for (const [slug, fn] of Object.entries(SCRAPERS)) {
    if (!sm[slug]) continue;
    const shop = sm[slug];
    console.log(`Scraping ${shop.name}...`);
    try {
      const products = await fn(shop.id);
      console.log(`  ${products.length} products`);
      totalProducts += products.length;

      // Fix missing images for in-stock products
      for (const p of products) {
        if (!p.image_url && p.current_stock_status === 'in_stock') {
          try {
            const r = await fetch(p.url, { headers: H }); if (!r.ok) continue;
            const $ = cheerio.load(await r.text());
            let img = $('meta[property="og:image"]').attr('content') || $('[class*="gallery"] img, [class*="product"] img, .detail img').first().attr('src');
            if (img && !img.includes('data:')) { p.image_url = resolveUrl(img, new URL(p.url).origin); }
            await delay(800);
          } catch {}
        }
      }

      // Save to DB with restock detection
      for (const p of products) {
        const norm = p.name.toLowerCase().replace(/pokémon/g, 'pokemon').replace(/pokemon\s*tcg:?\s*/g, '').replace(/\s+/g, ' ').trim();
        const { data: existing } = await supabase.from('products')
          .select('id, current_stock_status, current_price, image_url')
          .eq('shop_id', p.shop_id).eq('url', p.url).single();

        if (existing) {
          // RESTOCK DETECTION
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

  // Send notifications for restocks
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
