import { logout, verifyRequestOrigin } from '@netlify/identity';
import { error, json } from '../lib/http.mjs';

export default async function handler(request) {
  if (request.method !== 'POST') return error('Método não permitido.', 405);
  try {
    verifyRequestOrigin(request);
    await logout();
    return json({ authenticated: false });
  } catch {
    return error('Não foi possível encerrar a sessão.', 400);
  }
}
