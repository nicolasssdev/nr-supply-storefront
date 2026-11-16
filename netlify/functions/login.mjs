import { login, verifyRequestOrigin } from '@netlify/identity';
import { error, json } from '../lib/http.mjs';

export default async function handler(request) {
  if (request.method !== 'POST') return error('Método não permitido.', 405);
  try {
    verifyRequestOrigin(request);
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password || password.length > 1024) return error('Informe email e senha.', 400);

    // The role check runs on the following authenticated request, after the
    // Netlify runtime has attached the newly issued session cookies.
    await login(email, password);
    return json({ authenticated: true });
  } catch {
    return error('Não foi possível entrar. Confira as credenciais no Netlify Identity.', 401);
  }
}
