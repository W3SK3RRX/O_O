Workflow: Brainstorm

Template para explorar opcoes e tomar decisoes informadas antes de implementar.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

QUANDO USAR

  - Requisitos pouco claros ou ambiguos
  - Problema com multiplas solucoes possiveis
  - Decisao arquitetural com trade-offs significativos
  - Equipe precisa alinhar antes de comecar a codar

---

PROCESSO (3 PASSOS)

PASSO 1 — CLARIFICAR OBJETIVO

  Antes de gerar opcoes, entender exatamente o que se quer resolver.

  Perguntas:
    - Qual problema estamos resolvendo?
    - Para quem? (usuario final, equipe interna, sistema)
    - Quais constraints existem? (prazo, tecnologia, infra, equipe)
    - O que define sucesso? (metricas, comportamento esperado)
    - O que ja foi tentado? (evitar repetir erros)

PASSO 2 — GERAR OPCOES

  Produzir 2-4 opcoes distintas (nao variacoes da mesma ideia).

  Para cada opcao:
    - Nome curto e descritivo
    - Como funciona (1-3 paragrafos, sem codigo)
    - Pros (vantagens concretas)
    - Contras (desvantagens e riscos)
    - Esforco estimado (pequeno / medio / grande)
    - Quando e a melhor escolha

PASSO 3 — ANALISAR E RECOMENDAR

  Comparar opcoes lado a lado e recomendar uma com justificativa.

  Criterios de comparacao:
    - Complexidade de implementacao
    - Manutencao a longo prazo
    - Riscos tecnicos
    - Alinhamento com constraints
    - Time-to-value

---

FORMATO DE SAIDA

  Contexto
    [1-2 paragrafos descrevendo o problema e constraints]

  Opcao A: [nome]
    Como: [descricao]
    Pros: [lista]
    Contras: [lista]
    Esforco: [pequeno/medio/grande]

  Opcao B: [nome]
    Como: [descricao]
    Pros: [lista]
    Contras: [lista]
    Esforco: [pequeno/medio/grande]

  Opcao C: [nome] (se aplicavel)
    ...

  Recomendacao
    [Opcao recomendada com justificativa baseada nos criterios acima]

---

PRINCIPIOS

  - Nivel conceitual: sem codigo neste passo (codigo vem depois da decisao)
  - Transparencia: ser honesto sobre complexidade e riscos
  - Agencia: a decisao e de quem vai implementar/manter, nao do brainstorm
  - Pragmatismo: a opcao mais elegante nem sempre e a melhor — considerar contexto real

---

PROMPT DE EXEMPLO

  "Preciso decidir como implementar [funcionalidade].
  Contexto: [stack, constraints, prazo].
  Me de 2-3 opcoes com pros, contras e recomendacao."

---

SKILLS A CONSULTAR

  skills/workflow/goal-backward-planning.md  Para planejar apos decidir
  skills/audit/pre-implementation.md         Verificar antes de implementar
