NOME DO PROJETO — API Backend

Stack: Node.js / Express / PostgreSQL (ou MongoDB)
Submodulo: .agnostic-core/

---

Antes de implementar:

Consulte a skill do dominio relevante:

  REST API design:    .agnostic-core/skills/backend/rest-api-design.md
  Error handling:     .agnostic-core/skills/backend/error-handling.md
  Seguranca de API:   .agnostic-core/skills/security/api-hardening.md
  OWASP checklist:    .agnostic-core/skills/security/owasp-checklist.md
  Banco de dados:     .agnostic-core/skills/database/query-compliance.md
  Node.js patterns:   .agnostic-core/skills/nodejs/nodejs-patterns.md
  Express setup:      .agnostic-core/skills/nodejs/express-best-practices.md
  Testes unitarios:   .agnostic-core/skills/testing/unit-testing.md
  Testes integracao:  .agnostic-core/skills/testing/integration-testing.md
  Commits:            .agnostic-core/skills/git/commit-conventions.md
  Documentacao:       .agnostic-core/skills/documentation/technical-docs.md
  OpenAPI:            .agnostic-core/skills/documentation/openapi-swagger.md

Planejamento de feature:
  Goal-backward:      .agnostic-core/skills/workflow/goal-backward-planning.md
  Workflow 6 fases:   .agnostic-core/skills/workflow/project-workflow.md

Antes de fazer deploy:
  .agnostic-core/skills/devops/pre-deploy-checklist.md
  .agnostic-core/compliance/checklists/pre-deploy.md

---

Agents disponiveis:

  Security Reviewer:       .agnostic-core/agents/reviewers/security-reviewer.md
  Code Inspector (SPARC):  .agnostic-core/agents/reviewers/code-inspector.md
  Test Reviewer:           .agnostic-core/agents/reviewers/test-reviewer.md
  Performance Reviewer:    .agnostic-core/agents/reviewers/performance-reviewer.md
  Codebase Mapper:         .agnostic-core/agents/reviewers/codebase-mapper.md
  Migration Validator:     .agnostic-core/agents/validators/migration-validator.md
  Project Planner:         .agnostic-core/agents/generators/project-planner.md
  Docs Generator:          .agnostic-core/agents/generators/docs-generator.md

---

Git Auto-Push Workflow:
  Após cada commit, o hook PostToolUse faz push automático para a branch atual.
  Hook script:       .agnostic-core/scripts/hooks/post-tool-use-autopush
  Configuração:      ~/.claude/settings.json (PostToolUse → Bash matcher)
  Instalação:        scripts/install.sh configura automaticamente (passo 5/6)
  Comportamento:     detecta "git commit" → push origin <branch> → retry 1x se falhar

---

Convencoes do projeto (preencher):

  Linguagem: Node.js [VERSAO]
  Framework: Express [VERSAO]
  Banco: [BANCO e VERSAO]
  ORM/Driver: [ORM e VERSAO]
  Auth: JWT / OAuth / sessao
  Testes: Jest / Vitest / Mocha
  Estilo de commits: Conventional Commits
