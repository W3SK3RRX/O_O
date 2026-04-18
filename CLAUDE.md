# Chat — Fullstack

Stack: Node.js + Express 5 + MongoDB (Mongoose) + Socket.io | React 19 + Vite + Zustand
Submodulo: agnostic-core/

---

## Agnostic Core

Diretório: `agnostic-core/`

**Antes de qualquer tarefa, leia a skill relevante.** Este repositório é a referência obrigatória para padrões, decisões técnicas e boas práticas do projeto.

| Tarefa | Skill |
|--------|-------|
| API/Backend | `agnostic-core/skills/backend/rest-api-design.md` |
| Error handling | `agnostic-core/skills/backend/error-handling.md` |
| Node.js patterns | `agnostic-core/skills/nodejs/nodejs-patterns.md` |
| Express | `agnostic-core/skills/nodejs/express-best-practices.md` |
| Segurança de API | `agnostic-core/skills/security/api-hardening.md` |
| OWASP | `agnostic-core/skills/security/owasp-checklist.md` |
| Banco de dados | `agnostic-core/skills/database/query-compliance.md` |
| Schema design | `agnostic-core/skills/database/schema-design.md` |
| Frontend / HTML / CSS | `agnostic-core/skills/frontend/html-css-audit.md` |
| Acessibilidade | `agnostic-core/skills/frontend/accessibility.md` |
| UX Guidelines | `agnostic-core/skills/frontend/ux-guidelines.md` |
| Testes | `agnostic-core/skills/testing/` |
| Performance | `agnostic-core/skills/performance/performance-audit.md` |
| Debugging | `agnostic-core/skills/audit/systematic-debugging.md` |
| Commits / Git | `agnostic-core/skills/git/commit-conventions.md` |
| Deploy | `agnostic-core/skills/devops/deploy-procedures.md` |
| Documentação | `agnostic-core/skills/documentation/technical-docs.md` |

---

## Estrutura do Projeto

```
chat/
├── agnostic-core/          # Base de conhecimento e padrões
├── mensagens-backend/      # API REST + WebSocket (Node.js/Express)
│   └── src/
├── mensagens-frontend/     # SPA (React 19 + Vite)
│   └── src/
├── docker-compose.yml
└── nginx.conf
```

---

## Convenções do Projeto

- **Backend:** Node.js (ESM) + Express 5 + Mongoose 9 + Socket.io 4
- **Frontend:** React 19 + Vite 7 + Zustand 5 + Socket.io-client 4
- **Banco:** MongoDB via Mongoose
- **Auth:** JWT (jsonwebtoken) + bcryptjs + cookie-parser
- **Validação:** Zod
- **Logs:** Pino + pino-pretty
- **Rate limiting:** express-rate-limit
- **Deploy:** Docker + Nginx
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, etc.)
- **Branch principal:** `main`

---

## Agents Disponíveis

```
Security Reviewer:   agnostic-core/agents/reviewers/security-reviewer.md
Frontend Reviewer:   agnostic-core/agents/reviewers/frontend-reviewer.md
Code Inspector:      agnostic-core/agents/reviewers/code-inspector.md
Performance Review:  agnostic-core/agents/reviewers/performance-reviewer.md
DevOps Engineer:     agnostic-core/agents/specialists/devops-engineer.md
Database Architect:  agnostic-core/agents/specialists/database-architect.md
```

---

## Antes de Fazer Deploy

- `agnostic-core/skills/devops/pre-deploy-checklist.md`
- `agnostic-core/skills/security/owasp-checklist.md`

---

## Regras Críticas

1. **Sempre leia o agnostic-core antes de qualquer alteração** — use a tabela acima para encontrar a skill correta
2. Nunca escreva código de segurança/auth sem antes ler `agnostic-core/skills/security/`
3. Nunca faça deploy sem o pre-deploy checklist
4. Mantenha o `agnostic-core/` atualizado ao clonar: copie novamente sem o `.git`
