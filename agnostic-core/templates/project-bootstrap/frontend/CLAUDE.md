NOME DO PROJETO — Frontend

Stack: React / Vue / Svelte / HTML+CSS+JS vanilla
Submodulo: .agnostic-core/

---

Antes de implementar:

Consulte a skill do dominio relevante:

  HTML e CSS:          .agnostic-core/skills/frontend/html-css-audit.md
  CSS Governance:      .agnostic-core/skills/frontend/css-governance.md
  Acessibilidade:      .agnostic-core/skills/frontend/accessibility.md
  UX Guidelines:       .agnostic-core/skills/frontend/ux-guidelines.md
  Testes unitarios:    .agnostic-core/skills/testing/unit-testing.md
  Performance:         .agnostic-core/skills/performance/performance-audit.md
  Caching (assets):    .agnostic-core/skills/performance/caching-strategies.md
  Commits:             .agnostic-core/skills/git/commit-conventions.md
  Documentacao:        .agnostic-core/skills/documentation/technical-docs.md

Design com MCP (se aplicavel):
  Paper MCP workflow:  .agnostic-core/skills/design/paper-mcp-workflow.md

Integracao com AI (se aplicavel):
  AI patterns:         .agnostic-core/skills/ai/ai-integration-patterns.md
  Prompt engineering:  .agnostic-core/skills/ai/prompt-engineering.md

Planejamento de feature:
  Goal-backward:       .agnostic-core/skills/workflow/goal-backward-planning.md
  Workflow 6 fases:    .agnostic-core/skills/workflow/project-workflow.md

Antes de fazer deploy:
  .agnostic-core/skills/devops/pre-deploy-checklist.md

---

Agents disponiveis:

  Frontend Reviewer:   .agnostic-core/agents/reviewers/frontend-reviewer.md
  Code Inspector:      .agnostic-core/agents/reviewers/code-inspector.md
  Test Reviewer:       .agnostic-core/agents/reviewers/test-reviewer.md
  Codebase Mapper:     .agnostic-core/agents/reviewers/codebase-mapper.md
  Project Planner:     .agnostic-core/agents/generators/project-planner.md
  Docs Generator:      .agnostic-core/agents/generators/docs-generator.md

---

Criterios de aceite para PRs:

  Acessibilidade:
  - [ ] Todos os elementos interativos acessiveis por teclado
  - [ ] Imagens com alt text
  - [ ] Contraste minimo 4.5:1 para texto normal
  - [ ] prefers-reduced-motion respeitado

  UX:
  - [ ] Estados loading, empty e error implementados
  - [ ] Touch targets minimos 44x44px
  - [ ] Testado em 375px (mobile)

  Performance:
  - [ ] Imagens com width/height ou aspect-ratio
  - [ ] Lazy loading em imagens below-the-fold

---

Git Auto-Push Workflow:
  Após cada commit, o hook PostToolUse faz push automático para a branch atual.
  Hook script:       .agnostic-core/scripts/hooks/post-tool-use-autopush
  Configuração:      ~/.claude/settings.json (PostToolUse → Bash matcher)
  Instalação:        scripts/install.sh configura automaticamente (passo 5/6)
  Comportamento:     detecta "git commit" → push origin <branch> → retry 1x se falhar

---

Convencoes do projeto (preencher):

  Framework: [FRAMEWORK e VERSAO]
  Bundler: Vite / Webpack / esbuild
  CSS: Tailwind / CSS Modules / styled-components / vanilla
  Testes: Jest + Testing Library / Vitest / Cypress
  Estilo de commits: Conventional Commits
