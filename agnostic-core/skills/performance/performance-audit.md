# Auditoria de Performance

Referência para identificar gargalos em backend, banco de dados e frontend.
Útil em code review de endpoints lentos, auditoria de projeto existente ou ao investigar
queries sem índice e N+1 em logs.

---

Queries de Banco de Dados
- [ ] Campos usados em WHERE, JOIN ou ORDER BY possuem indice
- [ ] Indices compostos criados para queries com multiplos filtros
- [ ] explain() ou EXPLAIN ANALYZE executado para validar uso de indice
- [ ] Projecao usada: busca apenas campos necessarios (SELECT col1, col2 ou .select())
- [ ] .lean() ou equivalente em ORMs para retornar POJO em leituras
- [ ] Queries com paginacao (limit + offset ou cursor-based)

Problema N+1
- [ ] Sem queries dentro de loops
- [ ] Dados relacionados buscados em lote ($in, JOIN, include)
- [ ] Map criado em memoria para join de listas (evitar busca por item)

Cache
- [ ] Dados que mudam raramente e sao lidos com frequencia estao em cache
- [ ] TTL (Time To Live) configurado explicitamente em todo cache
- [ ] Cache invalidado apos atualizacoes do dado fonte
- [ ] Hit rate monitorado (meta: >80%)
- [ ] Namespace de chaves de cache evita colisoes (prefixo por dominio)

Paralelismo Async
- [ ] Requests independentes executados em paralelo (Promise.all)
- [ ] Sem await sequencial desnecessario em operacoes independentes

Frontend
- [ ] Imagens com loading="lazy" (lazy loading nativo)
- [ ] Listas longas com virtualizacao (renderizar apenas itens visiveis)
- [ ] Busca em tempo real com debounce (espera 300ms apos ultima tecla)
- [ ] Scroll infinito com throttle (limita chamadas por scroll)
- [ ] Assets estaticos servidos com headers Cache-Control adequados

Tamanho do Payload
- [ ] API retorna apenas campos usados pelo cliente
- [ ] Compressao gzip/brotli ativada no servidor
- [ ] Paginacao: retorna no maximo 50-100 itens por pagina

Timeout e Limites
- [ ] Queries com timeout configurado (ex: 10s maximo)
- [ ] Arrays retornados com limite maximo (nao retornar 10k+ docs)
- [ ] APIs externas com retry + backoff exponencial

Monitoramento
- [ ] Tempo de resposta dos endpoints logado
- [ ] Endpoints que demoram mais de 1s emitem warning no log
- [ ] Queries lentas identificadas (slow query log habilitado)

Benchmarks de Referencia (95th percentile)
- Query simples com indice: meta < 50ms, limite 200ms
- Calculo com cache: meta < 100ms, limite 500ms
- Endpoint de API: meta < 500ms, limite 2s
- Renderizacao de pagina: meta < 1s, limite 3s

## Sinais de degradação de performance

- Query sem índice em coleção grande → risco crítico (full scan)
- N+1 queries em loop → risco crítico (timeout em produção)
- Sem paginação retornando 10k+ documentos → risco crítico
- Await sequencial de requests independentes → risco alto
- Cache sem TTL (nunca expira) → risco alto
- Response sem compressão em payload > 100KB → risco médio

Ferramentas
- MongoDB: db.collection.find(query).explain('executionStats')
- MongoDB profiling: db.setProfilingLevel(1, { slowms: 100 })
- PostgreSQL: EXPLAIN ANALYZE SELECT ...
- Node.js CPU: node --prof server.js && node --prof-process isolate-*.log
- k6 (load test): k6 run script.js --vus 100 --duration 30s
- Lighthouse (frontend): npx lighthouse https://url --output=json

Referencias
- https://use-the-index-luke.com/ (SQL indexing)
- https://www.mongodb.com/docs/manual/core/query-optimization/
- https://web.dev/performance/ (Core Web Vitals)
