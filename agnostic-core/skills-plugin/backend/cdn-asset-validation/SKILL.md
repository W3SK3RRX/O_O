---
name: cdn-asset-validation
description: 'Detectar soft-404 em CDNs externas (HTTP 200 com corpo vazio) via curl -sI'
---

## Como detectar

```bash
# Correto: verificar content-length no HTTP/2
curl -sI https://example-cdn.com/path/to/asset.png
```

O que observar na resposta:
```
HTTP/2 200
content-length: 0        ← soft-404: asset existe mas está vazio
content-length: 48291    ← OK: asset tem conteúdo
```

**Atenção:** HTTP/1.1 pode omitir `content-length` com chunked encoding.
Sempre use HTTP/2 (`curl -sI`) para diagnóstico confiável.

---

## Regra de diagnóstico

Antes de investigar CORS, CSP, Vercel rewrites ou configuração de servidor:

1. Copie a URL do asset que está falhando
2. Execute `curl -sI <url>` e verifique `content-length`
3. Se `content-length: 0` → o problema é na CDN, não na sua aplicação

---

## Quando isso ocorre

- CDNs que reorganizam estrutura de pastas sem redirecionar URLs antigas
- Assets de terceiros com URLs que mudam sem aviso (ex: APIs de esportes, players, etc.)
- Ambientes de staging com assets incompletos

---

## Estratégia de fallback

```tsx
// React: fallback explícito para imagem com soft-404
<img
  src={primaryUrl}
  onError={(e) => {
    e.currentTarget.src = fallbackUrl
    e.currentTarget.onerror = null // evita loop
  }}
/>
```

---

## Ver também

- `skills/devops/eruda-mobile-debug.md` — debug de erros silenciosos em mobile
- `skills/audit/systematic-debugging.md` — debugging sistemático
- `skills/security/api-hardening.md` — validação de recursos externos

