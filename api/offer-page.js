/**
 * Ficha de una oferta de la landing (`/escuela/oferta/:slug`) con sus
 * etiquetas para compartir. WhatsApp, Facebook, LinkedIn o X no ejecutan
 * JavaScript: leen el HTML. Vercel envía aquí la ficha (ver `vercel.json`),
 * que sirve el `index.html` de la landing con el título, la descripción y la
 * miniatura de la oferta (la primera imagen del carrusel o, si no hay, la
 * portada); después la app arranca como siempre. Si la oferta no existe o la
 * API no responde, se sirve el `index.html` sin cambios.
 */
const API_BASE_URL =
  process.env.API_BASE_URL || 'https://itinerantes-backend-production.up.railway.app';
const SITE_NAME = 'Itinerantes del Agua';

const escapeHtml = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/** Primera imagen del carrusel; si no hay, la portada. */
function shareImage(offer) {
  return offer.carouselImageUrls?.[0] ?? offer.coverImageUrl ?? null;
}

/** Reemplaza (o agrega) `<meta {attr}="{key}" content="…">`. */
function setMeta(html, attr, key, value) {
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`;
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*\\/?>`);
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `${tag}</head>`);
}

const removeMeta = (html, attr, key) =>
  html.replace(new RegExp(`\\s*<meta\\s+${attr}="${key}"\\s+content="[^"]*"\\s*\\/?>`), '');

/** `index.html` con el título, la descripción, la URL y la imagen de la oferta. */
function withOfferMeta(html, offer, pageUrl, origin) {
  const title = `${offer.name} · ${SITE_NAME}`;
  const description = (offer.summary || offer.description || offer.name)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
  const image = shareImage(offer);

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${escapeHtml(pageUrl)}" />`,
    );
  out = setMeta(out, 'name', 'description', description);
  out = setMeta(out, 'property', 'og:url', pageUrl);
  out = setMeta(out, 'property', 'og:title', title);
  out = setMeta(out, 'property', 'og:description', description);
  out = setMeta(out, 'name', 'twitter:title', title);
  out = setMeta(out, 'name', 'twitter:description', description);
  if (image) {
    const imageUrl = new URL(image, origin).href;
    out = setMeta(out, 'property', 'og:image', imageUrl);
    out = setMeta(out, 'property', 'og:image:alt', offer.name);
    out = setMeta(out, 'name', 'twitter:image', imageUrl);
    // Las medidas eran las de la imagen genérica (1200×630).
    out = removeMeta(out, 'property', 'og:image:width');
    out = removeMeta(out, 'property', 'og:image:height');
  }
  return out;
}

async function fetchOffer(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/offers/${encodeURIComponent(slug)}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
}

async function handler(req, res) {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = `https://${host}`;
  const slug = String(req.query.slug || '');
  const pageUrl = `${origin}/escuela/oferta/${encodeURIComponent(slug)}`;

  // El index.html publicado (la cookie permite leerlo en despliegues protegidos).
  const [index, offer] = await Promise.all([
    fetch(`${origin}/index.html`, { headers: { cookie: req.headers.cookie || '' } }),
    slug ? fetchOffer(slug) : Promise.resolve(null),
  ]);
  if (!index.ok) {
    res.status(502).send('No se pudo cargar la página.');
    return;
  }
  const html = await index.text();

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // En la CDN 5 min (y viejo mientras se renueva): los cambios de la oferta llegan pronto.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  res.status(200).send(offer ? withOfferMeta(html, offer, pageUrl, origin) : html);
}

module.exports = handler;
module.exports.withOfferMeta = withOfferMeta;
