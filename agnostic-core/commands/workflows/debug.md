Workflow: Debug

Template para investigacao sistematica de bugs.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

QUANDO USAR

  - Bug report de usuario ou QA
  - Comportamento inesperado em staging ou producao
  - Erro que nao e obvio pela mensagem
  - Regressao apos deploy

---

PROCESSO (4 PASSOS)

PASSO 1 — COLETAR INFORMACOES

  - [ ] Qual o comportamento esperado?
  - [ ] Qual o comportamento observado?
  - [ ] Passos exatos para reproduzir
  - [ ] Ambiente: browser, OS, versao, staging/producao?
  - [ ] Frequencia: sempre, as vezes, raro?
  - [ ] Quando comecou? Correlacionar com deploys recentes
  - [ ] Logs relevantes, mensagens de erro, screenshots

PASSO 2 — FORMAR HIPOTESES

  Com base nas informacoes coletadas, listar hipoteses em ordem de probabilidade:

  Hipotese 1 (mais provavel): [descricao]
    Como verificar: [acao concreta]

  Hipotese 2: [descricao]
    Como verificar: [acao concreta]

  Hipotese 3: [descricao]
    Como verificar: [acao concreta]

PASSO 3 — INVESTIGAR SISTEMATICAMENTE

  Testar hipoteses uma por vez (nao mudar varias coisas ao mesmo tempo):

  - [ ] Testar hipotese mais provavel primeiro
  - [ ] Se confirmada: ir para passo 4
  - [ ] Se refutada: registrar resultado e testar proxima hipotese
  - [ ] Se todas refutadas: coletar mais informacoes, formar novas hipoteses

  Tecnicas uteis:
    git bisect       → encontrar commit que introduziu o bug
    Caso minimo      → remover complexidade ate o bug desaparecer
    Logging pontual  → adicionar logs temporarios nos pontos suspeitos
    Ambiente limpo   → testar sem cache, extensoes, dados de sessao

PASSO 4 — CORRIGIR E PREVENIR

  - [ ] Corrigir a causa raiz (nao apenas o sintoma)
  - [ ] Verificar que o bug nao reproduz com os passos originais
  - [ ] Verificar que funcionalidades relacionadas continuam OK
  - [ ] Adicionar teste de regressao
  - [ ] Remover logging temporario

---

FORMATO DE SAIDA

  Bug Report
    Sintoma: [o que o usuario viu]
    Causa raiz: [o que realmente aconteceu]
    Correcao: [o que foi feito]

  Investigacao
    Hipoteses testadas:
      1. [hipotese] → [confirmada/refutada] — [evidencia]
      2. [hipotese] → [confirmada/refutada] — [evidencia]

  Comparacao
    Antes: [comportamento com bug]
    Depois: [comportamento corrigido]

  Prevencao
    - [teste adicionado]
    - [melhoria de processo, se aplicavel]

---

PROMPT DE EXEMPLO

  "Estou vendo [erro/comportamento] quando [acao].
  Comecou [quando]. Ambiente: [detalhes].
  Me ajude a investigar sistematicamente e encontrar a causa raiz."

---

SKILLS A CONSULTAR

  skills/audit/systematic-debugging.md   Metodologia completa de debugging
  skills/audit/code-review.md            Prevencao via revisao de codigo
  skills/testing/unit-testing.md         Testes de regressao
