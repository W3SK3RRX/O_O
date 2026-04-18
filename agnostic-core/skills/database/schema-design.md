Schema Design

Design de schema de banco de dados: normalizacao, selecao de plataforma, ORM, indices e migrations seguras.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

SELECAO DE PLATAFORMA

  App simples, prototipo
    → SQLite (Turso para distribuido)
    Vantagem: zero config, arquivo unico, otimo para dev/testes

  App web padrao, relacional
    → PostgreSQL (Neon para serverless)
    Vantagem: robusto, extensoes (pgvector, PostGIS), comunidade enorme

  Backend-as-a-service
    → Supabase (PostgreSQL + auth + realtime + storage)
    Vantagem: rapido para MVP, dashboard, auth pronto

  Dados nao-estruturados
    → MongoDB
    Vantagem: schema flexivel, documentos aninhados, horizontal scaling

  Full-text search pesado
    → Elasticsearch / Meilisearch
    Vantagem: busca rapida, facets, typo tolerance

  Vetores para IA
    → pgvector (PostgreSQL) ou Pinecone
    Vantagem: similarity search para embeddings, RAG, recomendacoes

Criterios de decisao:
  - Tipo de dados (relacional, documento, grafo, vetor)
  - Volume e crescimento esperado
  - OLTP (transacional) vs OLAP (analitico)
  - Latencia exigida
  - Experiencia da equipe
  - Custo (serverless paga por uso; provisionado e fixo)

---

SELECAO DE ORM

  Prisma     → Schema declarativo, migrations automaticas, DX excelente
               Peso: bundle size, cold start em serverless
  Drizzle    → Leve, SQL-like, TypeScript-first, bom para serverless
  Kysely     → Query builder type-safe, zero overhead, sem schema file
  Knex       → Query builder puro, migrations manuais, flexivel
  Sequelize  → Maduro, muitos plugins, verbose, tipagem fraca
  TypeORM    → Decorators, active record ou data mapper, complexo

Quando nao usar ORM:
  - Queries complexas (CTEs, window functions, lateral joins)
  - Performance critica (raw SQL + EXPLAIN ANALYZE)
  - Banco com stored procedures existentes
  - Migracao de banco legado com schema nao-convencional

---

NORMALIZACAO

  1NF → Atributos atomicos, sem grupos repetitivos
        Ruim:  tags = "react,node,python"
        Bom:   tabela separada tag + tabela de juncao

  2NF → Sem dependencias parciais de chave composta
        Se a PK e composta, todo atributo depende da PK inteira

  3NF → Sem dependencias transitivas
        Se A → B → C, entao C nao deve estar na mesma tabela que A

Quando desnormalizar:
  - Leitura >> escrita (cache no schema)
  - Joins custosos em queries criticas (medir com EXPLAIN)
  - Dados que mudam raramente (nome da cidade junto com o endereco)
  Regra: normalize primeiro; desnormalize com evidencia de performance.

---

CHAVES PRIMARIAS

  Autoincrement  → Simples, sequencial. Expoe contagem. Usar para tabelas internas.
  UUID v4        → Distribuido, sem colisao. Nao-sequencial (fragmentacao de indice B-tree).
  CUID2          → Sortable, URL-safe, collision-resistant. Bom para IDs publicos.
  ULID           → Sortable como autoincrement, unico como UUID. Bom para logs e eventos.

Recomendacao:
  - IDs internos (FK, tabelas de juncao): autoincrement
  - IDs publicos (URL, API): CUID2 ou ULID
  - Sistemas distribuidos sem coordenacao: UUID v4

---

RELACIONAMENTOS

  1:1  → FK com UNIQUE constraint na tabela dependente
  1:N  → FK na tabela "muitos" referenciando a tabela "um"
  N:M  → Tabela de juncao com FKs para ambas as tabelas
  Self-ref → FK na mesma tabela (categorias pai/filho, hierarquias)

---

CONSTRAINTS OBRIGATORIOS

  - [ ] NOT NULL em campos obrigatorios (SQL default e NULL — seja explicito)
  - [ ] FK com ON DELETE definido:
        CASCADE  → deletar filhos junto com pai (comentarios de um post)
        SET NULL → manter orfao (autor deletado, post fica)
        RESTRICT → impedir delecao se houver filhos (categoria com produtos)
  - [ ] CHECK para validacoes de dominio (status IN ('active','inactive'), valor >= 0)
  - [ ] UNIQUE onde a regra de negocio exige (email, slug, CPF)
  - [ ] DEFAULT para campos com valor padrao (created_at, status = 'active')

---

INDICES

Quando criar:
  - Colunas em WHERE frequentes
  - Colunas em JOIN
  - Colunas em ORDER BY com volume alto
  - Colunas com alta cardinalidade (muitos valores distintos)

Tipos (PostgreSQL):
  B-tree   → padrao; igualdade e range (<, >, BETWEEN)
  Hash     → igualdade exata (pouco usado)
  GIN      → arrays, JSONB, full-text search (tsvector)
  GiST     → geometria, ranges, proximidade
  Partial  → indice condicional: CREATE INDEX ... WHERE status = 'active'

Indice composto:
  - Coluna mais seletiva primeiro (mais valores distintos)
  - Ordem importa: indice (A, B) serve queries com WHERE A, mas nao WHERE B sozinho

Anti-patterns:
  ✗ Indice em boolean ou enum com 2-3 valores (baixa cardinalidade)
  ✗ Indice em tabela com < 1000 linhas (seq scan e mais rapido)
  ✗ Muitos indices em tabela com escrita pesada (cada INSERT atualiza todos)
  ✗ Indice duplicado (verificar com pg_stat_user_indexes)

---

OTIMIZACAO DE QUERIES

  EXPLAIN ANALYZE → sempre usar para queries lentas
  N+1 → detectar com logging de queries; resolver com JOIN ou batch loading
  Batch operations → INSERT ... VALUES (multi-row) em vez de loop
  Paginacao → cursor-based para volume alto (WHERE id > $cursor LIMIT $n)

---

MIGRATIONS SEGURAS

Principio: toda migration reversivel, segura para zero-downtime.

Padrao para renomear/remover coluna:
  1. ADD nova coluna (nullable ou com default)
  2. Deploy: codigo escreve em ambas as colunas
  3. Migrate: copiar dados da antiga para a nova
  4. Deploy: codigo le da nova coluna
  5. DROP: remover coluna antiga (migration separada)

Operacoes perigosas:
  DROP COLUMN em tabela grande → lock. Horario de baixo trafego.
  ALTER TYPE → reescreve tabela. Preferir add+migrate+drop.
  ADD NOT NULL sem DEFAULT → falha se existirem NULLs.
  RENAME → quebra codigo que referencia o nome antigo.

Checklist:
  - [ ] Toda migration tem UP e DOWN
  - [ ] Testada em staging com volume de dados similar a producao
  - [ ] Backup antes de executar em producao
  - [ ] Estimativa de lock time para tabelas grandes

---

SKILLS A CONSULTAR

  skills/database/query-compliance.md      Queries seguras, transacoes
  skills/backend/financial-operations.md   Atomicidade em operacoes financeiras
  agents/validators/migration-validator.md Validacao de migrations
