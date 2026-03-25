const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept-Language': 'sk-SK,sk;q=0.9,cs;q=0.8',
};
const delay = ms => new Promise(r => setTimeout(r, ms));
const CZK_EUR = 0.04;

const EXCL = ['album','plyšov','plush','figúrk','figurk','tričk','t-shirt','mikin','hoodie','batoh','wallet','puzzle','keychain','mug','pillow','socks','cap','blanket','sleeve','toploader','deck box','ultra pro','playmat','podložka','podlozka','coin','dice','book','kniha','dvd','nintendo','ps4','xbox','lego','funko','pokeball','lamp','poster','sticker','bottle','bag','eraser','pencil','binder','obal','ochranné','protective','card sleeves','gumička','peračník','notes','zápisník','energy card','hracia podložka','herná podložka','acrylic','graded','psa ','bgs ','jumbo','oversized','promo card','pin ','trainer toolkit','na karty','kartová','mega construx','adventný','advent calendar','build & battle','league battle'];

function classify(name) {
  const l = name.toLowerCase();
  for (const k of EXCL) if (l.includes(k)) return null;
  if (!l.includes('pokemon') && !l.includes('pokémon')) return null;
  if (l.includes('elite trainer box') || /\betb\b/.test(l)) return 'etb';
  if (l.includes('booster bundle')) return 'booster_bundle';
  if ((l.includes('booster box') || l.includes('booster display')) && !l.includes('bundle')) return 'booster_box';
  if (l.includes('booster') && !l.includes('box') && !l.includes('bundle') && !l.includes('display')) return 'booster_pack';
  if (l.includes('collection') || l.includes('kolekcia') || l.match(/\btin\b/) || l.includes('blister') || l.includes('special') || l.includes('premium')) return 'collection_box';
  return 'unknown';
}

function parseP(t, czk) {
  const c = (t || '').replace(/[^\d,.\-]/g, '').replace(',', '.');
  const n = parseFloat(c);
  if (isNaN(n)) return null;
  return czk ? Math.round(n * CZK_EUR * 100) / 100 : n;
}

function stk(t) {
  const l = (t || '').toLowerCase();
  if (l.includes('ihneď') || l.includes('ihned') || l.includes('skladom') || l.includes('skladem') || l.includes('odosielame') || l.includes('posledn')) {
    const m = t.match(/(\d+)\s*ks/i);
    return { s: 'in_stock', q: m ? parseInt(m[1]) : null };
  }
  if (l.includes('na ceste') || l.includes('očakávame') || l.includes('předobjed') || l.includes('predobjed') || l.includes('pripravujeme')) return { s: 'preorder', q: null };
  if (l.includes('nedostupn') || l.includes('vypredané') || l.includes('vypredane') || l.includes('vyprodáno') || l.includes('nie je') || l.includes('objednáme') || l.includes('dlhodobo') || l.includes('momentálne')) return { s: 'out_of_stock', q: null };
  return { s: 'unknown', q: null };
}

