# Registro de alterações — NR Supply

## Correção do convite administrativo

- Incluído o tratamento do token de convite Identity na página inicial e no painel; novo usuário convidado consegue criar e confirmar a senha antes do login.
- Adicionado build do módulo de autenticação para o navegador na publicação do Netlify.

## Revisão visual e de catálogo

- Encurtada a mensagem automática de pedido no WhatsApp para destacar a NR Supply e manter apenas a peça, as opções escolhidas e a pergunta de disponibilidade.

- Aumentado o contraste permanente do botão de peças arquivadas e removidas as seleções interativas de tamanho/cor em itens Archived.
- Retirado “Standard” da peça do Essentials sem substituir por marca não confirmada; o campo de marca ficou opcional.

- Retirado o nível NR Index 111; o produto que estava classificado nele permanece sem classificação, sem atribuir uma categoria nova.
- Ligado o botão THE FEW ao canal do Instagram informado.
- Integrados banners desktop/mobile de Essentials, THE FEW, NR Index e Archived encontrados na pasta `public/banners-logo`.
- Mantida uma versão final recomendada: vitrine editorial atual e painel Netlify na mesma estrutura.

## Atualização de backend Netlify

- Conectada a vitrine à API pública do catálogo com fallback para o catálogo inicial estático.
- Criadas Functions para catálogo compartilhado, sessão, login, logout e armazenamento de imagens.
- Protegidas as gravações por Netlify Identity e papel `admin`; adicionado controle de origem em login/logout e prevenção de sobrescrita concorrente com ETag.
- Atualizado o painel para autenticar, salvar produtos/coleções no Netlify Blobs e enviar imagens comprimidas ao backend.
- Organizado o site em `public/`, fora da pasta das Functions, e incluídas dependências e configuração de publicação do Netlify.
- Mantidos pedidos por WhatsApp, catálogo e associações de imagens fornecidas; sem checkout online ou dados comerciais inventados.
- Identificados como pendentes: banners não fornecidos e confirmação de itens ativos em THE FEW.

## Redesign editorial

- Paleta off-white, madeira, cinza cimento, preto, branco e prata; navegação responsiva e seções Essentials, THE FEW, NR Index e Archived.
- O catálogo inicial preserva os 11 registros e os estados presentes no material original.
