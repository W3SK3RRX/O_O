Skills Index

Indice completo de todas as skills, agents e commands do agnostic-core.

---

SKILLS (81)

Seguranca
  skills/security/api-hardening.md          Hardening de endpoints: autenticacao, headers, rate limiting, validacao de input
  skills/security/owasp-checklist.md        OWASP Top 10 com checklist por categoria e exemplos de correcao
  skills/security/penetration-testing.md    Teste de penetracao: PTES, OWASP ofensivo, priorizacao de vulnerabilidades
  skills/security/security-review.md        Revisao de seguranca diff-aware com filtragem de falsos positivos
  skills/security/politica-de-seguranca.md Principios para projetos seguros: diretrizes, politicas, governanca

Frontend
  skills/frontend/html-css-audit.md              Semantica HTML, qualidade de CSS, acessibilidade basica
  skills/frontend/css-governance.md              Variaveis CSS, escopo de seletores, prevencao de CSS global
  skills/frontend/accessibility.md               WCAG 2.1 AA: contraste, teclado, ARIA, formularios, movimento
  skills/frontend/ux-guidelines.md               17 categorias UX com severidade por item (adaptado de ui-ux-pro)
  skills/frontend/tailwind-patterns.md           Tailwind CSS v4: configuracao CSS-first, responsivo, dark mode, cores
  skills/frontend/react-performance.md           58 regras de performance React: waterfalls, bundle, SSR, re-renders
  skills/frontend/seo-checklist.md               SEO tecnico, Core Web Vitals, E-E-A-T, Schema Markup, GEO
  skills/frontend/internacionalizacao.md        i18n: externalizacao de strings, formatacao por locale, RTL, pseudo-localizacao
  skills/frontend/anti-frankenstein.md          Checkpoint de governanca CSS: evitar CSS Frankenstein antes de PR
  skills/frontend/react-task-checklists.md      Checklists por tipo de tarefa React: CSS, componente, data fetching, estado, tipos, rotas, testes
  skills/frontend/dark-mode-tokens.md           Dark mode por padrao com CSS custom properties: tokens light/dark e implementacao next-themes
  skills/frontend/responsive-breakpoint-table.md  Tabela de responsividade por componente: regras explicitas mobile vs desktop
  skills/frontend/menos-e-mais.md               Protocolo de auditoria para reduzir poluicao visual: hierarquia, redundancia, espaco em branco
  skills/frontend/pwa-offline-patterns.md       Service worker, cache de shell, o que nunca cachear (dados sensiveis) e manifest.json

UX/UI
  skills/ux-ui/principios-de-interface.md   Hierarquia visual, tipografia, cores, responsividade, estados de interface
  skills/ux-ui/ui-ux-quality-gates.md       5 quality gates obrigatorios para entrega de interface frontend
  skills/ux-ui/navegacao-sem-redundancia.md Padroes de navegacao sem redundancia: hierarquia, acesso direto, consistencia

Design
  skills/design/paper-mcp-workflow.md            Fluxo bidirecional Paper MCP: Claude Code cria designs no Paper e implementa frontend a partir deles
  skills/design/nano-banana-claude-workflow.md   Fluxo Claude Code + Nano Banana + Canva: geracao e edicao de imagens via MCP com separacao de camadas no Canva
  skills/design/visual-baseline.md               As tres camadas visuais (imagem, tipografia, icones) que separam projetos funcionais de profissionais

Design System
  skills/design-system/SKILL.md             Planejamento colaborativo de design antes de execucao visual

Backend
  skills/backend/rest-api-design.md              Nomenclatura, HTTP methods, status codes, paginacao, versionamento
  skills/backend/error-handling.md               Hierarquia de erros, middleware centralizado, log vs expose
  skills/backend/financial-operations.md         Idempotencia, atomicidade e trilha de auditoria em operacoes financeiras
  skills/backend/domain-driven-design.md        DDD: bounded contexts, aggregates, domain events, linguagem ubiqua
  skills/backend/event-sourcing.md              Event Sourcing e CQRS: eventos imutaveis, projections, versionamento
  skills/backend/estrategias-de-migracao.md     Strangler Fig, Parallel Run, Branch by Abstraction, migracao de dados
  skills/backend/cdn-asset-validation.md        Detectar soft-404 em CDNs externas (HTTP 200 com corpo vazio) via curl -sI

