---
name: politica-de-seguranca
description: 'Principios para projetos seguros: diretrizes, politicas, governanca'
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

