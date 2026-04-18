---
title: PWA Offline Patterns
description: Service worker, cache de shell, o que nunca cachear (dados sensíveis) e manifest.json para Progressive Web Apps
category: frontend
tags: [pwa, service-worker, offline, cache, mobile]
---

# PWA Offline Patterns

## Princípio Central

**Cache o shell, nunca os dados sensíveis.**

O service worker deve permitir que o app funcione offline para navegação básica.
Dados financeiros, tokens de sessão e PII nunca entram no cache do browser.

## O que Cachear

| Tipo | Estratégia | Exemplo |
|---|---|---|
| App shell (HTML/CSS/JS) | Cache-first | `index.html`, `app.css`, `app.js` |
| Fontes e ícones | Cache-first com expiração longa | Google Fonts, Font Awesome |
| Imagens estáticas | Stale-while-revalidate | Logos, ilustrações |
| API de dados | Network-first com fallback | `/api/user`, `/api/products` |
| Dados financeiros | **NUNCA cachear** | Saldos, transações, recibos |
| Tokens de sessão | **NUNCA cachear** | JWT, cookies, `Authorization` headers |
| PII | **NUNCA cachear** | CPF, endereço, dados de cartão |

## Service Worker — Estrutura Mínima

```js
// sw.js
const CACHE_NAME = 'app-shell-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/js/app.js',
  '/manifest.json',
  '/icons/icon-192.png'
];

// Instalar: cachear shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS))
  );
  self.skipWaiting();
});

// Ativar: limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: shell do cache, API da rede
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // NUNCA interceptar chamadas de API com dados sensíveis
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
```

## manifest.json — Campos Obrigatórios

```json
{
  "name": "Nome Completo do App",
  "short_name": "NomeApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

## Checklist de PWA

### Funcionalidade Offline
- [ ] App carrega sem internet (tela offline com mensagem clara)
- [ ] Formulários offline ficam em fila — não perdem dados
- [ ] Status de conexão visível (online/offline indicator)

### Segurança de Cache
- [ ] Nenhum dado financeiro em `localStorage`, `sessionStorage` ou cache de SW
- [ ] Tokens de autenticação nunca em cache de SW
- [ ] Logs de auditoria nunca em cache local

### Instalabilidade
- [ ] `manifest.json` com todos os campos obrigatórios
- [ ] HTTPS obrigatório (SW não funciona em HTTP — exceto localhost)
- [ ] Ícones 192px e 512px presentes e acessíveis

### Performance
- [ ] Shell cacheado no install → primeira visita rápida, segunda instantânea
- [ ] `CACHE_NAME` atualizado a cada deploy significativo
- [ ] Caches antigos removidos no evento `activate`

## Anti-Padrões

| Anti-padrão | Risco | Correção |
|---|---|---|
| `cache.addAll(apiRoutes)` | Expõe dados sensíveis offline | Cachear apenas shell assets |
| SW sem limpeza no activate | Cache cresce indefinidamente | Deletar versões antigas no activate |
| `skipWaiting` sem `clients.claim` | Nova versão não assume controle | Usar ambos juntos |
| SW em HTTP em produção | SW silenciosamente ignorado | HTTPS obrigatório |
| Cache de token JWT | Sessão nunca expira, risco de sequestro | Nunca cachear tokens |

## Referência Cruzada

- `skills/performance/caching-strategies.md` — estratégias de cache L1-L3
- `skills/security/api-hardening.md` — segurança de tokens e sessões
- `skills/devops/css-cache-busting.md` — versionamento de assets sem bundler
