import { getUser, login, logout, verifyRequestOrigin } from '@netlify/identity';
import { error, json } from '../lib/http.mjs';

export default async function handler(request) {
  if (request.method !== 'POST') return error('Método não permitido.', 405);
  try {
    verifyRequestOrigin(request);
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password || password.length > 1024) return error('Informe email e senha.', 400);

    await login(email, password);
    const user = await getUser();
    if (!user || !Array.isArray(user.roles) || !user.roles.includes('admin')) {
      await logout();
      return error('Conta autenticada sem permissão de administrador.', 403);
    }
    return json({ authenticated: true, email: user.email });
  } catch {
    return error('Não foi possível entrar. Confira as credenciais e o papel admin no Netlify.', 401);
  }
}
