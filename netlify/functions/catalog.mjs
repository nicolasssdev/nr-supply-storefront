import { getStore } from '@netlify/blobs';
import { requireAdmin } from '../lib/auth.mjs';
import { error, json } from '../lib/http.mjs';

const store = getStore('nr-supply-catalog');
const catalogKey = 'catalog.json';
const defaultETag = '"static-default"';
const maxCatalogBytes = 4 * 1024 * 1024;

async function getCurrentCatalog(request) {
  const saved = await store.getWithMetadata(catalogKey, { type: 'json', consistency: 'strong' });
  if (saved) return { catalog: saved.data, etag: saved.etag, source: 'blobs' };

  const url = new URL('/products-data.json', request.url);
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error('Static catalog could not be loaded.');
  const catalog = await response.json();
  return { catalog, etag: defaultETag, source: 'defaults' };
}

function validImageReference(value) {
  return typeof value === 'string' && (
    /^imagens-[a-z0-9_-]+\/[a-z0-9._-]+\.(?:jpe?g|png|webp)$/i.test(value) ||
    /^\/?api\/images\/images-[0-9a-f-]+\.(?:jpe?g|png|webp)$/i.test(value)
  );
}

function validateCatalog(value) {
  if (!value || !Array.isArray(value.products) || !Array.isArray(value.catalogs)) return 'Formato de catálogo inválido.';
  if (value.products.length > 500 || value.catalogs.length > 100) return 'O catálogo excede o limite de itens.';
  const ids = new Set();
  for (const product of value.products) {
    if (!product || typeof product !== 'object') return 'Produto inválido.';
    if (typeof product.id !== 'string' || !product.id || product.id.length > 40 || ids.has(product.id)) return 'Código de produto inválido ou repetido.';
    ids.add(product.id);
    if (typeof product.piece !== 'string' || product.piece.length > 40) return 'SKU inválido.';
    if (typeof product.name !== 'string' || !product.name.trim() || product.name.length > 160) return 'Nome de produto inválido.';
    if (typeof product.brand !== 'string' || product.brand.length > 100) return 'Marca inválida.';
    if (product.price !== null && (!Number.isFinite(product.price) || product.price < 0)) return 'Preço inválido.';
    if (product.nrIndex !== null && (!product.nrIndex || !['333', '555', '777', '999'].includes(String(product.nrIndex.code)))) return 'NR Index inválido.';
    if (typeof product.archived !== 'boolean') return 'Estado do produto inválido.';
    if (!Array.isArray(product.images) || product.images.length < 1 || product.images.length > 16 || !product.images.every(validImageReference)) return 'Uma ou mais imagens não são válidas.';
    if (!Array.isArray(product.filterBrands) || product.filterBrands.some(item => typeof item !== 'string' || item.length > 80)) return 'Filtros inválidos.';
  }
  if (value.catalogs.some(item => typeof item !== 'string' || !item.trim() || item.length > 100)) return 'Nome de coleção inválido.';
  return null;
}

export default async function handler(request) {
  if (request.method === 'GET') {
    try {
      const result = await getCurrentCatalog(request);
      return json(result.catalog, 200, { ETag: result.etag, 'X-Catalog-Source': result.source });
    } catch {
      return error('Não foi possível carregar o catálogo.', 503);
    }
  }
  if (request.method !== 'PUT') return error('Método não permitido.', 405);

  const { response } = await requireAdmin();
  if (response) return response;
  const announcedLength = Number(request.headers.get('content-length') || 0);
  if (announcedLength > maxCatalogBytes) return error('O catálogo excede o tamanho permitido.', 413);

  let catalog;
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > maxCatalogBytes) return error('O catálogo excede o tamanho permitido.', 413);
    catalog = JSON.parse(raw);
  } catch {
    return error('O corpo enviado não é JSON válido.', 400);
  }
  const validationError = validateCatalog(catalog);
  if (validationError) return error(validationError, 400);

  const expectedETag = request.headers.get('if-match');
  try {
    const current = await store.getWithMetadata(catalogKey, { type: 'json', consistency: 'strong' });
    const actualETag = current?.etag || defaultETag;
    if (!expectedETag || expectedETag !== actualETag) return error('O catálogo mudou em outro painel. Recarregue e tente novamente.', 409);

    const result = current
      ? await store.setJSON(catalogKey, catalog, { onlyIfMatch: current.etag })
      : await store.setJSON(catalogKey, catalog, { onlyIfNew: true });
    if (!result.modified) return error('O catálogo mudou em outro painel. Recarregue e tente novamente.', 409);
    return json({ saved: true }, 200, { ETag: result.etag });
  } catch {
    return error('Não foi possível salvar o catálogo no Netlify Blobs.', 503);
  }
}
