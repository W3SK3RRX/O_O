---
name: event-sourcing
description: 'Event Sourcing e CQRS: eventos imutaveis, projections, versionamento'
---

CONCEITOS FUNDAMENTAIS

Event Store:
- [ ] Banco de dados append-only — eventos nunca sao editados ou deletados
- [ ] Cada aggregate tem um stream de eventos identificado por aggregate ID
- [ ] Eventos armazenados em ordem (version/sequence number)
- [ ] Schema minimo: streamId, version, eventType, data (JSON), timestamp, metadata

Eventos:
- [ ] Nome no passado: PedidoCriado, PagamentoConfirmado, ItemAdicionado
- [ ] Imutaveis — uma vez gravados, nunca mudam
- [ ] Auto-contidos: todas as informacoes necessarias para reconstruir a mudanca
- [ ] Versionados: campo schemaVersion para evoluir o formato sem quebrar leitores

  Bom:
    { "type": "PedidoCriado", "data": { "pedidoId": "abc", "clienteId": "xyz", "itens": [...], "total": 150.00 }, "version": 1 }

  Ruim:
    { "type": "UPDATE", "data": { "field": "status", "value": "created" } }

Reconstrucao de estado:
- [ ] Estado atual = replay de todos os eventos do stream, na ordem
- [ ] Funcao pura: apply(estadoAtual, evento) → novoEstado
- [ ] Nenhuma logica de negocio no replay — apenas projecao de dados

---

SNAPSHOTS

- [ ] Snapshot salva o estado reconstruido em um ponto para evitar replay de todos os eventos
- [ ] Carregar: snapshot mais recente + eventos posteriores ao snapshot
- [ ] Frequencia: a cada N eventos (ex: 100) ou por tempo
- [ ] Snapshots sao otimizacao — o event store continua sendo a fonte de verdade

---

CQRS — COMMAND QUERY RESPONSIBILITY SEGREGATION

- [ ] Lado de escrita (Command): valida regras de negocio, grava eventos no event store
- [ ] Lado de leitura (Query): le de modelos otimizados para consulta (projections)
- [ ] Modelos de leitura podem ser desnormalizados, especificos por caso de uso

  Escrita: CriarPedido → valida → grava PedidoCriado no event store
  Leitura: PedidosPorCliente → tabela desnormalizada com dados prontos para exibir

Eventual Consistency:
- [ ] Projections sao atualizadas de forma assincrona apos o evento ser gravado
- [ ] Lag entre escrita e leitura e normal e esperado
- [ ] UI deve lidar com isso (ex: mostrar "processando" ou read-your-writes)
- [ ] Definir SLO para lag maximo aceitavel (ex: < 2 segundos em 99% dos casos)

---

PROJECTIONS (READ MODELS)

- [ ] Cada projection serve um caso de uso especifico de leitura
- [ ] Rebuil possivel a qualquer momento a partir do event store
- [ ] Podem usar tecnologias diferentes (SQL para relatorios, Elasticsearch para busca, Redis para dashboards)
- [ ] Idempotentes: processar o mesmo evento duas vezes nao duplica dados

  Exemplo:
    Eventos: PedidoCriado, ItemAdicionado, PagamentoConfirmado
    Projection "Pedidos Recentes": tabela com id, cliente, total, status, data
    Projection "Relatorio Financeiro": tabela com receita por dia, por produto

---

VERSIONAMENTO DE EVENTOS

- [ ] Eventos ja gravados nunca mudam de formato
- [ ] Novo formato → novo schemaVersion
- [ ] Upcaster: transforma evento antigo no formato novo durante o replay
- [ ] Manter backward compatibility por tempo definido (ex: 6 meses)
- [ ] Documentar mudancas de schema em changelog de eventos

---

ANTI-PATTERNS

  ✗ Eventos como CRUD (CriouRegistro, AtualizouRegistro) — devem expressar intencao de negocio
  ✗ Eventos gigantes com todo o estado (gravar apenas a mudanca)
  ✗ Editar ou deletar eventos no store (viola imutabilidade)
  ✗ Logica de negocio nas projections (projections apenas projetam dados)
  ✗ Ignorar eventual consistency na UI (usuario ve dados desatualizados sem feedback)
  ✗ Sem snapshots em streams com milhares de eventos (replay lento)
  ✗ Acoplamento entre projections e a estrutura interna dos eventos

---

CHECKLIST

- [ ] Eventos nomeados no passado e com intencao de negocio
- [ ] Event store e append-only
- [ ] Estado reconstruido via replay puro (sem side effects)
- [ ] Snapshots configurados para streams longos
- [ ] Projections idempotentes e reconstruiveis
- [ ] Versionamento de eventos com upcasters
- [ ] Eventual consistency tratada na UI
- [ ] Lag de projections monitorado
- [ ] Backup do event store (e a fonte de verdade)
- [ ] Time entende os trade-offs antes de adotar

---

SKILLS A CONSULTAR

  skills/backend/domain-driven-design.md    DDD (aggregates, domain events, bounded contexts)
  skills/backend/financial-operations.md    Operacoes financeiras (idempotencia, audit trail)
  skills/database/schema-design.md          Design de schema (projections e event store)
  skills/backend/error-handling.md          Tratamento de erros em comandos

