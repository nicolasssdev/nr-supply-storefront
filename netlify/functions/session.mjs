import { requireAdmin } from '../lib/auth.mjs';
import { error, json } from '../lib/http.mjs';

export default async function handler(request) {
  if (request.method !== 'GET') return error('Método não permitido.', 405);
  const { user, response } = await requireAdmin();
  if (response) return response;
  return json({ authenticated: true, email: user.email });
}
