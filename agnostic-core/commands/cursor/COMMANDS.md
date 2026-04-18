Cursor Commands

Commands e regras para uso do agnostic-core com Cursor IDE.

---

.CURSORRULES (adicionar ao projeto)

Crie o arquivo `.cursorrules` na raiz do projeto com o conteudo abaixo.
Substitua os caminhos pelas skills relevantes para o seu stack.

---

Antes de implementar qualquer coisa:
1. Verifique se ja existe codigo similar (evite duplicacao)
2. Aplique a skill relevante de .agnostic-core/ para o dominio da tarefa
3. Siga as convencoes de codigo documentadas em CLAUDE.md

Skills disponiveis:
- Seguranca de API:      .agnostic-core/skills/security/api-hardening.md
- OWASP checklist:       .agnostic-core/skills/security/owasp-checklist.md
- Frontend / HTML-CSS:   .agnostic-core/skills/frontend/html-css-audit.md
- Acessibilidade:        .agnostic-core/skills/frontend/accessibility.md
- UX Guidelines:         .agnostic-core/skills/frontend/ux-guidelines.md
- CSS Governance:        .agnostic-core/skills/frontend/css-governance.md
- REST API design:       .agnostic-core/skills/backend/rest-api-design.md
- Error handling:        .agnostic-core/skills/backend/error-handling.md
- Testes unitarios:      .agnostic-core/skills/testing/unit-testing.md
- TDD workflow:          .agnostic-core/skills/testing/tdd-workflow.md
- Banco de dados:        .agnostic-core/skills/database/query-compliance.md
- Performance:           .agnostic-core/skills/performance/performance-audit.md
- Caching:               .agnostic-core/skills/performance/caching-strategies.md
- Commits:               .agnostic-core/skills/git/commit-conventions.md
- Pre-deploy:            .agnostic-core/skills/devops/pre-deploy-checklist.md
- Node.js:               .agnostic-core/skills/nodejs/nodejs-patterns.md
- Express:               .agnostic-core/skills/nodejs/express-best-practices.md
- Python:                .agnostic-core/skills/python/python-patterns.md
- AI integration:        .agnostic-core/skills/ai/ai-integration-patterns.md

Antes de fazer deploy, siga obrigatoriamente:
.agnostic-core/compliance/checklists/pre-deploy.md

---

PROMPTS DE CHAT (copie e use no Cursor Chat)

Security Review:
Use .agnostic-core/skills/security/api-hardening.md e .agnostic-core/skills/security/owasp-checklist.md
Revise os arquivos em [PASTA] e liste todos os problemas por severidade (CRITICA/ALTA/MEDIA/BAIXA).

Test Coverage:
Use .agnostic-core/skills/testing/unit-testing.md
Analise os testes em [PASTA] e identifique comportamentos sem cobertura.
Coverage minima esperada: 80%.

REST API Review:
Use .agnostic-core/skills/backend/rest-api-design.md
Revise as rotas em [PASTA] e verifique: nomenclatura, status codes, estrutura de resposta, paginacao.

Performance Check:
Use .agnostic-core/skills/performance/performance-audit.md e .agnostic-core/skills/performance/caching-strategies.md
Identifique N+1 queries, falta de indices e oportunidades de cache em [PASTA].

Frontend Quality:
Use .agnostic-core/skills/frontend/html-css-audit.md, accessibility.md e ux-guidelines.md
Revise [PASTA] e liste problemas de acessibilidade, UX e qualidade de codigo.

Git Commit Check:
Use .agnostic-core/skills/git/commit-conventions.md
O commit a seguir esta correto? Corrija se necessario: [MENSAGEM DO COMMIT]

Generate Docs:
Atue como o agent em .agnostic-core/agents/generators/docs-generator.md
Gere [README | OpenAPI | CHANGELOG] para o projeto em [PASTA].

Workflow Planning:
Use .agnostic-core/skills/workflow/goal-backward-planning.md
Ajude a planejar a implementacao de [DESCRICAO] usando metodologia goal-backward.
