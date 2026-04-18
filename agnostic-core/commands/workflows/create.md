Workflow: Create

Template para criar nova aplicacao ou feature completa do zero.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

QUANDO USAR

  - Criar nova aplicacao/projeto do zero
  - Implementar feature completa (database + backend + frontend)
  - Qualquer tarefa que envolve multiplos dominios coordenados

---

PROCESSO (4 FASES)

FASE 1 — ANALISAR REQUISITOS

  Se os requisitos sao claros: seguir para fase 2.

  Se vagos, clarificar:
    - [ ] Que tipo de aplicacao? (web, API, mobile, CLI)
    - [ ] Quais funcionalidades core? (listar as 3-5 principais)
    - [ ] Quem sao os usuarios? (publico, interno, B2B)
    - [ ] Existem constraints? (stack, prazo, integracao com sistema existente)
    - [ ] Qual o MVP? (menor versao util)

FASE 2 — PLANEJAR

  Usar goal-backward planning:

  1. Definir o objetivo final (o que "pronto" significa)
  2. Listar os artefatos necessarios (schema, API, telas, testes)
  3. Organizar em waves (fases paralelas quando possivel):

     Wave 1: Fundacao (sem dependencias)
       - Schema de banco de dados
       - Estrutura do projeto
       - Configuracao de ambiente

     Wave 2: Backend (depende da wave 1)
       - Endpoints de API
       - Logica de negocio
       - Testes unitarios

     Wave 3: Frontend (depende da wave 2)
       - Componentes de UI
       - Integracao com API
       - Estados e navegacao

     Wave 4: Qualidade (depende das waves 2-3)
       - Testes de integracao
       - Testes E2E dos fluxos criticos
       - Code review

     Wave 5: Deploy (depende da wave 4)
       - Configuracao de infra
       - Deploy para staging
       - Validacao
       - Deploy para producao

FASE 3 — EXECUTAR

  Executar wave por wave:
    - [ ] Completar todos os itens da wave atual
    - [ ] Verificar que nada esta quebrado
    - [ ] So avancar para proxima wave quando a atual estiver estavel

  Principios durante execucao:
    - Uma coisa por vez (nao misturar waves)
    - Testar continuamente (nao deixar testes para o final)
    - Commitar apos cada unidade logica (nao commits gigantes)

FASE 4 — VERIFICAR

  Antes de considerar "pronto":
    - [ ] Todos os requisitos da fase 1 atendidos
    - [ ] Testes passando (unit + integration + E2E criticos)
    - [ ] Build de producao sem erros
    - [ ] Funcionalidades testadas manualmente (happy path + edge cases)
    - [ ] Documentacao minima (README, API docs se aplicavel)

---

FORMATO DE SAIDA

  Plano de Projeto
    Objetivo: [o que sera criado]
    Stack: [tecnologias escolhidas]
    Waves:
      Wave 1: [itens]
      Wave 2: [itens]
      ...
    Criterios de pronto: [lista]

---

PROMPT DE EXEMPLO

  "Preciso criar [tipo de aplicacao] com [funcionalidades].
  Stack: [preferencias ou 'me recomende'].
  Me ajude a planejar e executar por fases."

---

SKILLS A CONSULTAR

  skills/workflow/goal-backward-planning.md    Planejamento goal-backward
  skills/workflow/project-workflow.md          Ciclo de 6 fases
  agents/generators/boilerplate-generator.md   Geracao de estrutura inicial
  agents/generators/project-planner.md         ROADMAP + PLAN
