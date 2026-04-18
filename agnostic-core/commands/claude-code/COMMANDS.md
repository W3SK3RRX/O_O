Claude Code Commands

Commands e skills para uso do agnostic-core com Claude Code.

---

COMO USAR

No Claude Code, referencie skills e agents diretamente no prompt usando @mentions:

  @.agnostic-core/skills/security/api-hardening.md revise este endpoint

Ou carregue via CLAUDE.md do projeto (ver templates/project-bootstrap/).

---

SKILLS DISPONIVEIS POR CATEGORIA

Seguranca:
  Security Audit             @.agnostic-core/skills/security/api-hardening.md
  OWASP Security Check       @.agnostic-core/skills/security/owasp-checklist.md
  Penetration Testing        @.agnostic-core/skills/security/penetration-testing.md
  Security Review            @.agnostic-core/skills/security/security-review.md
  Politica de Seguranca      @.agnostic-core/skills/security/politica-de-seguranca.md

Frontend:
  HTML/CSS Audit             @.agnostic-core/skills/frontend/html-css-audit.md
  CSS Governance             @.agnostic-core/skills/frontend/css-governance.md
  Accessibility Check        @.agnostic-core/skills/frontend/accessibility.md
  UX Audit                   @.agnostic-core/skills/frontend/ux-guidelines.md
  Tailwind Patterns          @.agnostic-core/skills/frontend/tailwind-patterns.md
  React Performance          @.agnostic-core/skills/frontend/react-performance.md
  SEO Checklist              @.agnostic-core/skills/frontend/seo-checklist.md
  i18n                       @.agnostic-core/skills/frontend/internacionalizacao.md
  Anti-Frankenstein CSS      @.agnostic-core/skills/frontend/anti-frankenstein.md

UX/UI:
  Principios de Interface    @.agnostic-core/skills/ux-ui/principios-de-interface.md
  UI/UX Quality Gates        @.agnostic-core/skills/ux-ui/ui-ux-quality-gates.md

Design:
  Paper MCP Workflow         @.agnostic-core/skills/design/paper-mcp-workflow.md

Design System:
  Design System Planning     @.agnostic-core/skills/design-system/SKILL.md

Backend:
  REST API Review            @.agnostic-core/skills/backend/rest-api-design.md
  Error Handling             @.agnostic-core/skills/backend/error-handling.md
  Financial Operations       @.agnostic-core/skills/backend/financial-operations.md
  Domain-Driven Design       @.agnostic-core/skills/backend/domain-driven-design.md
  Event Sourcing / CQRS      @.agnostic-core/skills/backend/event-sourcing.md
  Estrategias de Migracao    @.agnostic-core/skills/backend/estrategias-de-migracao.md

Banco de Dados:
  Query Compliance           @.agnostic-core/skills/database/query-compliance.md
  Schema Design              @.agnostic-core/skills/database/schema-design.md

Testes:
  Unit Testing               @.agnostic-core/skills/testing/unit-testing.md
  Integration Testing        @.agnostic-core/skills/testing/integration-testing.md
  TDD Workflow               @.agnostic-core/skills/testing/tdd-workflow.md
  E2E Testing                @.agnostic-core/skills/testing/e2e-testing.md

Performance:
  Performance Audit          @.agnostic-core/skills/performance/performance-audit.md
  Caching Strategies         @.agnostic-core/skills/performance/caching-strategies.md
  Load Testing               @.agnostic-core/skills/performance/load-testing.md

Cache:
  Estrategias de Cache       @.agnostic-core/skills/cache/estrategias-de-cache.md

DevOps:
  Pre-Deploy Checklist       @.agnostic-core/skills/devops/pre-deploy-checklist.md
  Deploy Procedures          @.agnostic-core/skills/devops/deploy-procedures.md
  Observabilidade            @.agnostic-core/skills/devops/observabilidade.md
  Containerizacao            @.agnostic-core/skills/devops/containerizacao.md
  Monorepo                   @.agnostic-core/skills/devops/monorepo.md

Git:
  Commit Conventions         @.agnostic-core/skills/git/commit-conventions.md
  Branching Strategy         @.agnostic-core/skills/git/branching-strategy.md
  PR Template                @.agnostic-core/skills/git/pr-template.md

Documentacao:
  Technical Docs             @.agnostic-core/skills/documentation/technical-docs.md
  OpenAPI / Swagger          @.agnostic-core/skills/documentation/openapi-swagger.md

Auditoria:
  Code Review                @.agnostic-core/skills/audit/code-review.md
  Pre-Implementation Check   @.agnostic-core/skills/audit/pre-implementation.md
  Refactoring Plan           @.agnostic-core/skills/audit/refactoring.md
  Systematic Debugging       @.agnostic-core/skills/audit/systematic-debugging.md
  Validation Checklist       @.agnostic-core/skills/audit/validation-checklist.md
  Revisao Texto PT-BR        @.agnostic-core/skills/audit/revisao-texto-ptbr.md
  Post-Implementation        @.agnostic-core/skills/audit/post-implementation-conformity.md
  Refactor Monolith          @.agnostic-core/skills/audit/refactor-monolith.md
  Detect Hardcodes           @.agnostic-core/skills/audit/detect-hardcodes.md

Node.js:
  Node.js Patterns           @.agnostic-core/skills/nodejs/nodejs-patterns.md
  Express Best Practices     @.agnostic-core/skills/nodejs/express-best-practices.md

Python:
  Python Patterns            @.agnostic-core/skills/python/python-patterns.md
  Python Scripts             @.agnostic-core/skills/python/python-scripts.md

