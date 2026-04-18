Caching Strategies

Objetivo: Reduzir latencia e carga em banco de dados com estrategias de cache adequadas ao tipo de dado e padrao de acesso.

---

CAMADAS DE CACHE

  L1 — In-process (mais rapido, sem rede):
  Armazena em memoria do processo. Perdido ao reiniciar. Sem compartilhamento entre instancias.
  Usar para: resultados de computacao cara que nao mudam entre requests (configs, feature flags).
  Ferramentas: node-cache, lru-cache, Python functools.lru_cache

  L2 — Cache distribuido (compartilhado entre instancias):
  Servidor externo acessado via rede. Compartilhado entre todas as instancias da aplicacao.
  Usar para: dados de sessao, resultados de queries frequentes, filas de rate limit.
  Ferramentas: Redis, Memcached, Upstash Redis (serverless)

  L3 — CDN / Edge (mais proximo do usuario):
  Cache na borda da rede, geograficamente distribuido.
  Usar para: assets estaticos, respostas de API publica sem personalizacao.
  Ferramentas: Cloudflare, Fastly, Vercel Edge Cache

---

PADRAO CACHE-ASIDE (Lazy Loading)

O padrao mais comum e seguro. A aplicacao gerencia o cache manualmente.

  async function getUser(userId) {
    const cacheKey = `user:${userId}`

    // 1. Tentar cache primeiro
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // 2. Cache miss: buscar no banco
    const user = await db.User.findById(userId)
    if (!user) return null

    // 3. Popular cache com TTL
    await redis.setex(cacheKey, 3600, JSON.stringify(user)) // TTL: 1 hora

    return user
  }

  // Invalidar ao atualizar
  async function updateUser(userId, data) {
    await db.User.update(userId, data)
    await redis.del(`user:${userId}`) // invalida o cache
  }

Vantagens: simples, resiliente (app funciona sem cache), dado fresco apos invalidacao.
Desvantagem: primeiro acesso sempre vai ao banco (cold start).

---

TTL — TIME TO LIVE

Definir TTL adequado por tipo de dado:

  Dados altamente volateis (TTL: 30s - 5min):
  - Posicao em ranking, contadores em tempo real, status de pedido

  Dados moderadamente volateis (TTL: 5min - 1h):
  - Perfil de usuario, configuracoes de conta, resultados de busca

  Dados pouco volateis (TTL: 1h - 24h):
  - Catalogo de produtos, lista de categorias, configuracoes globais

  Dados quase estaticos (TTL: 24h - 7d):
  - Tabelas de referencia, dados de geolocation, precos base

Regras de TTL:
- [ ] Nunca usar TTL infinito para dados que podem mudar
- [ ] TTL deve ser menor que o tempo maximo aceitavel de dado desatualizado
- [ ] Adicionar jitter (variacao aleatoria de +-10%) para evitar thundering herd

  // TTL com jitter
  const ttl = 3600 + Math.floor(Math.random() * 360) // 1h +- 6min

---

NOMENCLATURA DE CHAVES REDIS

Padrao: `namespace:entidade:identificador:campo_opcional`

  user:42                    → dados completos do usuario 42
  user:42:permissions        → permissoes do usuario 42
  session:abc123             → dados de sessao
  rate:login:192.168.1.1     → contador de rate limit por IP
  cache:search:eletronicos:p1 → resultado de busca paginado

Regras:
- [ ] Prefixo consistente por dominio (nao misturar)
- [ ] Separador `:` (nao `.` ou `-`)
- [ ] IDs no padrao do sistema (nunca montar chave com input do usuario sem sanitizacao)
- [ ] Documentar schema de chaves no README do servico

---

INVALIDACAO DE CACHE

Estrategia 1 — Invalidacao imediata (TTL + delete explicito):
  Ao atualizar dado: `redis.del(cacheKey)`
  Mais consistente, mais codigo para manter.

Estrategia 2 — TTL apenas (eventual consistency):
  Cache expira naturalmente. Dado pode estar desatualizado ate expirar.
  Adequado para dados onde atraso e aceitavel (catalogo, precos).

Estrategia 3 — Cache com versao (cache busting):
  Incluir versao/hash na chave. Ao atualizar, nova chave, cache antigo expira por TTL.
  `user:42:v2` — ao mudar schema, incrementar versao globalmente.

Armadilhas:
- [ ] Nao invalidar por pattern amplo (redis.keys('user:*')) — bloqueia o servidor
- [ ] Usar SCAN com cursor para invalidacao em lote quando necessario
- [ ] Invalidacao deve acontecer APOS commit no banco, nao antes

---

CACHE DE RESPOSTAS HTTP

Cache-Control headers:
  // Dado publico, cacheavel por CDN por 1 hora, revalidar apos 30min
  res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=1800')

  // Dado privado (por usuario), nao cacheavel por CDN
  res.set('Cache-Control', 'private, max-age=300')

  // Sem cache (dados sensiveis ou altamente volateis)
  res.set('Cache-Control', 'no-store')

ETag para revalidacao:
  const etag = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
  res.set('ETag', `"${etag}"`)
  if (req.headers['if-none-match'] === `"${etag}"`) return res.sendStatus(304)

---

CHECKLIST

- [ ] TTL definido para cada chave (sem TTL infinito em dados mutableis)
- [ ] Jitter aplicado em TTLs para evitar thundering herd
- [ ] Invalidacao explicita ao atualizar dado no banco
- [ ] Cache funciona como otimizacao — app funciona sem ele (degraded mode)
- [ ] Chaves seguem nomenclatura padrao documentada
- [ ] Metricas de hit rate monitoradas (hit rate abaixo de 70% indica problema)
- [ ] Redis com persistencia configurada (AOF) se dados de sessao forem criticos
