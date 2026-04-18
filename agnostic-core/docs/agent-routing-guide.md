Guia de Roteamento de Agents e Skills

Qual agent ou skill consultar para cada tipo de tarefa?
Este guia ajuda a escolher o recurso certo do acervo para cada situacao.

Adaptado do conceito de AGENT_FLOW do antigravity-kit (MIT).
Fonte: https://github.com/vudovn/antigravity-kit

---

COMO USAR

1. Identifique o tipo da tarefa (build, debug, review, deploy, plan)
2. Identifique o dominio (frontend, backend, database, seguranca, etc.)
3. Consulte a tabela abaixo para encontrar o agent/skill mais adequado

---

TABELA DE ROTEAMENTO

  UI / UX / Frontend
    Agent: agents/reviewers/frontend-reviewer.md
    Skills:
      skills/frontend/ux-guidelines.md
      skills/frontend/accessibility.md
      skills/frontend/css-governance.md
      skills/frontend/html-css-audit.md
      skills/frontend/tailwind-patterns.md
      skills/frontend/seo-checklist.md
      skills/frontend/internacionalizacao.md

  API / Backend
    Agents: agents/reviewers/security-reviewer.md + agents/reviewers/code-inspector.md + agents/reviewers/architecture-reviewer.md
    Skills:
      skills/backend/rest-api-design.md
      skills/backend/error-handling.md
      skills/backend/domain-driven-design.md
      skills/backend/event-sourcing.md
      skills/security/api-hardening.md
      skills/nodejs/nodejs-patterns.md
      skills/nodejs/express-best-practices.md

  Banco de dados
    Agent: agents/specialists/database-architect.md
    Skills:
      skills/database/query-compliance.md
      skills/database/schema-design.md

  Seguranca
    Agent: agents/reviewers/security-reviewer.md
    Skills:
      skills/security/owasp-checklist.md
      skills/security/api-hardening.md
      skills/security/penetration-testing.md

  Testes
    Agent: agents/reviewers/test-reviewer.md
    Skills:
      skills/testing/unit-testing.md
      skills/testing/integration-testing.md
      skills/testing/e2e-testing.md
      skills/testing/tdd-workflow.md

  Deploy / DevOps
    Agent: agents/specialists/devops-engineer.md
    Skills:
      skills/devops/pre-deploy-checklist.md
      skills/devops/deploy-procedures.md
      skills/devops/observabilidade.md
      skills/devops/containerizacao.md
      skills/devops/monorepo.md

  Performance
    Agent: agents/reviewers/performance-reviewer.md
    Skills:
      skills/performance/performance-audit.md
      skills/performance/caching-strategies.md
      skills/performance/load-testing.md
      skills/cache/estrategias-de-cache.md

  Mobile
    Agent: agents/specialists/mobile-developer.md
    Skills:
      skills/frontend/accessibility.md
      skills/frontend/ux-guidelines.md
      skills/testing/e2e-testing.md

  SEO
    Agent: agents/specialists/seo-specialist.md
    Skills:
      skills/frontend/seo-checklist.md
      skills/performance/performance-audit.md

  Planejamento
    Agent: agents/generators/project-planner.md
    Skills:
      skills/workflow/goal-backward-planning.md
      skills/workflow/project-workflow.md
      skills/workflow/context-management.md

  Codigo legado / Refatoracao
    Agents: agents/reviewers/code-inspector.md + agents/reviewers/codebase-mapper.md + agents/reviewers/architecture-reviewer.md
    Skills:
      skills/audit/refactoring.md
      skills/audit/code-review.md
      skills/backend/estrategias-de-migracao.md

  Arquitetura
    Agent: agents/reviewers/architecture-reviewer.md
    Skills:
      skills/backend/domain-driven-design.md
      skills/backend/event-sourcing.md
      skills/backend/estrategias-de-migracao.md
      skills/devops/monorepo.md
      skills/documentation/technical-docs.md (ADRs)

  Incidentes
    Skills:
      skills/workflow/gestao-de-incidentes.md
      skills/devops/observabilidade.md
      skills/devops/deploy-procedures.md

  Debugging
    Skills:
      skills/audit/systematic-debugging.md
    Workflow:
      commands/workflows/debug.md

  Operacoes financeiras
    Agent: agents/reviewers/security-reviewer.md
    Skills:
      skills/backend/financial-operations.md
      skills/security/api-hardening.md

  Documentacao
    Agent: agents/generators/docs-generator.md
    Skills:
      skills/documentation/technical-docs.md
      skills/documentation/openapi-swagger.md

  Migrations de banco
    Agent: agents/validators/migration-validator.md
    Skills:
      skills/database/schema-design.md
      skills/database/query-compliance.md

---

QUANDO USAR WORKFLOWS

  Explorando opcoes antes de implementar? → commands/workflows/brainstorm.md
  Criando app ou feature do zero?         → commands/workflows/create.md
  Investigando um bug?                    → commands/workflows/debug.md
  Fazendo deploy?                         → commands/workflows/deploy.md

---

MULTIPLOS DOMINIOS

Se a tarefa envolve mais de um dominio (ex: feature que toca banco + API + frontend):

1. Consulte o agent/skill do dominio mais critico primeiro
2. Depois consulte os secundarios em sequencia
3. Use o workflow /create para coordenar (commands/workflows/create.md)

Exemplo: "adicionar sistema de pagamentos"
  1. agents/reviewers/security-reviewer.md (seguranca e prioridade #1 em pagamentos)
  2. agents/specialists/database-architect.md (schema de transacoes)
  3. skills/backend/financial-operations.md (idempotencia, atomicidade)
  4. skills/testing/e2e-testing.md (testar fluxo completo)

---

MODEL ROUTING — QUAL MODELO USAR

Alem de escolher o agent/skill certo, escolha o modelo certo para cada tarefa:

  Tier-1 (Opus): arquitetura, planejamento, decisoes complexas, seguranca
  Tier-2 (Sonnet): implementacao de features, integracao, correcao de bugs
  Tier-3 (Haiku): boilerplate, estilos, i18n, mocks, testes unitarios simples

Ver: skills/ai/model-routing.md (guia completo com tabela de decisao e dispatch paralelo)

---

PRINCIPIO

Comece pelo agent/skill mais especifico para o dominio.
Se nao existir agent especifico, consulte a skill diretamente.
Use workflows para coordenar tarefas multi-dominio.
Escolha o modelo adequado para a complexidade da tarefa (ver model-routing.md).
