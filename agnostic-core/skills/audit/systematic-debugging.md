Debugging Sistematico

Processo de 4 fases para investigar e corrigir bugs de forma metodica.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

PROCESSO DE 4 FASES

  1. REPRODUZIR → confirmar o bug com passos exatos
  2. ISOLAR    → reduzir o escopo ate encontrar a area do problema
  3. ENTENDER  → descobrir a causa raiz (nao o sintoma)
  4. CORRIGIR  → aplicar a correcao e prevenir regressao

---

FASE 1 — REPRODUZIR

Objetivo: transformar "ta dando erro" em passos reproduziveis.

Coletar informacoes:
  - [ ] Qual o comportamento esperado?
  - [ ] Qual o comportamento observado?
  - [ ] Passos exatos para reproduzir (1, 2, 3...)
  - [ ] Ambiente: browser, OS, versao do app, staging/producao?
  - [ ] Frequencia: sempre, as vezes, raro, apenas uma vez?
  - [ ] Quando comecou? (correlacionar com deploys recentes)

Taxa de reproducao:
  Sempre (100%)     → mais facil de debugar; seguir para fase 2
  Frequente (>50%)  → tentar identificar condicoes; pode ser race condition
  Raro (<50%)       → coletar mais dados; logs, monitoring, user reports
  Nao reproduzivel  → pedir mais informacoes; pode ser especifico do ambiente

Se nao conseguir reproduzir:
  - Verificar diferencas de ambiente (producao vs local)
  - Verificar dados especificos do usuario
  - Adicionar logging temporario para capturar o proximo ocorrencia

---

FASE 2 — ISOLAR

Objetivo: reduzir o universo de possibilidades.

Perguntas de isolamento:
  - [ ] Quando comecou? Correlacionar com commits/deploys recentes (git log, git bisect)
  - [ ] O que mudou? Diff entre versao que funciona e versao com bug
  - [ ] Ocorre em todos os ambientes? (local, staging, producao)
  - [ ] Ocorre com todos os usuarios ou dados especificos?
  - [ ] Qual o caso minimo de reproducao? (remover complexidade ate o essencial)

Tecnicas de isolamento:
  git bisect         → encontrar o commit que introduziu o bug
  Comentar codigo    → remover partes ate o bug desaparecer
  Dados minimos      → testar com o menor input que reproduz o problema
  Ambiente limpo     → testar sem extensoes, cache, plugins

---

FASE 3 — ENTENDER

Objetivo: encontrar a causa raiz, nao apenas o sintoma.

5 Whys (5 Porques):
  Por que o usuario ve erro 500?
    → Porque a query retorna null
  Por que a query retorna null?
    → Porque o campo foi renomeado na migration
  Por que o campo renomeado quebrou?
    → Porque o codigo ainda referencia o nome antigo
  Por que o codigo nao foi atualizado?
    → Porque a migration e o codigo foram em commits separados sem teste
  Por que nao foi pego nos testes?
    → Porque nao tem teste de integracao para esse endpoint

Causa raiz encontrada: falta de teste de integracao + migration sem coordenar com codigo.

Diferenciar:
  Sintoma        → erro 500 no endpoint /api/users
  Causa imediata → campo 'name' renomeado para 'full_name' na tabela
  Causa raiz     → processo de migration sem checklist de verificacao

---

FASE 4 — CORRIGIR E VERIFICAR

Objetivo: corrigir a causa raiz e prevenir regressao.

Antes de corrigir:
  - [ ] Entendi a causa raiz (nao apenas o sintoma)?
  - [ ] A correcao resolve a causa raiz ou apenas mascara o sintoma?
  - [ ] A correcao pode introduzir efeitos colaterais?

Apos corrigir:
  - [ ] O bug nao reproduz mais (testar com os passos da fase 1)
  - [ ] Funcionalidades relacionadas continuam funcionando
  - [ ] Teste de regressao adicionado (para que o bug nao volte)
  - [ ] Sem efeitos colaterais em outras areas

Prevencao:
  - Adicionar teste que falha sem a correcao (teste de regressao)
  - Se aplicavel: adicionar validacao, constraint, ou checklist
  - Documentar a causa raiz para referencia futura (se nao-obvio)

---

CHECKLIST RAPIDO

Antes de comecar:
  - [ ] Tenho passos claros de reproducao?
  - [ ] Sei quando comecou (ou correlacao com mudancas recentes)?
  - [ ] Sei em quais ambientes ocorre?

Durante investigacao:
  - [ ] Estou olhando para a causa raiz ou apenas o sintoma?
  - [ ] Estou usando dados/evidencias ou chutando?
  - [ ] Ja isolei o escopo (git bisect, caso minimo)?

Apos correcao:
  - [ ] Bug nao reproduz com os passos originais?
  - [ ] Teste de regressao adicionado?
  - [ ] Areas relacionadas verificadas?

---

ANTI-PATTERNS DE DEBUGGING

  ✗ Mudancas aleatorias ("vou mudar aqui pra ver se funciona")
    → Use evidencias, nao intuicao

  ✗ Ignorar evidencias que contradizem sua hipotese
    → Se os dados nao batem com sua teoria, mude a teoria

  ✗ Parar no sintoma ("consertei o erro 500")
    → Sempre perguntar "por que isso aconteceu?"

  ✗ Nao adicionar teste de regressao
    → Sem teste, o bug vai voltar

  ✗ Debugar em producao com mudancas ao vivo
    → Reproduzir localmente; se impossivel, usar feature flag

  ✗ "Funciona na minha maquina"
    → Verificar diferencas de ambiente, dados, configuracao

---

SKILLS A CONSULTAR

  skills/audit/code-review.md          Checklist de revisao (prevencao)
  skills/testing/unit-testing.md       Testes de regressao
  skills/testing/integration-testing.md  Testes de integracao
  commands/workflows/debug.md          Workflow de debug
