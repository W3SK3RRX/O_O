# OWASP Checklist — Segurança de Aplicações Web

Referência baseada no OWASP Top 10 2021. Útil para revisar a postura de segurança de uma
aplicação web ou API — seja em code review, auditoria de projeto existente ou avaliação de
um novo módulo.

---

Autenticacao e Controle de Acesso
- [ ] Todas as rotas privadas validam sessao/token antes de qualquer operacao
- [ ] Retorna 401 quando nao autenticado
- [ ] Retorna 403 quando autenticado sem permissao
- [ ] Funcoes administrativas verificam papel de admin separadamente
- [ ] Sem escalacao de privilegios (usuario comum nao acessa dados de outro)

Injecao (SQL / NoSQL)
- [ ] Queries usam parametros ou ORM (sem concatenacao de string com input)
- [ ] Tipos de entrada validados antes de usar em queries
- [ ] Operadores perigosos desabilitados (ex: $where em MongoDB)
- [ ] Mongoose/ORM com schema de validacao ativo

XSS - Cross-Site Scripting
- [ ] textContent usado em vez de innerHTML para dados do usuario
- [ ] Outputs em HTML escapados no backend
- [ ] Content-Security-Policy configurado
- [ ] Bibliotecas de sanitizacao usadas quando HTML e necessario

Validacao de Entrada
- [ ] Todos os campos validados por tipo (string, number, boolean)
- [ ] Ranges verificados (valores minimos e maximos)
- [ ] Formatos validados (email, data, telefone)
- [ ] Whitelist de valores aceitos (nao blacklist)
- [ ] Payloads limitados por tamanho (ex: 10MB maximo)

Exposicao de Dados Sensiveis
- [ ] Senhas nunca retornadas nas respostas (mesmo com hash)
- [ ] Tokens e secrets removidos antes de enviar response
- [ ] Dados pessoais fora dos logs
- [ ] Stack trace oculto em producao
- [ ] Mensagens de erro genericas para o cliente

Rate Limiting
- [ ] Endpoints criticos com limite de requests por IP
- [ ] Limite por usuario autenticado nos endpoints de escrita
- [ ] Retorna 429 Too Many Requests quando limite atingido
- [ ] Backoff exponencial recomendado para clientes

Seguranca de Sessao / Cookie
- [ ] httpOnly: true (previne acesso via JavaScript)
- [ ] secure: true em producao (HTTPS obrigatorio)
- [ ] sameSite: lax ou strict configurado
- [ ] Timeout de sessao definido (ex: 24h)
- [ ] Rotacao de session ID apos login

Headers de Seguranca
- [ ] Content-Security-Policy configurado
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] HSTS habilitado em producao
- [ ] X-Powered-By removido
- [ ] CORS restrito a origens da whitelist

Dependencias e CSRF
- [ ] npm audit / pip check executado regularmente
- [ ] Dependencias sem vulnerabilidades conhecidas (CVSS alto)
- [ ] Endpoints de escrita validam CSRF token quando aplicavel

Logging e Auditoria
- [ ] Acoes sensiveis logadas: quem, quando, o que (sem dados pessoais)
- [ ] Logs com nivel adequado (info/warn/error)
- [ ] IP e user-agent incluidos em logs de seguranca
- [ ] Alertas configurados para erros 401/403 repetidos

Sinais de alto risco
- Endpoint sem validação de autenticação → risco crítico
- Concatenação de input em query de banco → risco crítico (injeção)
- innerHTML com dados do usuário → risco crítico (XSS)
- Senha ou token no corpo da resposta → risco crítico
- Stack trace retornado em produção → risco alto
- Sem rate limiting em endpoint público → risco alto
- Session cookie sem httpOnly → risco alto

Ferramentas
- npm audit (Node.js)
- pip check && safety check (Python)
- helmet (Express.js): configura headers automaticamente
- express-rate-limit: rate limiting por IP
- sanitize-html: sanitizacao de HTML

Referencias
- OWASP Top 10 2021: https://owasp.org/Top10/
- OWASP API Security: https://owasp.org/API-Security/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
