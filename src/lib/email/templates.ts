export function restockEmailTemplate(
  productName: string,
  shopName: string,
  price: number | null,
  productUrl: string,
  siteUrl: string
): string {
  const priceText = price ? `${price} €` : 'neuvedená cena'

  return `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a1a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#a855f7;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">PokéSklad</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#ffffff;margin:0 0 16px 0;font-size:20px;">Produkt je opäť skladom!</h2>
              <p style="color:#d1d5db;font-size:16px;line-height:1.6;margin:0 0 8px 0;">
                <strong style="color:#a855f7;">${productName}</strong>
              </p>
              <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 4px 0;">
                Obchod: <strong style="color:#ffffff;">${shopName}</strong>
              </p>
              <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
                Cena: <strong style="color:#ffffff;">${priceText}</strong>
              </p>
              <a href="${productUrl}" style="display:inline-block;background-color:#a855f7;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:bold;">
                Zobraziť produkt
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #2a2a3e;">
              <p style="color:#6b7280;font-size:12px;margin:0;line-height:1.5;">
                Tento email ste dostali, pretože máte zapnuté emailové notifikácie na
                <a href="${siteUrl}" style="color:#a855f7;text-decoration:none;">PokéSklad</a>.
                Pre odhlásenie z emailov upravte nastavenia vo svojom profile.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function priceDropEmailTemplate(
  productName: string,
  shopName: string,
  oldPrice: number,
  newPrice: number,
  productUrl: string,
  siteUrl: string
): string {
  const savings = Math.round((oldPrice - newPrice) * 100) / 100
  const pctOff = Math.round((savings / oldPrice) * 100)

  return `<!DOCTYPE html>
<html lang="sk">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#0a0a1a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1a1a2e;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background-color:#a855f7;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">PokéSklad</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#ffffff;margin:0 0 16px 0;font-size:20px;">Zníženie ceny!</h2>
              <p style="color:#d1d5db;font-size:16px;line-height:1.6;margin:0 0 8px 0;">
                <strong style="color:#a855f7;">${productName}</strong>
              </p>
              <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 4px 0;">
                Obchod: <strong style="color:#ffffff;">${shopName}</strong>
              </p>
              <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 4px 0;">
                Pôvodná cena: <span style="color:#9ca3af;text-decoration:line-through;">${oldPrice} €</span>
              </p>
              <p style="color:#d1d5db;font-size:14px;line-height:1.6;margin:0 0 4px 0;">
                Nová cena: <strong style="color:#22c55e;font-size:18px;">${newPrice} €</strong>
              </p>
              <p style="color:#22c55e;font-size:14px;line-height:1.6;margin:0 0 24px 0;">
                Ušetríte ${savings} € (${pctOff}%)
              </p>
              <a href="${productUrl}" style="display:inline-block;background-color:#a855f7;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:16px;font-weight:bold;">
                Zobraziť produkt
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #2a2a3e;">
              <p style="color:#6b7280;font-size:12px;margin:0;line-height:1.5;">
                Tento email ste dostali, pretože máte zapnuté emailové notifikácie na
                <a href="${siteUrl}" style="color:#a855f7;text-decoration:none;">PokéSklad</a>.
                Pre odhlásenie z emailov upravte nastavenia vo svojom profile.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
