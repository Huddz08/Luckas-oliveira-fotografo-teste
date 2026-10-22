# Luckas Oliveira — Fotografia

Site editorial de fotografia em português, com identidade cinza-grafite, responsivo e sem dependências de compilação.

## O que está disponível nesta versão

- Apresentação, galerias ilustrativas por serviço e informações de pacotes e preços.
- Promoções gerais ou específicas por serviço.
- Depoimentos fictícios identificados como ilustrativos e biografia provisória editável.
- Botões de Instagram e WhatsApp, sem exibir os dados de contato em texto.
- Formulário opcional de consulta de serviços que **abre o WhatsApp** com mensagem preenchida. Não envia e-mail nem armazena mensagens.
- Área do cliente **apenas demonstrativa**, usando o código `LUCKAS2026` e fotos fictícias. Não fornece autenticação nem acesso real ao Google Drive.

**Não use esta versão para fotos particulares, senhas, links privados de clientes ou dados pessoais.** O site publicado no GitHub Pages pode ser acessado por qualquer pessoa que conheça ou descubra o endereço, mesmo que a intenção inicial seja apenas mostrar uma prévia ao Luckas.

## Publicação de avaliação no GitHub Pages

Este repositório já inclui o fluxo de publicação automática em `.github/workflows/publicar-site.yml`. Ele publica somente a pasta `dist/`, que contém o site pronto. Assim, os arquivos de configuração do editor e o restante do código podem continuar organizados no repositório.

1. Criar um repositório **público**, preferencialmente com o nome `luckas-oliveira-site`, na conta GitHub que vai administrar esta versão de avaliação.
2. Enviar os arquivos deste projeto, preservando a pasta `dist/`, `.pages.yml` e `.github/workflows/`.
3. Em **Settings → Pages → Build and deployment → Source**, selecionar **GitHub Actions**.
4. Conferir a execução **Actions → Publicar site de avaliação**. Quando terminar com sucesso, o GitHub Pages exibirá a URL publicada.
5. Qualquer atualização enviada à branch `main` executará o fluxo novamente. Não é preciso copiar manualmente o conteúdo de `dist/` para a raiz.

### Edição por Luckas (etapa seguinte)

O arquivo `.pages.yml` está preparado para o [Pages CMS](https://pagescms.org/), mas a integração ainda **não está ativa**. Quando houver repositório definitivo, autorizar o editor pelo GitHub e testar uma alteração de preço e imagem. Instruções detalhadas: [EDITANDO-O-SITE.md](EDITANDO-O-SITE.md).

### Transferir a propriedade depois

O repositório poderá ser transferido para a conta GitHub de Luckas quando ele estiver pronto para assumir a administração. Após a transferência, será necessário conferir as permissões, a configuração do Pages, a URL e o acesso do Pages CMS. Não publique dados privados no histórico do repositório.

## Estrutura

```text
.github/workflows/publicar-site.yml  # publicação automatizada
.pages.yml                           # estrutura do editor futuro
dist/index.html                      # entrada do site
dist/app.js                          # comportamento do site
dist/styles.css, dist/graphite.css   # estilos
dist/assets/                        # fotos ilustrativas e logomarca
dist/content/                       # pacotes, galerias, fundos e textos
```

As fotografias e depoimentos demonstrativos devem ser substituídos por conteúdo real autorizado antes do lançamento comercial. A integração privada com Google Drive, a autenticação de clientes e qualquer eventual agenda ficam para etapas posteriores.
