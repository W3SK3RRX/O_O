Goal-Backward Planning

Objetivo: Planejar tarefas a partir do resultado esperado, nao das acoes. Define o que precisa ser verdadeiro para o objetivo estar completo antes de decidir como chegar la.

Adaptado da metodologia get-shit-done (MIT). Fonte: https://github.com/gsd-build/get-shit-done

---

ANATOMIA DO PLANO GOAL-BACKWARD

Para cada fase ou tarefa, derive na ordem:

1. GOAL
O que estara diferente quando isso estiver completo?
Escreva como estado observavel, nao como acao.

  Ruim:  "Implementar autenticacao"
  Bom:   "Usuario consegue fazer login com email/senha e recebe JWT valido"

2. OBSERVABLE TRUTHS
O que precisa ser verdadeiro para o goal estar atingido?
Liste pre-condicoes e invariantes. Cada truth e verificavel sem ambiguidade.

  - Rota POST /auth/login existe e retorna 200 com { token, expiresAt }
  - Senha nunca trafega em plaintext
  - Token expira em 24h e e rejeitado apos expiracao
  - Tentativas invalidas retornam 401, nao 500

3. REQUIRED ARTIFACTS
Quais arquivos, schemas, configs precisam existir para as truths serem verificaveis?

  - src/routes/auth.js
  - src/services/authService.js
  - src/middleware/authenticate.js
  - tests/auth.test.js (cenarios: login valido, senha errada, token expirado)
  - .env.example com JWT_SECRET documentado

4. KEY LINKS
Referencias externas necessarias para nao reinventar o que ja existe.

  - Documentacao da lib JWT em uso
  - Policy de seguranca: compliance/policies/security-policy.md
  - Skill de hardening: skills/security/api-hardening.md

---

DISCOVERY LEVELS

Use para calibrar quanto investigar antes de planejar:

- [ ] Level 0 — Contexto familiar
  Use o que voce ja sabe. Sem pesquisa adicional.
  Quando: tecnologia conhecida, padrao ja feito antes no projeto.

- [ ] Level 1 — Quick scan
  Leia README, changelog da versao e 1-2 exemplos oficiais.
  Quando: biblioteca conhecida mas versao nova, ou padrao novo no projeto.

- [ ] Level 2 — Deep dive
  Leia documentacao completa da feature, issues conhecidos, exemplos de producao.
  Quando: integracao com sistema externo, migracao de schema, feature critica.

- [ ] Level 3 — Research mode
  POC antes de planejar, benchmarks, security advisories, alternativas comparadas.
  Quando: decisao arquitetural irreversivel, performance critica, nenhum precedente.

Regra: aplique o menor level que elimina incerteza. Level 3 em tarefas triviais e desperdicio de contexto.

---

WAVE-BASED PARALLELIZATION

Agrupe tasks por dependencia, nao por camada tecnica. Tasks sem dependencia entre si formam uma wave e podem rodar em paralelo.

  Ruim (por camada — introduz dependencias artificiais):
    Wave 1: todos os models
    Wave 2: todos os services
    Wave 3: todos os controllers

  Bom (por fluxo — respeita dependencias reais):
    Wave 1: schema User + schema Token (sem dependencia entre si)
    Wave 2: authService (depende de User) em paralelo com tokenService (depende de Token)
    Wave 3: authController (depende dos dois services)

Formato de task com wave:

  Wave 1 (paralelo):
  - [ ] task-1a: Criar schema User
  - [ ] task-1b: Criar schema Token

  Wave 2 (paralelo, apos wave 1):
  - [ ] task-2a: Implementar authService (depende: task-1a)
  - [ ] task-2b: Implementar tokenService (depende: task-1b)

---

CHECKPOINT PROTOCOL

Use em pontos criticos do plano para nao continuar sem validacao humana:

  [CHECKPOINT: human-verify]
  Antes de prosseguir, confirme que: [condicao especifica]
  Exemplo: schema de banco esta correto antes de gerar migrations

  [CHECKPOINT: decision]
  Decisao necessaria: [opcoes com trade-offs]
  Padrao se nao houver resposta: [opcao padrao]

  [CHECKPOINT: human-action]
  Acao manual necessaria: [o que fazer]
  Exemplo: configurar variavel de ambiente JWT_SECRET no servidor

Nunca continue apos um checkpoint sem resolucao explicita.

---

CONTEXT BUDGET

Um plano bem formado usa ~30-40% do contexto. Se o plano esta consumindo mais:

- [ ] O plano esta tentando fazer pesquisa e planejamento ao mesmo tempo → separe
- [ ] O escopo e grande demais para uma unica sessao → divida em fases
- [ ] Ha muita exploracao de codebase inline → use um agent separado para mapeamento

Consulte: skills/workflow/context-management.md

---

CHECKLIST DE QUALIDADE DO PLANO

- [ ] Goal e observavel (nao uma acao)
- [ ] Cada truth e verificavel sem ambiguidade
- [ ] Artifacts cobrem todos os arquivos necessarios
- [ ] Tasks estao agrupadas por wave de dependencia
- [ ] Checkpoints marcados em decisoes irreversiveis
- [ ] Discovery level adequado ao risco da tarefa
- [ ] Plano cabe em ~30-40% do contexto disponivel
