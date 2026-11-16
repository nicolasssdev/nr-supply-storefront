import { getUser } from '@netlify/identity';
import { error } from './http.mjs';

export async function requireAdmin() {
  let user;
  try {
    user = await getUser();
  } catch {
    return { user: null, response: error('Autenticação Netlify indisponível.', 503) };
  }
  if (!user) return { user: null, response: error('Entre com sua conta administrativa.', 401) };
  if (!Array.isArray(user.roles) || !user.roles.includes('admin')) {
    return { user: null, response: error('Esta conta não tem permissão de administração.', 403) };
  }
  return { user, response: null };
}
