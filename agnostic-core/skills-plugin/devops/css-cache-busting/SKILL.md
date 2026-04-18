---
name: css-cache-busting
description: 'Padrao ?v=X para CSS servido diretamente sem bundler: quando incrementar, diagnostico'
---

# CSS Cache Busting em Projetos Sem Bundler

## Problema

Em projetos que servem CSS diretamente (sem Vite, webpack ou Parcel), o browser cacheia o arquivo CSS com base na URL.
Se você alterar `styles.css` sem mudar a URL, usuários continuarão vendo a versão antiga — um bug invisível em produção.

```html
<!-- ERRADO: browser cacheia indefinidamente se ETag/Last-Modified não mudar -->
<link rel="stylesheet" href="/css/styles.css">

<!-- CORRETO: mudança na versão invalida o cache -->
<link rel="stylesheet" href="/css/styles.css?v=14">
```

## Quando Aplicar

Obrigatório em projetos com:
- CSS servido diretamente (sem hash de conteúdo no nome do arquivo)
- TailwindCSS via CDN
- Vanilla JS / HTML templates
- Projetos Node.js com `express.static`
- Qualquer stack onde o arquivo CSS não é renomeado no build

**Não necessário** com Vite, webpack `[contenthash]`, Next.js, Astro, Remix — bundlers fazem isso automaticamente.

## Protocolo

### 1. Centralizar a Versão

Um único ponto de controle — nunca disperso por múltiplos arquivos:

```js
// config/version.js
const CSS_VERSION = 14;
```

```html
<!-- index.html -->
<link rel="stylesheet" href="/css/main.css?v=14">
<link rel="stylesheet" href="/css/components.css?v=14">
```

### 2. Quando Incrementar

| Situação | Incrementar? |
|---|---|
| Mudança visual significativa (layout, cores, fontes) | ✅ Sim |
| Novo componente CSS adicionado | ✅ Sim |
| Remoção de regras obsoletas | ✅ Sim |
| Refactor interno sem mudança visual | ✅ Sim (precaução) |
| Fix de typo em texto (sem CSS) | ❌ Não |
| Mudança apenas em JS | ❌ Não |

### 3. Cache Busting Granular

Se um arquivo muda com muito mais frequência que outros:

```html
<!-- CSS base: muda raramente -->
<link rel="stylesheet" href="/css/base.css?v=3">

<!-- CSS de módulo: muda frequentemente -->
<link rel="stylesheet" href="/css/dashboard.css?v=22">
```

## Diagnóstico de CSS Stale em Produção

Sintomas:
- Estilos antigos aparecem para alguns usuários após deploy
- Mudanças de layout "somem" após deploy
- Versão local funciona, produção não

```bash
# Verificar versão sendo servida
curl -sI "https://seusite.com/css/styles.css?v=14" | grep -i last-modified
curl -s "https://seusite.com/css/styles.css?v=14" | head -5
```

Solução imediata para o usuário: **Ctrl+Shift+R** (hard reload sem cache).

## Referência Cruzada

- `skills/performance/caching-strategies.md` — estratégias de cache L1-L3
- `skills/frontend/css-governance.md` — governança de tokens CSS e escopo de seletores
- `skills/frontend/pwa-offline-patterns.md` — versionamento de cache de service worker

