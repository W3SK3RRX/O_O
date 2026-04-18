Model Routing

Objetivo: Escolher o modelo certo para cada tipo de tarefa, otimizando custo e velocidade sem sacrificar qualidade onde ela importa.

Inspirado no conceito Smart Model Dispatch de andersonlimadev (TabNews, 2025) e na documentacao oficial do Claude Code.

---

PRINCIPIO

Nao faz sentido usar o modelo mais poderoso para gerar boilerplate. Reserve poder computacional para onde ele faz diferenca — arquitetura, decisoes complexas, raciocinio profundo.

O roteamento de modelos se aplica a qualquer ferramenta que permita selecionar modelos: Claude Code (/model), Cursor, APIs diretas, pipelines de CI com LLM.

---

TABELA DE ROTEAMENTO

  TIER 1 — Raciocinio complexo (Opus ou equivalente):
  - Planejamento de arquitetura e design de sistema
  - Analise de requisitos e decisoes com trade-offs
  - Refatoracao de codigo complexo com multiplas dependencias
  - Debug de problemas que envolvem multiplos sistemas
  - Revisao de seguranca e analise de vulnerabilidades
  - Decisoes arquiteturais que afetam o projeto inteiro

  TIER 2 — Implementacao padrao (Sonnet ou equivalente):
  - Logica de negocio (use cases, repositories, services)
  - Implementacao de componentes/telas com logica
  - Integracoes com APIs e bancos de dados
  - Code review de PRs
  - Testes de integracao e E2E
  - Documentacao tecnica que requer entendimento do codigo

  TIER 3 — Tarefas mecanicas (Haiku ou equivalente):
  - Geracao de arquivos de estilo (.styles.ts, CSS modules)
  - Traducoes e arquivos de i18n
  - Boilerplate e scaffolding
  - Mocks e fixtures de teste
  - Testes unitarios simples (AAA pattern)
  - Formatacao e ajustes cosmeticos
  - Leitura e exploracao de arquivos

---

DISPATCH PARALELO

Para features complexas, diferentes etapas podem usar modelos diferentes:

  Exemplo: "Implementar feature Watchlist"

  Fase 1 — [TIER 1] Planejar arquitetura
    Definir entidades, fluxo de dados, dependencias, API contracts.

  Fase 2 — [TIER 2] Implementar domain + data layers
    Use cases, repositories, models, integracoes.

  Fase 3 — [TIER 2] Implementar presentation layer
    Telas, componentes, view models, navegacao.

  Fase 4 — [TIER 3] Gerar artefatos mecanicos
    Estilos, traducoes, mocks, boilerplate de testes.

  Fase 5 — [TIER 3] Escrever testes unitarios
    Testes para cada camada seguindo patterns definidos na fase 1.

---

COMO APLICAR

  Claude Code:
  Usar /model para alternar entre modelos durante a sessao.
  O alias opusplan alterna automaticamente: opus em plan mode, sonnet em execucao.

  Cursor / Copilot:
  Configurar modelo por tipo de tarefa nas settings do editor.

  APIs diretas:
  Selecionar modelo programaticamente baseado no tipo de operacao:

    const MODEL_BY_TIER = {
      complex: 'claude-opus-4-6',
      standard: 'claude-sonnet-4-6',
      mechanical: 'claude-haiku-4-5-20251001'
    }

  Pipelines de CI:
  Usar modelo mais barato para linting, formatacao, geracao de changelogs.
  Reservar modelos potentes para analise de seguranca e code review automatizado.

---

IMPACTO EM CUSTO

A diferenca de custo entre tiers e significativa:

  Tier 3 (Haiku) custa ~80% menos que Tier 2 (Sonnet)
  Tier 2 (Sonnet) custa ~80% menos que Tier 1 (Opus)

Em um projeto tipico, ~60% das tarefas sao Tier 2 e ~25% sao Tier 3.
Rotear corretamente pode reduzir custos em 40-60% sem perda de qualidade.

---

QUANDO NAO ROTEAR PARA BAIXO

Manter no tier mais alto quando:
- A tarefa envolve seguranca (autenticacao, autorizacao, criptografia)
- O erro tem custo alto (dados financeiros, dados de usuario, producao)
- O contexto e ambiguo e requer interpretacao cuidadosa
- A decisao afeta a arquitetura do projeto a longo prazo

Na duvida, use o tier acima. O custo de um bug causado por modelo insuficiente e maior que a economia de tokens.

---

CHECKLIST

- [ ] Classificar a tarefa atual em tier antes de iniciar
- [ ] Usar modelo adequado ao tier (nao o mais caro por padrao)
- [ ] Para features complexas, planejar dispatch por fase
- [ ] Manter tier alto para decisoes de seguranca e arquitetura
- [ ] Revisar custos periodicamente e ajustar roteamento se necessario
