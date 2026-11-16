import { acceptInvite, handleAuthCallback } from '@netlify/identity';

(async () => {
  const invitePanel = document.getElementById('invite-panel');
  const loginPanel = document.getElementById('login-panel');
  const adminApp = document.getElementById('admin-app');
  const tokenKey = 'nr-supply-pending-invite';
  try {
    const result = await handleAuthCallback();
    if (result?.type === 'invite' && result.token) {
      if (!invitePanel) {
        sessionStorage.setItem(tokenKey, result.token);
        location.replace('/admin.html');
        return;
      }
      sessionStorage.setItem(tokenKey, result.token);
    }
  } catch (error) {
    if (invitePanel) {
      invitePanel.hidden = false;
      document.getElementById('invite-status').textContent = 'Não foi possível validar o convite. Peça um novo convite no Netlify.';
    }
    return;
  }

  const token = sessionStorage.getItem(tokenKey);
  if (!token || !invitePanel) return;
  invitePanel.hidden = false;
  if (loginPanel) loginPanel.hidden = true;
  if (adminApp) adminApp.hidden = true;
  document.getElementById('invite-form').addEventListener('submit', async event => {
    event.preventDefault();
    const password = document.getElementById('invite-password').value;
    const confirmation = document.getElementById('invite-password-confirm').value;
    const status = document.getElementById('invite-status');
    if (password.length < 8) { status.textContent = 'Use uma senha com pelo menos 8 caracteres.'; return; }
    if (password !== confirmation) { status.textContent = 'As senhas não coincidem.'; return; }
    status.textContent = 'Criando sua senha…';
    try {
      await acceptInvite(token, password);
      sessionStorage.removeItem(tokenKey);
      status.textContent = 'Senha criada. Entre no painel com seu e-mail e a senha escolhida.';
      invitePanel.hidden = true;
      if (loginPanel) loginPanel.hidden = false;
      document.getElementById('login-status').textContent = status.textContent;
    } catch (_) {
      status.textContent = 'O convite expirou ou já foi usado. Peça um novo convite no Netlify.';
    }
  });
})();