async function scrapeNekonecno(shopId) {
  console.log('Scraping Nekonečno...');
  const prods = [];
  for (let pg = 1; pg <= 12; pg++) {
    const url = pg === 1 ? 'https://www.nekonecno.sk/pokemon-tcg/' : `https://www.nekonecno.sk/pokemon-tcg/strana-${pg}/`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) break;
    const $ = cheerio.load(await res.text());
    let found = 0;
    $('.product').each((_, el) => {
      const e = $(el);
      const name = e.find('[data-testid="productCardName"], a.name span').first().text().trim();
      const href = e.find('a.name, a.image').first().attr('href');
      if (!name || !href) return;
      const cat = classify(name);
      if (!cat) return;
      const img = e.find('.p a.image img, .p img').first().attr('src') || e.find('img').first().attr('data-src');
      const price = parseP(e.find('.price-final strong').text() || e.find('.prices strong').first().text(), false);
      const st = e.find('.availability').text().trim();
      const { s, q } = stk(st);
      prods.push({ shop_id: shopId, name, url: 'https://www.nekonecno.sk' + href, image_url: img || null, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
      found++;
    });
    if (found === 0 && pg > 1) break;
    await delay(2000);
  }
  console.log(`  ${prods.length} products`);
  return prods;
}

async function scrapeIhrysko(shopId) {
  console.log('Scraping iHrysko...');
  const prods = [];
  for (let pg = 1; pg <= 20; pg++) {
    const url = `https://www.ihrysko.sk/vyhladavanie?search=pokemon+tcg&page=${pg}`;
    const res = await fetch(url, { headers: H });
    if (!res.ok) break;
    const $ = cheerio.load(await res.text());
    let found = 0;
    $('.product-thumb').each((_, el) => {
      const e = $(el);
      const name = e.find('.product-thumb__name').text().trim();
      const href = e.find('.product-thumb__name a').attr('href') || e.find('a').first().attr('href');
      if (!name || !href) return;
      const cat = classify(name);
      if (!cat) return;
      let img = e.find('.product-thumb__img img').attr('data-src') || null;
      if (img && img.startsWith('//')) img = 'https:' + img;
      if (img && img.includes('loading')) img = null;
      const price = parseP(e.find('.product-thumb__price .actual-price').text() || e.find('.product-thumb__price').first().text(), false);
      const st = e.find('.product-thumb__availability').first().text().trim();
      const { s, q } = stk(st);
      prods.push({ shop_id: shopId, name, url: href, image_url: img, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
      found++;
    });
    if (found === 0 && pg > 1) break;
    await delay(2500);
  }
  console.log(`  ${prods.length} products`);
  return prods;
}

async function scrapeBambule(shopId) {
  console.log('Scraping Bambule...');
  const prods = [], seen = new Set();
  const res = await fetch('https://www.bambule.cz/pokemon-tcg', { headers: H });
  if (!res.ok) return prods;
  const $ = cheerio.load(await res.text());
  $('[class*="ProductCard"]').each((_, el) => {
    const e = $(el);
    const link = e.find('[class*="title"] a').first();
    const href = link.attr('href');
    const name = link.text().trim();
    if (!name || !href) return;
    const fullUrl = 'https://www.bambule.cz' + href;
    if (seen.has(fullUrl)) return;
    seen.add(fullUrl);
    const cat = classify(name);
    if (!cat) return;
    const srcset = e.find('img').first().attr('srcset') || '';
    const srcs = srcset.split(',').map(s => s.trim().split(' ')[0]).filter(s => s && !s.includes('data:'));
    const img = srcs.length > 0 ? srcs[srcs.length - 1] : null;
    const price = parseP(e.find('[class*="Price"]').first().text(), true);
    const st = e.find('[class*="Stock"]').first().text().trim();
    const { s, q } = stk(st);
    prods.push({ shop_id: shopId, name, url: fullUrl, image_url: img, category: cat, current_price: price, current_stock_status: s, current_stock_quantity: q });
  });
  console.log(`  ${prods.length} products`);
  return prods;
}

async function fixMissingImages(products) {
  const noImg = products.filter(p => !p.image_url && p.current_stock_status === 'in_stock');
  for (const p of noImg) {
    try {
      const res = await fetch(p.url, { headers: H });
      if (!res.ok) continue;
      const $ = cheerio.load(await res.text());
      let img = $('meta[property="og:image"]').attr('content')
        || $('[class*="gallery"] img, [class*="product"] img').first().attr('src');
      if (img && !img.includes('data:') && !img.includes('placeholder')) {
        if (!img.startsWith('http')) img = new URL(img, p.url).href;
        p.image_url = img;
      }
      await delay(1000);
    } catch {}
  }
}

async function main() {
  const { data: shops } = await supabase.from('shops').select('id, slug').eq('is_active', true);
  const sm = {};
  shops.forEach(s => sm[s.slug] = s.id);

  const all = [];
  if (sm.nekonecno) all.push(...await scrapeNekonecno(sm.nekonecno));
  if (sm.ihrysko) all.push(...await scrapeIhrysko(sm.ihrysko));
  if (sm.bambule) all.push(...await scrapeBambule(sm.bambule));

  console.log(`\nTotal: ${all.length} products`);

  // Fix missing images for in-stock products
  await fixMissingImages(all);

  let saved = 0, restocks = 0;
  for (const p of all) {
    const norm = p.name.toLowerCase().replace(/pokémon/g, 'pokemon').replace(/pokemon\s*tcg:?\s*/g, '').replace(/\s+/g, ' ').trim();

    // Check if product exists and detect restock
    const { data: existing } = await supabase.from('products')
      .select('id, current_stock_status, current_price')
      .eq('shop_id', p.shop_id).eq('url', p.url).single();

    if (existing) {
      // Detect restock: was out_of_stock, now in_stock
      if (existing.current_stock_status !== 'in_stock' && p.current_stock_status === 'in_stock') {
        await supabase.from('stock_transitions').insert({
          product_id: existing.id,
          previous_status: existing.current_stock_status,
          new_status: 'in_stock',
          previous_price: existing.current_price,
          new_price: p.current_price,
        });
        restocks++;
        console.log(`  RESTOCK: ${p.name.substring(0, 50)}`);
      }
      // Update product
      await supabase.from('products').update({
        name: p.name, current_price: p.current_price, current_stock_status: p.current_stock_status,
        current_stock_quantity: p.current_stock_quantity, image_url: p.image_url || existing.image_url,
        last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        last_in_stock_at: p.current_stock_status === 'in_stock' ? new Date().toISOString() : undefined,
      }).eq('id', existing.id);
    } else {
      // New product
      await supabase.from('products').insert({
        ...p, normalized_name: norm, is_tracked: true,
        last_seen_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        last_in_stock_at: p.current_stock_status === 'in_stock' ? new Date().toISOString() : null,
      });
    }
    saved++;
  }

  // Process notifications for restocks
  if (restocks > 0) {
    const { data: transitions } = await supabase.from('stock_transitions')
      .select('*, product:products(*)')
      .eq('notification_sent', false).eq('new_status', 'in_stock');

    for (const t of (transitions || [])) {
      if (!t.product) continue;
      const { data: users } = await supabase.from('profiles').select('id').eq('notify_in_app', true);
      const notifs = (users || []).map(u => ({
        user_id: u.id, type: 'restock',
        title: `${t.product.name} je skladom!`,
        body: `Produkt je dostupný za ${t.product.current_price ? t.product.current_price + ' €' : 'neuvedená cena'}.`,
        product_id: t.product.id,
      }));
      if (notifs.length > 0) await supabase.from('notifications').insert(notifs);
      await supabase.from('stock_transitions').update({ notification_sent: true }).eq('id', t.id);
    }
  }

  console.log(`\nSaved: ${saved} | Restocks detected: ${restocks}`);
}

main().catch(e => { console.error(e); process.exit(1); });
