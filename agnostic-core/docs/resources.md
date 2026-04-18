Recursos Externos

Referencias e ferramentas externas que complementam o agnostic-core.
Este arquivo lista apenas links — nenhum conteudo dessas fontes foi reproduzido aqui sem permissao explicita.

---

CURADORIA DE RECURSOS PARA CLAUDE CODE

awesome-claude-code
  URL: https://github.com/hesreallyhim/awesome-claude-code
  Descricao: Lista curada de 400+ ferramentas, skills, agents, hooks e workflows para Claude Code.
    Categorias: slash commands, CLAUDE.md templates, hooks, agents, workflows, MCP servers, editores.
  Licenca: CC BY-NC-ND 4.0
  Nota: a licenca proibe uso comercial e obras derivadas. Nao copie nem adapte o conteudo.
    Use como referencia para descobrir recursos; avalie a licenca de cada recurso individualmente.

---

SISTEMA DE WORKFLOW PARA DESENVOLVIMENTO COM IA

get-shit-done
  URL: https://github.com/gsd-build/get-shit-done
  Descricao: Sistema completo de context engineering para Claude Code. Previne context rot com
    contextos frescos por tarefa, goal-backward planning, wave-based parallelization e 12 agents.
    Inclui 38 slash commands NPX e protocolo de checkpoint para decisoes criticas.
  Licenca: MIT
  Incorporado ao agnostic-core:
    - skills/workflow/goal-backward-planning.md (metodologia goal-backward e wave-based parallelization)
    - skills/workflow/project-workflow.md (ciclo de 6 fases e artefatos por fase)
    - skills/workflow/context-management.md (estrategia de contextos frescos e handover)
    - agents/generators/project-planner.md (gera ROADMAP.md e PLAN.md)
    - agents/reviewers/codebase-mapper.md (gera STACK.md, ARCHITECTURE.md, CONVENTIONS.md, CONCERNS.md)

---

DESIGN E UX

ui-ux-pro-max-skill
  URL: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
  Descricao: Base de dados de design intelligence com 99 UX guidelines em 17 categorias,
    68 estilos visuais, 96 paletas de cores, 57 combinacoes de fontes. Inclui CLI Python
    com BM25 search engine para descoberta de padroes de design.
  Licenca: MIT
  Incorporado ao agnostic-core:
    - skills/frontend/ux-guidelines.md (99 UX guidelines organizados por categoria e severidade)
    - skills/frontend/accessibility.md (WCAG 2.1 AA como baseline obrigatorio)
  Nota: o sistema completo (CLI, CSV databases, search engine) esta disponivel no repo original.
    O agnostic-core incorporou apenas os guidelines em formato Markdown para uso offline.

---

FRAMEWORK DE AGENTS IA

antigravity-kit
  URL: https://github.com/vudovn/antigravity-kit
  Descricao: Framework de templates de agentes IA para Antigravity IDE com
    20 agentes especialistas, 36 skills, 11 workflows e scripts de validacao.
    Cobertura forte em DevOps, mobile, SEO, database design e debugging.
  Licenca: MIT
  Incorporado ao agnostic-core:
    - agents/specialists/devops-engineer.md (metodologia de deploy e operacoes)
    - agents/specialists/database-architect.md (design de schema e selecao de plataforma)
    - agents/specialists/mobile-developer.md (desenvolvimento mobile touch-first)
    - agents/specialists/seo-specialist.md (SEO e otimizacao para IA generativa)
    - skills/devops/deploy-procedures.md (workflow de deploy em 5 fases)
    - skills/testing/e2e-testing.md (testes E2E com Playwright/Cypress)
    - skills/database/schema-design.md (design de schema e selecao de ORM)
    - skills/frontend/seo-checklist.md (checklist SEO e Core Web Vitals)
    - skills/frontend/tailwind-patterns.md (Tailwind v4 CSS-first)
    - skills/audit/systematic-debugging.md (debugging em 4 fases)
    - skills/security/penetration-testing.md (teste de penetracao PTES/OWASP)
    - skills/audit/validation-checklist.md (checklist de validacao consolidado)
    - commands/workflows/ (templates de workflow: brainstorm, debug, deploy, create)
    - docs/agent-routing-guide.md (guia de roteamento de agents)
  Nota: o agnostic-core incorporou apenas ideias e metodologias em formato Markdown.
    Scripts, CLI, configuracoes de IDE e conteudo de ui-ux-pro-max (ja incorporado
    de outra fonte) foram omitidos.

---

ORIGEM DAS SKILLS INICIAIS

agnostic-core foi inicialmente alimentado com patterns extraidos de projetos reais.
Skills como api-hardening, owasp-checklist, query-compliance e pre-deploy-checklist foram
derivadas de boas praticas de producao e documentacao tecnica de codigo aberto.

Para contribuir com novas skills, consulte docs/CONTRIBUTING.md.