Banco de Dados
  skills/database/query-compliance.md       Queries seguras, indices, transacoes, migrations
  skills/database/schema-design.md          Design de schema, normalizacao, selecao de ORM, indices, migrations seguras

Testes
  skills/testing/unit-testing.md            Padrao AAA, coverage 80%, mocking, casos de borda
  skills/testing/integration-testing.md     Banco isolado, testes de API, contratos, gerenciamento de dados
  skills/testing/tdd-workflow.md            Ciclo Red-Green-Refactor, quando aplicar, comportamentos vs linhas
  skills/testing/e2e-testing.md             Testes E2E: piramide, Page Object Model, Playwright/Cypress, CI

Performance
  skills/performance/performance-audit.md   N+1 queries, indices, caching, render blocking
  skills/performance/caching-strategies.md  Camadas L1-L3, cache-aside, TTL, invalidacao, Redis keys
  skills/performance/load-testing.md        Tipos de teste, SLA (p95/p99), k6, Artillery, analise de resultados

Cache
  skills/cache/estrategias-de-cache.md     Ideias de cache por tipo de problema: estrategias e trade-offs

DevOps
  skills/devops/pre-deploy-checklist.md     Checklist de pre-deploy: testes, seguranca, migracao, rollback
  skills/devops/deploy-procedures.md        Procedimentos de deploy: plataformas, 5 fases, rollback, zero-downtime
  skills/devops/observabilidade.md         Observabilidade: logs estruturados, metricas RED/USE, tracing, alertas
  skills/devops/containerizacao.md         Containerizacao: Dockerfile, multi-stage, Docker Compose, seguranca
  skills/devops/monorepo.md                Monorepo: workspaces, dependencias internas, CI seletivo, CODEOWNERS
  skills/devops/eruda-mobile-debug.md      Debug mobile em projetos Vite via Eruda: console, network e DOM no dispositivo
  skills/devops/css-cache-busting.md       Padrao ?v=X para CSS servido diretamente sem bundler: quando incrementar, diagnostico

Git
  skills/git/commit-conventions.md          Conventional Commits, tipos, breaking changes, commitlint
  skills/git/branching-strategy.md          Trunk-based vs GitFlow, nomenclatura, protecao de branch
  skills/git/pr-template.md                 PULL_REQUEST_TEMPLATE.md, processo de review, boas praticas
  skills/git/github-profile/SKILL.md       GitHub user profiles: stats, repositorios, atividade recente

Documentacao
  skills/documentation/technical-docs.md    README, ADR, JSDoc, CHANGELOG (Keep a Changelog)
  skills/documentation/openapi-swagger.md   Schema OpenAPI 3.1, autenticacao, validacao no CI

Auditoria
  skills/audit/code-review.md                      Checklist de revisao de codigo por categoria
  skills/audit/pre-implementation.md               Verificar antes de implementar: duplicacao, solucao mais simples
  skills/audit/refactoring.md                      7 fases de decomposicao segura com plano incremental
  skills/audit/systematic-debugging.md             Debugging em 4 fases: reproduzir, isolar, entender, corrigir
  skills/audit/validation-checklist.md             Checklist consolidado de validacao (quick check + full check)
  skills/audit/revisao-texto-ptbr.md              Revisao de textos PT-BR: ortografia, concordancia, acentuacao, consistencia factual
  skills/audit/post-implementation-conformity.md  Auditoria de consistencia cruzada: codigo vs documentacao vs regras do projeto
  skills/audit/refactor-monolith.md               Decomposicao segura de monolito: incremental, sem interromper producao
  skills/audit/detect-hardcodes.md                Identificar e classificar valores hardcoded no codigo-fonte
  skills/audit/senior-verification-protocol.md    "Um senior engineer aprovaria esse diff?" + regra dos 3 arquivos para pausa de elegancia

