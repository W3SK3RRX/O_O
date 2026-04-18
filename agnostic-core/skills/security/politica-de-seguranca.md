# Política de Segurança

Princípios que tendem a guiar projetos seguros — vale consultar ao definir as diretrizes
de segurança do seu projeto.

---

## Princípios fundamentais

**Least Privilege** — cada componente acessa apenas o mínimo necessário.
Se um serviço não precisa escrever no banco, ele não deve ter permissão de escrita.

**Defense in Depth** — não dependa de uma única camada de proteção.
Autenticação + validação + sanitização + monitoramento juntos são mais seguros
do que qualquer um isolado.

**Fail Secure** — em caso de erro, falhe sem expor dados ou abrir acesso.
Um erro de autenticação deve bloquear, não deixar passar.

**Zero Trust** — não confie por padrão, verifique sempre.
Isso vale para serviços internos também, não só para entradas externas.

---

## Padrões que costumam fazer sentido

- Autenticação em todos os endpoints que expõem dados privados
- HTTPS em produção
- Secrets em variáveis de ambiente, nunca no código
- Rate limiting em endpoints públicos (especialmente login e cadastro)
- Logs de auditoria para ações críticas (quem fez o quê e quando)
- Dependency scanning no CI/CD

---

## Coisas que raramente fazem sentido

- Credenciais hardcoded em qualquer lugar do código
- SQL construído com interpolação de string
- Dados sensíveis (senhas, tokens, CPF) em logs
- Stack trace exposto em respostas de produção
- CORS com wildcard (`*`) em produção

---

## Se um incidente acontecer

Uma abordagem comum:

1. Isolar o componente afetado
2. Notificar o responsável técnico
3. Preservar logs para análise
4. Revogar credenciais comprometidas
5. Documentar um post-mortem em até 48h

---

Ver também: `skills/security/api-hardening.md`, `skills/security/owasp-checklist.md`
