# NR Supply — storefront e administração

Projeto editorial da NR Supply preparado para publicação no Netlify. A vitrine mantém pedidos por WhatsApp; não há checkout nem pagamento online.

## Estrutura

- `public/index.html`: vitrine responsiva, detalhes de produtos, Essentials, THE FEW, NR Index e estados Archived.
- `public/admin.html`: painel autenticado para produtos, preços, imagens e coleções.
- `public/products-data.json` e `public/products-data.js`: catálogo inicial usado como fallback e para restaurar os dados publicados inicialmente.
- `public/imagens-*` e `public/banners-logo`: fotografias de produtos, logomarca e banners de desktop/mobile.
- `netlify/functions`: rotas de catálogo, sessão, login/logout e imagens.
- Netlify Blobs: armazenamento compartilhado e persistente de catálogo e imagens enviadas.

## Publicar no Netlify

1. Publique esta pasta como um projeto Netlify conectado a um repositório Git, ou publique com o Netlify CLI. O envio simples de arquivos estáticos (Netlify Drop) não instala nem executa as Functions.
2. O Netlify instala as dependências de `package.json` e usa `netlify.toml` (publicação da pasta `public` e funções na pasta `netlify/functions`). Node 22 ou superior é necessário.
3. No painel Netlify do site, habilite Netlify Identity e configure o cadastro como somente por convite. Cadastre/conclua a conta administrativa pelo fluxo de Identity do seu site. A página atual agora processa o token do convite, pede a criação de uma senha e encaminha para o painel. Publique esta atualização antes de reenviar um convite que tenha redirecionado sem pedir senha.
4. Atribua a esse usuário o papel `admin` no Netlify Identity (campo de papéis/roles do usuário) e entre em `/admin.html`. O papel é conferido no servidor para qualquer gravação ou envio de imagem. Alterações de papel passam a valer quando o usuário entrar novamente ou renovar a sessão.

O catálogo publicado inicialmente aparece na vitrine mesmo antes da primeira gravação. Ao salvar no painel, o catálogo passa a ser compartilhado pelo Netlify Blobs e permanece entre publicações. As fotos enviadas pelo painel ficam nesse armazenamento, com limite de 3,8 MB por arquivo após compressão. Configure o domínio HTTPS do site como origem normal para login.

## Administração

O painel permite criar/editar/excluir produto, editar preço e informações, adicionar imagens, criar coleções, importar/exportar backup JSON e restaurar o catálogo inicial. Alterações de produto ficam públicas depois de salvas. Edições simultâneas são protegidas por versão e pedem recarga se outro administrador gravar primeiro. Não invente valores ou dados de produto: campos não confirmados podem permanecer vazios.

As imagens associadas no catálogo original são mantidas; imagens novas são explicitamente enviadas pelo administrador. Os banners fornecidos estão integrados nas seções de catálogo, THE FEW, NR Index e Archived. O catálogo inicial possui 11 registros (1 ativo e 10 Archived); o código 111 foi removido do sistema NR Index e a peça que o usava ficou sem classificação confirmada; o conteúdo ainda não confirma peça rara ativa para THE FEW.

## Desenvolvimento local

Para visualizar as páginas, use um servidor local. As Netlify Functions e o Netlify Blobs exigem execução no Netlify; a autenticação Identity não é simulada pelo `netlify dev`. A integração deve ser validada no deploy conectado ao site Netlify.