Node.js
  skills/nodejs/nodejs-patterns.md          Estrutura MVC, graceful shutdown, env validation, connection pooling
  skills/nodejs/express-best-practices.md   Ordem de middleware, CORS, rate limiting, validacao de input

Python
  skills/python/python-patterns.md          venv, src layout, black/ruff/mypy, type hints, logging
  skills/python/python-scripts.md           argparse, --dry-run, idempotencia, exit codes, logs no stderr

AI / LLM
  skills/ai/fact-checker.md                 Verificar afirmacoes sobre codigo com fontes primarias
  skills/ai/ai-integration-patterns.md      API keys, retry, cache, prompt injection, PII, fallback
  skills/ai/prompt-engineering.md           Anatomia de prompt, temperatura, few-shot, versionamento
  skills/ai/model-routing.md               Roteamento de modelos por tipo de tarefa: opus, sonnet, haiku
  skills/ai/token-optimization.md          Reduzir consumo de tokens otimizando arquivos de contexto automatico
  skills/ai/ai-problems-detection.md       5 anti-patterns de IA ao codar: deteccao e correcao

MCP / Integracoes
  skills/mcp/ideias-de-mcp.md               Ideias de MCP servers: quando criar, categorias, seguranca, estrutura minima
  skills/mcp/github-app-install.md           GitHub App do Claude Code: /install-github-app, acesso a issues/PRs/branches

Workflow
  skills/workflow/goal-backward-planning.md    Goal->Truths->Artifacts, waves, checkpoint protocol
  skills/workflow/project-workflow.md          Ciclo de 6 fases, artefatos por fase, decision fidelity
  skills/workflow/context-management.md        Context rot, contextos frescos, handover protocol
  skills/workflow/context-audit.md             Auditoria de contexto automatico: diagnosticar e reduzir bloat de tokens
  skills/workflow/claude-code-productivity.md  Produtividade no Claude Code: @mentions, historico, /stats, /init, subagents, LSP
  skills/workflow/gestao-de-incidentes.md      Resposta estruturada a incidentes em producao: severidade, resposta, postmortem
  skills/workflow/sais-principle.md            Framework S.A.I.S: Solicitar->Analisar->Identificar->Alterar antes de tocar codigo existente
  skills/workflow/auto-learning-lessons.md     Documentar correcoes em LESSONS.md e promover erros recorrentes a regras do projeto

Plataformas
  skills/platforms/cloudflare/cloudflare-patterns.md  Cloudflare Workers, Pages, D1, KV, R2, Durable Objects: padroes e limites
  skills/platforms/replit/replit-patterns.md           Replit: padroes, limites e boas praticas
  skills/platforms/vercel/vercel-patterns.md           Vercel: padroes, limites e boas praticas de deploy

Automacao
  skills/automacao/automacoes-uteis.md     Ideias de automacoes para tarefas repetitivas de desenvolvimento
  skills/automacao/git-auto-push-hook.md   Hook PostToolUse para auto-push apos commit do Claude com backoff exponencial

---

AGENTS (16)

Reviewers
  agents/reviewers/security-reviewer.md    Revisao de seguranca com severidades CRITICA/ALTA/MEDIA/BAIXA
  agents/reviewers/frontend-reviewer.md    Revisao HTML/CSS/JS com WCAG 2.1 AA e UX guidelines
  agents/reviewers/code-inspector.md       Code review metodologico (SPARC)
  agents/reviewers/test-reviewer.md        Coverage, design de testes, testes sem assertion, status APROVADO/BLOQUEAR
  agents/reviewers/performance-reviewer.md N+1, indices, cache ausente, prioridade por ROI
  agents/reviewers/codebase-mapper.md      Gera STACK.md, ARCHITECTURE.md, CONVENTIONS.md, CONCERNS.md
  agents/reviewers/architecture-reviewer.md Revisao de decisoes arquiteturais: DDD, event sourcing, monorepo, migracoes

Validators
  agents/validators/migration-validator.md Lock risk, reversibilidade, destrutividade, status APROVADO/AJUSTAR/BLOQUEAR

