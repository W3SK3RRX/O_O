---
name: api-hardening
description: 'Hardening de endpoints: autenticacao, headers, rate limiting, validacao de input'
---

## Sinais que merecem atenção

- Endpoint sem validação de autenticação
- Query construída com interpolação de string de input
- Senha ou token retornado no corpo da resposta
- CORS com wildcard em ambiente de produção

---

## Referências

- OWASP API Security Top 10: https://owasp.org/API-Security/

Ver também: `skills/security/owasp-checklist.md`

