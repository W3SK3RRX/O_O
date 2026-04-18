# API Hardening

Pontos de segurança que valem verificar ao expor endpoints de API.
Útil em code review de controllers ou ao revisar uma API antes de torná-la pública.

---

## Autenticação e Autorização

- Endpoints privados verificam token/sessão antes de qualquer operação
- JWT com expiração configurada (access token: até 24h; refresh token com rotação)
- Rate limiting por usuário e por IP
- Permissões verificadas após autenticação (autenticado ≠ autorizado)

## Validação de Entrada

- Todos os inputs sanitizados e validados (tipo, formato, tamanho)
- Payloads rejeitados acima de um limite razoável (ex: 10MB)
- SQL: prepared statements ou ORM (sem concatenação de string com input)
- XSS: outputs escapados em contextos HTML

## Headers de Segurança

- Content-Security-Policy configurado
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- HSTS habilitado
- CORS restrito a origens permitidas (sem wildcard em produção)
- X-Powered-By removido

## Exposição de Dados

- Stack trace não exposto em produção
- Dados sensíveis fora dos logs
- Responses padronizados sem estrutura interna exposta

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
