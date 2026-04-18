Estrategias de Migracao

Objetivo: Migrar sistemas, frameworks, bibliotecas ou bancos de dados de forma incremental, segura e com rollback possivel em cada etapa.

---

TIPOS DE MIGRACAO

| Tipo | Exemplo | Risco |
|---|---|---|
| Framework | Express → Fastify, Angular → React | Alto — reescrita de logica |
| Biblioteca | Moment.js → date-fns, Lodash → nativo | Medio — substituicao pontual |
| Banco de dados | MySQL → PostgreSQL, SQL → NoSQL | Alto — dados e queries |
| API | REST v1 → v2, monolito → microservicos | Alto — contratos com clientes |
| Linguagem | JavaScript → TypeScript, Python 2 → 3 | Medio-Alto — todo o codebase |
| Infra | VPS → containers, on-prem → cloud | Alto — deploy e operacao |

---

STRANGLER FIG

Padrao: substituir o sistema antigo incrementalmente, feature por feature, ate que o antigo possa ser desligado.

  Sistema antigo ← [roteador/proxy] → Sistema novo
  Feature A: roteada para o novo
  Feature B: roteada para o novo
  Feature C: ainda no antigo (proxima iteracao)

- [ ] Camada de roteamento no meio (proxy, API gateway, feature flag)
- [ ] Migrar uma feature por vez — nunca tudo junto
- [ ] Cada feature migrada funciona de ponta a ponta antes de migrar a proxima
- [ ] Sistema antigo continua funcionando ate a ultima feature ser migrada
- [ ] Rollback: reverter roteamento para o antigo (deve ser instantaneo)

Quando usar: monolito → microservicos, reescrita de frontend, troca de framework

---

PARALLEL RUN

Padrao: rodar sistema antigo e novo ao mesmo tempo, comparar resultados, migrar quando confiante.

- [ ] Ambos recebem o mesmo input (request duplicada ou evento replicado)
- [ ] Resultado do antigo e usado pelo usuario (o novo so compara)
- [ ] Diferencas entre outputs sao logadas e investigadas
- [ ] Migrar para o novo somente quando diferencas chegam a zero (ou threshold aceitavel)
- [ ] Monitorar performance de ambos (o novo nao pode ser mais lento)

Quando usar: sistemas financeiros, processamento critico, quando erro e inaceitavel

---

BRANCH BY ABSTRACTION

Padrao: introduzir camada de abstracao, trocar implementacao por tras, remover abstracao.

  Passo 1: Extrair interface/abstracao sobre o componente atual
  Passo 2: Codigo cliente usa a abstracao (nao a implementacao direta)
  Passo 3: Criar nova implementacao da mesma abstracao
  Passo 4: Trocar para nova implementacao (feature flag ou config)
  Passo 5: Remover implementacao antiga e a abstracao (se nao mais necessaria)

- [ ] Abstracao reflete o contrato, nao os detalhes da implementacao antiga
- [ ] Feature flag para alternar entre implementacoes em producao
- [ ] Testes rodam contra ambas implementacoes durante a transicao

Quando usar: troca de ORM, troca de servico externo, troca de biblioteca

---

MIGRACAO DE DADOS

- [ ] Dual-write: sistema escreve no banco antigo E no novo durante a transicao
- [ ] Backfill: copiar dados historicos do antigo para o novo (em batches, nao tudo de uma vez)
- [ ] Verificacao de consistencia: comparar dados entre antigo e novo periodicamente
- [ ] Rollback plan: como voltar para o antigo se algo der errado com os dados
- [ ] Periodo de read-only no antigo antes de desligar (garantir que nada mais escreve)

Sequencia recomendada:
  1. Backfill dados historicos (pode levar dias/semanas)
  2. Habilitar dual-write (antigo + novo)
  3. Verificar consistencia
  4. Migrar leituras para o novo
  5. Desabilitar escrita no antigo
  6. Periodo de observacao
  7. Desligar o antigo

---

PLANEJAMENTO

- [ ] Inventario: listar tudo que e afetado (arquivos, tabelas, APIs, testes, docs)
- [ ] Escopo incrementos: dividir em fases que entregam valor individualmente
- [ ] Criterios de rollback por fase: o que faz voltar atras? (erros > X%, latencia > Y)
- [ ] Testes antes de migrar: cobertura minima no codigo que sera migrado
- [ ] Comunicacao: stakeholders sabem o que esta acontecendo e o impacto esperado
- [ ] Feature flags para controlar a transicao gradualmente
- [ ] Metricas de progresso: % migrado, erros na parte nova vs antiga, performance

---

ANTI-PATTERNS

  ✗ Big Bang Rewrite: reescrever tudo do zero e lancar de uma vez (alto risco, historicamente falha)
  ✗ Migrar sem testes: se nao tem testes no codigo atual, escrever antes de migrar
  ✗ Sem rollback plan: "se der errado a gente ve" — nao e plano
  ✗ Migrar e manter os dois para sempre (definir deadline para desligar o antigo)
  ✗ Subestimar backfill de dados (pode levar semanas em volumes grandes)
  ✗ Migrar infraestrutura e logica ao mesmo tempo (uma coisa por vez)
  ✗ Nao comunicar stakeholders (surpresas geram resistencia)

---

CHECKLIST DE MIGRACAO

- [ ] Tipo de migracao identificado e estrategia escolhida
- [ ] Inventario completo do que sera afetado
- [ ] Fases definidas com entregaveis independentes
- [ ] Testes escritos para o codigo que sera migrado
- [ ] Criterios de rollback definidos por fase
- [ ] Feature flags para controle gradual
- [ ] Backfill de dados planejado (se aplicavel)
- [ ] Verificacao de consistencia entre antigo e novo
- [ ] Metricas de progresso e sucesso definidas
- [ ] Deadline para desligar o sistema antigo
- [ ] Comunicacao com stakeholders em cada fase

---

SKILLS A CONSULTAR

  skills/audit/refactoring.md               Decomposicao e refatoracao incremental
  skills/devops/deploy-procedures.md        Estrategias de deploy (rolling, blue-green, canary)
  skills/database/schema-design.md          Design de schema e migrations
  skills/backend/domain-driven-design.md    Bounded contexts (migrar por contexto)
