---
name: domain-driven-design
description: 'DDD: bounded contexts, aggregates, domain events, linguagem ubiqua'
---

DESIGN ESTRATEGICO

Linguagem Ubiqua:
- [ ] Mesmos termos usados pelo negocio e pelo codigo (nao traduzir, nao inventar sinonimos)
- [ ] Glossario documentado e acessivel a todos
- [ ] Mudanca no vocabulario de negocio refletida imediatamente no codigo

  Bom:  class Pedido, metodo confirmarPagamento()
  Ruim: class Order, metodo processPayment() (quando o negocio fala "pedido" e "confirmar pagamento")

Bounded Contexts:
- [ ] Cada contexto tem seu proprio modelo — mesmo conceito pode ter representacao diferente em contextos diferentes
- [ ] Limites definidos por funcao de negocio, nao por camada tecnica

  Exemplo:
    Contexto "Vendas": Cliente tem carrinho, historico de pedidos, preferencias
    Contexto "Financeiro": Cliente tem CPF, endereco de cobranca, limite de credito
    → Sao o mesmo "cliente" no mundo real, mas modelos diferentes no codigo

Context Mapping (relacoes entre contextos):
- [ ] Partnership: dois times colaboram e evoluem juntos
- [ ] Customer-Supplier: um contexto serve outro, negociam prioridades
- [ ] Conformist: aceita o modelo do outro contexto sem mudanca
- [ ] Anti-Corruption Layer (ACL): traduz entre modelos para proteger o dominio
- [ ] Shared Kernel: parte compartilhada (usar com cautela — cria acoplamento)

---

DESIGN TATICO

Entities:
- [ ] Objetos com identidade unica que persiste ao longo do tempo
- [ ] Igualdade por ID, nao por atributos
  Ex: dois usuarios com mesmo nome sao entidades diferentes (IDs diferentes)

Value Objects:
- [ ] Objetos sem identidade — definidos pelos seus atributos
- [ ] Imutaveis — para mudar, cria um novo
- [ ] Igualdade por valor dos atributos
  Ex: Endereco(rua, cidade, cep), Dinheiro(valor, moeda), Email(endereco)

Aggregates:
- [ ] Cluster de entities e value objects tratados como uma unidade
- [ ] Uma entity raiz (Aggregate Root) — unico ponto de acesso externo
- [ ] Regras de consistencia garantidas dentro do aggregate
- [ ] Aggregates pequenos — preferir 1 entity raiz + value objects
- [ ] Referenciar outros aggregates por ID, nao por referencia direta

  Bom:  Pedido (raiz) contem ItensDoPedido (value objects), referencia clienteId
  Ruim: Pedido contem Cliente (entity) + Produto (entity) + Estoque (entity)

Domain Events:
- [ ] Representam algo que aconteceu no dominio (passado: PedidoCriado, PagamentoConfirmado)
- [ ] Imutaveis — uma vez emitidos, nao mudam
- [ ] Usados para comunicacao entre aggregates e entre bounded contexts
- [ ] Nao confundir com comandos (CriarPedido e um comando, PedidoCriado e um evento)

Repositories:
- [ ] Abstracoes para persistencia de aggregates (nao de entities individuais)
- [ ] Interface definida no dominio, implementacao na infraestrutura
- [ ] Metodos expressam intencao do dominio: buscarPedidosPendentes(), nao findByStatus("pending")

Domain Services:
- [ ] Logica de dominio que nao pertence a nenhuma entity ou value object
- [ ] Operacoes que envolvem multiplos aggregates
- [ ] Sem estado (stateless)
  Ex: CalculadoraDeDesconto, ValidadorDeLimiteDeCredito

---

ESTRUTURA DE PASTAS

  src/
    domain/                 ← Regras de negocio puras (sem dependencia de framework/banco)
      pedido/
        Pedido.ts           ← Aggregate root
        ItemDoPedido.ts     ← Value object
        PedidoCriado.ts     ← Domain event
        PedidoRepository.ts ← Interface do repository
    application/            ← Casos de uso (orquestram o dominio)
      CriarPedido.ts
    infrastructure/         ← Implementacoes tecnicas
      PedidoRepositoryPostgres.ts
      PedidoController.ts

- [ ] Camada de dominio nao importa nada da infraestrutura
- [ ] Dependencias apontam para dentro (infra → app → dominio)

---

ANTI-PATTERNS

  ✗ Anemic Domain Model: entities com apenas getters/setters, logica toda nos services
  ✗ God Aggregate: aggregate com dezenas de entities (quebrar em aggregates menores)
  ✗ Leaking Infrastructure: imports de ORM ou HTTP dentro do dominio
  ✗ Big Ball of Mud: sem limites entre contextos, tudo acoplado
  ✗ Shared Database: dois bounded contexts lendo/escrevendo nas mesmas tabelas
  ✗ DDD Cargo Cult: aplicar todos os patterns sem complexidade que justifique

---

CHECKLIST DE DDD

- [ ] Linguagem ubiqua documentada e usada no codigo
- [ ] Bounded contexts identificados e mapeados
- [ ] Aggregates pequenos com raiz bem definida
- [ ] Value objects usados para conceitos sem identidade
- [ ] Domain events para comunicacao entre contextos
- [ ] Repositories com interface no dominio e implementacao na infra
- [ ] Camada de dominio sem dependencia de framework
- [ ] Context mapping documentado (como contextos se relacionam)

---

SKILLS A CONSULTAR

  skills/backend/rest-api-design.md         Design de API (como expor o dominio)
  skills/backend/error-handling.md          Tratamento de erros no dominio
  skills/database/schema-design.md          Design de schema (persistencia dos aggregates)
  skills/backend/event-sourcing.md          Event Sourcing como persistencia alternativa

