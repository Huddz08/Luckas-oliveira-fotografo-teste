# Como Luckas poderá editar o site

Este projeto é um site estático. Os conteúdos públicos ficam em arquivos JSON,
então não há necessidade de banco de dados para serviços, preços ou fotos.

## Preparação para o editor privado

1. Colocar esta versão do projeto em um repositório GitHub controlado por Luckas.
2. Dar acesso a ele a esse repositório (permissão de escrita), sem publicar senhas.
3. Entrar em https://app.pagescms.org/ usando a conta GitHub autorizada e selecionar o repositório.
4. O Pages CMS lerá o arquivo `.pages.yml` e mostrará as áreas de serviços, promoções, fundos, portfólio, depoimentos e a biografia de Luckas.
5. Configurar a hospedagem estática (Cloudflare Pages, por exemplo) conectada à branch de produção do GitHub. A pasta de saída é `dist`; não há comando de build obrigatório.

O editor do Pages CMS é um site separado da vitrine pública. Não existe painel administrativo nem senha administrativa dentro do HTML público. **A conexão do GitHub e o editor externo ainda não foram ativados; estas instruções são para a etapa de integração.**

## Regras dos conteúdos

- `dist/content/services.json`: cada objeto é um pacote. É possível incluir novos, ocultar antigos, trocar descrições/itens/preço e ativar a promoção individual com `promotion.active=true` e `promotion.price` menor que o preço comum. **Os preços e detalhes aparecem agora dentro da galeria correspondente em “Histórias em imagens”.**
- `dist/content/promotion.json`: `active=true` mostra o banner; `applyToAll=true` e `discountPercent` de 1 a 99 dão desconto geral nas tabelas. **Promoção individual tem preferência sobre desconto geral.**
- `dist/content/appearance.json`: substitui a imagem de abertura e a foto de fundo da seção da história.
- `dist/content/about.json`: edita o texto e a foto da seção “Sobre”. O retrato e os textos atuais são apenas ilustrativos. Para usar o retrato real, envie a foto de Luckas, desmarque `portraitIsIllustrative` e atualize a legenda. Preencha também a história real dele e remova a nota de texto provisório após validação.
- `dist/content/portfolio.json`: cada entrada corresponde a um serviço pelo campo `serviceId`, usando o mesmo `id` existente em `services.json`. Permite selecionar a foto de capa e adicionar, retirar, organizar ou substituir quantas fotos desejar na galeria daquele serviço. Ao criar um novo serviço, crie também sua entrada de galeria. As imagens de exemplo são ilustrativas, não trabalhos reais de Luckas.
- `dist/content/testimonials.json`: mantém os depoimentos, com nome, serviço, relato, retrato e visibilidade. A seção apresenta um relato por vez em um carrossel horizontal automático, com transições suaves, pausa e navegação manual; a posição da foto alterna entre os relatos. **Todos os três textos e retratos atuais são fictícios, criados exclusivamente como exemplos de layout. Não devem ser apresentados como avaliações verdadeiras.** Quando houver autorização dos clientes reais, substituir pelos depoimentos e retratos correspondentes; até lá, preservar o aviso de conteúdo ilustrativo.
- `dist/assets/`: arquivos de imagem enviados pelo editor. Fotos criadas para o protótipo devem ser substituídas por imagens autorizadas de Luckas antes de lançar o site.

Preços são valores em reais, sem símbolo (por exemplo, `350` equivale a R$ 350,00). Os pacotes foram preenchidos com os oito serviços fornecidos por Hudson.

## Limites importantes

- A área do cliente neste protótipo ainda é **simulada**. Código digitado em site estático não protege pasta do Google Drive. Para clientes reais, links precisam de permissões controladas no próprio Drive e/ou serviço autenticado.
- O formulário de orçamento abre uma conversa com Luckas pelo WhatsApp, com a mensagem preenchida; o visitante precisa revisar e tocar em enviar. Não é um sistema de captação ou armazenamento automático de contatos.
- A seção pública “Contato” tem botões diretos para Instagram e WhatsApp. Os dados de contato não aparecem como texto. O formulário ainda existe em outros pontos de solicitação de serviços.
- A agenda do Notion ainda não está integrada. Não se deve colocar chaves de integração do Notion no JavaScript público.
