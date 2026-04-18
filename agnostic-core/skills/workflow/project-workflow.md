Project Workflow

Objetivo: Ciclo estruturado de desenvolvimento em 6 fases com artefatos definidos por fase, commits atomicos e protocolo de decisao explicito.

Adaptado da metodologia get-shit-done (MIT). Fonte: https://github.com/gsd-build/get-shit-done

---

CICLO DE 6 FASES

  Initialize → Discuss → Plan → Execute → Verify → Complete

Cada fase produz artefatos especificos. Nao pule fases em tarefas novas ou complexas.

---

FASE 1: INITIALIZE

Objetivo: Entender o que ja existe antes de qualquer decisao.

Acoes:
- [ ] Mapear estrutura do projeto (entrypoints, dependencias, convencoes)
- [ ] Identificar artefatos existentes relevantes (migrations, schemas, APIs, testes)
- [ ] Registrar descobertas em PROJECT.md na raiz

Artefato: PROJECT.md
  Campos minimos:
  - Stack: linguagem, framework, banco, infra
  - Entrypoints: arquivos de entrada da aplicacao
  - Convencoes: nomenclatura, estrutura de pastas, estilo de commits
  - Dependencias externas: APIs, servicos, SDKs
  - Restricoes conhecidas: limites de performance, compliance, custos

---

FASE 2: DISCUSS

Objetivo: Alinhar escopo, decisoes e restricoes antes de planejar.

Acoes:
- [ ] Formular o goal observavel (ver skills/workflow/goal-backward-planning.md)
- [ ] Identificar decisoes necessarias (ver Decision Fidelity abaixo)
- [ ] Confirmar restricoes de tempo, custo e tecnologia

Nao crie codigo nem plano de execucao nesta fase.
Resultado: decisoes registradas em PROJECT.md, secao "Decisoes".

---

FASE 3: PLAN

Objetivo: Gerar ROADMAP.md e PLAN.md para a fase atual.

Artefatos:

  ROADMAP.md
  - Lista de fases do projeto com goal de cada fase
  - Success criteria observaveis por fase
  - Dependencias entre fases

  PLAN.md (para a fase atual)
  - Goal da fase (goal-backward)
  - Observable Truths
  - Required Artifacts
  - Tasks organizadas em waves (ver skills/workflow/goal-backward-planning.md)
  - Checkpoints obrigatorios

Regra: o PLAN.md deve caber em ~30-40% do contexto. Se nao couber, divida a fase.

TDD Detection:
Se a fase envolve logica de negocio verificavel, crie PLAN-TDD.md separado com:
- Cenarios de teste por behavior (nao por funcao)
- Casos de borda identificados
- Coverage minima esperada

---

FASE 4: EXECUTE

Objetivo: Implementar o PLAN.md com commits atomicos por task.

Padrao de commit:
  type(fase-plano-task): descricao em imperativo

  Exemplos:
  feat(f2-auth-1a): criar schema User com campos obrigatorios
  test(f2-auth-2b): adicionar cenarios de token expirado
  fix(f2-auth-3): corrigir validacao de senha no authService
  refactor(f2-auth-4): extrair tokenUtils de authService

  Types validos: feat / fix / test / refactor / docs / chore / ci / perf

Regras de execucao:
- [ ] Uma task por vez (nao acumule antes de commitar)
- [ ] Testes passando antes de commitar
- [ ] Nao modifique arquivos fora do escopo do PLAN.md sem registrar como nova task
- [ ] Se bloquear em uma task, registre o bloqueio e va para a proxima

---

FASE 5: VERIFY

Objetivo: Confirmar que o goal da fase foi atingido.

Acoes:
- [ ] Percorrer as Observable Truths do PLAN.md — cada uma deve ser verificavel
- [ ] Rodar suite de testes completa
- [ ] Revisar com agent relevante (security, performance, code-inspector)
- [ ] Documentar resultado em VERIFICATION.md

Artefato: VERIFICATION.md
  Campos:
  - Fase verificada
  - Truths verificadas: [PASS / FAIL por item]
  - Resultado dos testes: [N passes / N failures]
  - Issues encontradas: [severidade + descricao + acao]
  - Status: APROVADO / AJUSTAR / BLOQUEAR

Se status for AJUSTAR ou BLOQUEAR, volte para EXECUTE com novo PLAN.md de correcao.

---

FASE 6: COMPLETE

Objetivo: Fechar a fase, atualizar documentacao e preparar proximo ciclo.

Acoes:
- [ ] Atualizar ROADMAP.md marcando a fase como concluida
- [ ] Gerar SUMMARY.md com o que foi feito e o que ficou fora do escopo
- [ ] Atualizar README.md se a interface externa mudou
- [ ] Abrir issues para itens descobertos mas fora do escopo
- [ ] Iniciar proximo ciclo com DISCUSS da proxima fase

---

DECISION FIDELITY

Classifique cada decisao no PLAN.md:

  Locked (nao-negociavel):
  Decisoes com impacto irreversivel ou que dependem de stakeholder humano.
  Exemplos: schema de banco em producao, contrato de API publica, escolha de provedor cloud.
  Acao: sempre gerar [CHECKPOINT: human-verify] antes de executar.

  Discretionary (IA decide):
  Decisoes de implementacao sem impacto em interfaces externas.
  Exemplos: nome de variavel interna, estrutura de pasta privada, helper interno.
  Acao: IA toma a decisao e documenta no commit.

  Deferred (fora de escopo):
  Decisoes que nao precisam ser resolvidas nesta fase.
  Acao: registrar em ROADMAP.md como item de fase futura.

---

CHECKLIST DE QUALIDADE POR FASE

  Initialize:
  - [ ] PROJECT.md criado com stack, entrypoints e convencoes

  Plan:
  - [ ] Goal observavel (nao e uma acao)
  - [ ] Tasks em waves de dependencia
  - [ ] Checkpoints em decisoes locked
  - [ ] TDD plan separado se logica de negocio envolvida

  Execute:
  - [ ] Commits atomicos por task
  - [ ] Testes passando a cada commit
  - [ ] Nenhum arquivo fora do escopo modificado sem registro

  Verify:
  - [ ] Todas as truths verificadas explicitamente
  - [ ] VERIFICATION.md gerado com status final

  Complete:
  - [ ] SUMMARY.md gerado
  - [ ] Items out-of-scope registrados como issues
