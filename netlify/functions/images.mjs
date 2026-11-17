import { randomUUID } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { requireAdmin } from '../lib/auth.mjs';
import { error, json } from '../lib/http.mjs';

const store = getStore('nr-supply-catalog');
const maxImageBytes = 3_800_000;
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function imageKey(value) {
  return typeof value === 'string' && /^images-[0-9a-f-]+\.(?:jpg|png|webp)$/i.test(value);
}

export default async function handler(request) {
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const suppliedKey = url.searchParams.get('key') || url.pathname;
    const key = suppliedKey.split('/').filter(Boolean).at(-1);
    if (!imageKey(key)) return error('Imagem não encontrada.', 404);
    try {
      const entry = await store.getWithMetadata(key, { type: 'arrayBuffer', consistency: 'strong' });
      if (!entry) return error('Imagem não encontrada.', 404);
      const type = entry.metadata?.contentType;
      if (!allowedTypes.has(type)) return error('Formato de imagem não permitido.', 415);
      return new Response(entry.data, {
        headers: {
          'Content-Type': type,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch {
      return error('Não foi possível carregar a imagem.', 503);
    }
  }
  if (request.method !== 'POST') return error('Método não permitido.', 405);

  const { response } = await requireAdmin();
  if (response) return response;
  if (Number(request.headers.get('content-length') || 0) > maxImageBytes) return error('A imagem excede o limite de 3,8 MB.', 413);

  let file;
  try {
    const form = await request.formData();
    file = form.get('image');
  } catch {
    return error('Envie uma imagem válida.', 400);
  }
  if (!file || typeof file.arrayBuffer !== 'function' || !allowedTypes.has(file.type)) return error('Use uma imagem JPG, PNG ou WebP.', 415);
  if (!file.size || file.size > maxImageBytes) return error('A imagem excede o limite de 3,8 MB.', 413);

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const key = `images-${randomUUID()}.${extension}`;
  try {
    await store.set(key, await file.arrayBuffer(), {
      metadata: { contentType: file.type },
      onlyIfNew: true,
    });
    return json({ url: `/api/images/${key}` }, 201);
  } catch {
    return error('Não foi possível guardar a imagem no Netlify Blobs.', 503);
  }
}