AI / LLM:
  Fact Checker               @.agnostic-core/skills/ai/fact-checker.md
  AI Integration Patterns    @.agnostic-core/skills/ai/ai-integration-patterns.md
  Prompt Engineering         @.agnostic-core/skills/ai/prompt-engineering.md
  Model Routing              @.agnostic-core/skills/ai/model-routing.md
  Token Optimization         @.agnostic-core/skills/ai/token-optimization.md
  AI Problems Detection      @.agnostic-core/skills/ai/ai-problems-detection.md

MCP / Integracoes:
  Ideias de MCP              @.agnostic-core/skills/mcp/ideias-de-mcp.md
  GitHub App Install         @.agnostic-core/skills/mcp/github-app-install.md

Plataformas:
  Cloudflare Patterns        @.agnostic-core/skills/platforms/cloudflare/cloudflare-patterns.md
  Replit Patterns            @.agnostic-core/skills/platforms/replit/replit-patterns.md
  Vercel Patterns            @.agnostic-core/skills/platforms/vercel/vercel-patterns.md

Workflow:
  Goal-Backward Planning     @.agnostic-core/skills/workflow/goal-backward-planning.md
  Project Workflow           @.agnostic-core/skills/workflow/project-workflow.md
  Context Management         @.agnostic-core/skills/workflow/context-management.md
  Context Audit              @.agnostic-core/skills/workflow/context-audit.md
  Claude Code Productivity   @.agnostic-core/skills/workflow/claude-code-productivity.md
  Gestao de Incidentes       @.agnostic-core/skills/workflow/gestao-de-incidentes.md

Automacao:
  Automacoes Uteis           @.agnostic-core/skills/automacao/automacoes-uteis.md

---

AGENTS DISPONIVEIS

Reviewers:
  Security Reviewer          @.agnostic-core/agents/reviewers/security-reviewer.md
  Frontend Reviewer          @.agnostic-core/agents/reviewers/frontend-reviewer.md
  Code Inspector (SPARC)     @.agnostic-core/agents/reviewers/code-inspector.md
  Test Reviewer              @.agnostic-core/agents/reviewers/test-reviewer.md
  Performance Reviewer       @.agnostic-core/agents/reviewers/performance-reviewer.md
  Codebase Mapper            @.agnostic-core/agents/reviewers/codebase-mapper.md
  Architecture Reviewer      @.agnostic-core/agents/reviewers/architecture-reviewer.md

Validators:
  Migration Validator        @.agnostic-core/agents/validators/migration-validator.md

Generators:
  Boilerplate Generator      @.agnostic-core/agents/generators/boilerplate-generator.md
  Project Planner            @.agnostic-core/agents/generators/project-planner.md
  Docs Generator             @.agnostic-core/agents/generators/docs-generator.md
  UI Designer (Paper MCP)    @.agnostic-core/agents/generators/ui-designer.md

Specialists:
  DevOps Engineer            @.agnostic-core/agents/specialists/devops-engineer.md
  Database Architect         @.agnostic-core/agents/specialists/database-architect.md
  Mobile Developer           @.agnostic-core/agents/specialists/mobile-developer.md
  SEO Specialist             @.agnostic-core/agents/specialists/seo-specialist.md

---

PROMPTS PRONTOS (copie e use no Claude Code)

Security Audit:
  @.agnostic-core/agents/reviewers/security-reviewer.md
  Atue como este agent. Revise os arquivos em [PASTA] e liste problemas por severidade.

Code Inspector (SPARC):
  @.agnostic-core/agents/reviewers/code-inspector.md
  Atue como este agent. Faca code review de [ARQUIVO] usando metodologia SPARC.

Performance Review:
  @.agnostic-core/skills/performance/performance-audit.md
  Identifique N+1 queries, falta de indices e oportunidades de cache em [PASTA].

Frontend Quality:
  @.agnostic-core/skills/frontend/html-css-audit.md @.agnostic-core/skills/frontend/accessibility.md
  Revise [PASTA] e liste problemas de acessibilidade, UX e qualidade de codigo.

REST API Review:
  @.agnostic-core/skills/backend/rest-api-design.md
  Revise as rotas em [PASTA]: nomenclatura, status codes, estrutura de resposta, paginacao.

Pre-Deploy Check:
  @.agnostic-core/skills/devops/pre-deploy-checklist.md
  Execute o checklist completo de pre-deploy para este projeto.

Test Review:
  @.agnostic-core/agents/reviewers/test-reviewer.md
  Atue como este agent. Analise os testes em [PASTA] e identifique gaps de cobertura.

Generate Docs:
  @.agnostic-core/agents/generators/docs-generator.md
  Atue como este agent. Gere [README | OpenAPI | CHANGELOG] para o projeto.

Workflow Planning:
  @.agnostic-core/skills/workflow/goal-backward-planning.md
  Ajude a planejar [DESCRICAO] usando metodologia goal-backward.

Database Review:
  @.agnostic-core/agents/specialists/database-architect.md
  Atue como este agent. Revise o schema em [ARQUIVO] e sugira melhorias.

Codebase Mapping:
  @.agnostic-core/agents/reviewers/codebase-mapper.md
  Atue como este agent. Mapeie este repositorio e gere STACK.md + ARCHITECTURE.md.

---

DICAS DE PRODUTIVIDADE

Para maximizar eficiencia no Claude Code com agnostic-core:

  1. Use @mentions para injetar skills direto no prompt
  2. Ctrl+R para buscar prompts prontos no historico
  3. /stats para monitorar consumo de tokens
  4. /init para onboarding automatico em repos novos
  5. Subagents para rodar auditorias em paralelo
  6. LSP ativo para diagnosticos instantaneos

Ver: skills/workflow/claude-code-productivity.md (guia completo das 6 diretivas).