Generators
  agents/generators/boilerplate-generator.md  Estrutura inicial de projeto com submodulo agnostic-core
  agents/generators/project-planner.md        ROADMAP.md + PLAN.md com goal-backward e waves
  agents/generators/docs-generator.md         README, ADR, CHANGELOG, OpenAPI a partir do codigo
  agents/generators/ui-designer.md            Design de UI no Paper via MCP tools (sem escrever arquivos)

Specialists
  agents/specialists/devops-engineer.md       Deploy, infraestrutura, rollback, zero-downtime, emergencia
  agents/specialists/database-architect.md    Schema design, selecao de plataforma/ORM, indices, migrations
  agents/specialists/mobile-developer.md      Mobile touch-first, offline, 60fps, React Native/Flutter
  agents/specialists/seo-specialist.md        SEO tecnico, Core Web Vitals, E-E-A-T, GEO

---

COMMANDS (18)

Claude Code -- commands/claude-code/COMMANDS.md
  Security Audit            -> security-reviewer agent
  Frontend Review           -> frontend-reviewer agent
  Pre-Deploy Check          -> pre-deploy-checklist skill
  Database Review           -> query-compliance skill
  Generate Boilerplate      -> boilerplate-generator agent
  Code Inspector (SPARC)    -> code-inspector agent
  OWASP Security Check      -> owasp-checklist skill
  Performance Audit         -> performance-audit skill
  Pre-Implementation Check  -> pre-implementation skill
  Refactoring Plan          -> refactoring skill
  CSS Governance Check      -> css-governance skill
  Financial Operations Review -> financial-operations skill
  Fact Check                -> fact-checker skill
  Project Planner           -> project-planner agent
  Codebase Mapper           -> codebase-mapper agent
  UX Audit                  -> ux-guidelines skill
  Accessibility Check       -> accessibility skill
  Test Review               -> test-reviewer agent
  Performance Review        -> performance-reviewer agent
  Migration Validate        -> migration-validator agent
  Generate Docs             -> docs-generator agent
  REST API Review           -> rest-api-design skill
  Commit Convention Check   -> commit-conventions skill
  Node.js Review            -> nodejs-patterns + express-best-practices

Cursor -- commands/cursor/COMMANDS.md
  .cursorrules template + 8 prompts de chat

Generic -- commands/generic/scripts.md
  Auditoria de seguranca, diagnostico de banco, analise git, Makefile template, GitHub Actions snippets

---

WORKFLOWS (4)

  commands/workflows/brainstorm.md   Explorar opcoes e tomar decisoes antes de implementar
  commands/workflows/create.md       Criar nova aplicacao ou feature completa do zero
  commands/workflows/debug.md        Investigacao sistematica de bugs
  commands/workflows/deploy.md       Processo de deploy seguro e verificavel

---

TEMPLATES (4)

  templates/project-bootstrap/CLAUDE.md              Generico (qualquer stack)
  templates/project-bootstrap/api-backend/CLAUDE.md  API REST (Node.js / Python)
  templates/project-bootstrap/frontend/CLAUDE.md     Frontend (React / Vue / Svelte)
  templates/project-bootstrap/fullstack/CLAUDE.md    Fullstack com todos os agents

---

COMPLIANCE (2)

  compliance/checklists/pre-deploy.md      Checklist obrigatorio antes de cada deploy
  compliance/policies/security-policy.md   Politica de seguranca do projeto

---

CLAUDE CODE SKILLS (1)

Debug
  .claude/skills/eruda/SKILL.md          Eruda mobile DevTools: injecao com plugin Debug Report para debug em dispositivos moveis e pipeline para Claude Code

---

DOCS (6)

  docs/CONTRIBUTING.md         Como contribuir com novas skills
  docs/resources.md            Recursos externos e referencias com notas de licenca
  docs/integration-guide.md    Como adicionar o agnostic-core a qualquer projeto
  docs/agent-routing-guide.md  Guia de roteamento: qual agent/skill usar para cada tarefa
  docs/skills-index.md         Este arquivo
