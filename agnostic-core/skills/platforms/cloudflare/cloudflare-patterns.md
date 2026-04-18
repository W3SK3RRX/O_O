# Cloudflare Patterns

Guia de padrões, limites e boas práticas para projetos na Cloudflare (Workers, Pages, D1, KV, R2, Durable Objects).
Complementa as skills agnósticas do agnostic-core com conhecimento pontual da plataforma.

Fontes: documentação oficial da Cloudflare, blog.cloudflare.com.

---

## Quando usar

- Projeto vai ser deployado na Cloudflare Workers ou Pages
- Escolhendo entre Workers vs Pages
- Decidindo storage: D1 vs KV vs R2 vs Durable Objects
- Configurando `wrangler.toml` e bindings
- Otimizando para limites de CPU, memória e script size

---

## 1. Workers vs Pages — O Que Usar

**Workers é o caminho recomendado para novos projetos.** Cloudflare investiu em fazer Workers suportar static assets + SSR + APIs + Durable Objects em um único deploy.

| Use Case | Recomendação |
|---|---|
| Sites estáticos, blogs, docs | Workers com static assets (ou Pages para CI/CD Git simples) |
| SPAs (React + Vite) | Workers com `not_found_handling = "single-page-application"` |
| Full-stack SSR (Astro, SvelteKit, Remix, Next.js) | Workers (GA para maioria dos frameworks) |
| APIs, auth, background jobs, Durable Objects | Workers |
| JAMstack simples com deploy via Git | Pages funciona, mas Workers é o futuro |

### Frameworks com suporte GA no Workers

- React Router v7 (Remix)
- Astro
- Hono
- Vue.js / Nuxt
- Svelte / SvelteKit
- Next.js (via OpenNext adapter)

### Acessando bindings por framework

```typescript
// Remix / React Router
export async function loader({ context }) {
  const db = context.cloudflare.env.DB
}

// Astro
const db = Astro.locals.runtime.env.DB

// SvelteKit
export async function load({ platform }) {
  const db = platform.env.DB
}

// Hono
app.get('/api/users', async (c) => {
  const db = c.env.DB
})

// Worker puro
export default {
  async fetch(request, env) {
    const db = env.DB
  }
}
```

---

## 2. Limites — Tabela Rápida

| Recurso | Free | Paid ($5/mês) |
|---|---|---|
| **Requests** | 100K/dia (conta inteira) | 10M/mês (+$0.30/M) |
| **CPU time/invocação** | 10 ms | 30s default, até 5 min |
| **CPU time/mês** | — | 30M CPU-ms (+$0.02/M) |
| **Memória** | 128 MB/isolate | 128 MB/isolate |
| **Script size (compressed)** | 1 MB | 10 MB |
| **Wall-clock duration** | Sem limite hard | Sem limite hard |
| **KV read** | 100K/dia | 10M/mês (+$0.50/M) |
| **KV write** | 1K/dia | 1M/mês (+$5/M) |
| **D1 rows read** | 5M/dia | 25B/mês |
| **D1 storage** | 5 GB | 5 GB (+$0.75/GB) |
| **R2 storage** | 10 GB | 10 GB (+$0.015/GB) |
| **R2 Class A ops** | 1M/mês | 10M/mês (+$4.50/M) |
| **R2 Class B ops** | 10M/mês | 10M/mês (+$0.36/M) |
| **R2 egress** | Grátis | Grátis |

**Destaque:** Cloudflare não cobra egress em nenhum serviço (R2, D1, KV, Workers).

### CPU time — o que conta e o que não conta

```typescript
// NÃO conta como CPU time (I/O wait)
const data = await fetch('https://api.example.com/users') // ← espera rede
const rows = await env.DB.prepare('SELECT * FROM users').all() // ← espera D1
const file = await env.BUCKET.get('image.png') // ← espera R2

// CONTA como CPU time (computação)
const hash = await crypto.subtle.digest('SHA-256', data) // ← CPU
const parsed = JSON.parse(largeJsonString) // ← CPU
const sorted = items.toSorted((a, b) => a.name.localeCompare(b.name)) // ← CPU
```

Worker médio usa ~2.2ms de CPU por request.

### Quando o limite de 10ms (free) é um problema

```typescript
// PROBLEMA: parsing pesado no free tier
export default {
  async fetch(request, env) {
    const body = await request.json() // ← I/O, ok
    const result = heavyComputation(body) // ← Se >10ms de CPU, falha
    return Response.json(result)
  }
}

// SOLUÇÃO: mover computação pesada para paid, ou simplificar
```

---

## 3. Configuração — `wrangler.toml`

### Estrutura básica

```toml
name = "my-app"
main = "src/index.ts"
compatibility_date = "2025-01-01"

# Static assets (SPAs, sites estáticos)
[assets]
directory = "./dist"
not_found_handling = "single-page-application"  # ou "404-page"

# Variáveis de ambiente (não-sensíveis)
[vars]
API_HOST = "https://api.example.com"
NODE_ENV = "production"

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "my-db"
database_id = "xxxx-xxxx-xxxx"

# KV Namespace
[[kv_namespaces]]
binding = "CACHE"
id = "xxxx"

# R2 Bucket
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "my-bucket"

# Durable Objects
[[durable_objects.bindings]]
name = "COUNTER"
class_name = "Counter"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["Counter"]

# CPU time customizado (paid only)
[limits]
cpu_ms = 60000  # até 300000 (5 min)
```

### Environments (staging/production)

```toml
name = "my-app"
main = "src/index.ts"

# Configuração default (production)
[vars]
API_URL = "https://api.prod.example.com"

[[d1_databases]]
binding = "DB"
database_name = "my-db-prod"
database_id = "prod-xxxx"

# Staging environment
[env.staging]
[env.staging.vars]
API_URL = "https://api.staging.example.com"

[[env.staging.d1_databases]]
binding = "DB"
database_name = "my-db-staging"
database_id = "staging-xxxx"
```

```bash
# Deploy production
wrangler deploy

# Deploy staging
wrangler deploy --env staging
# ou
CLOUDFLARE_ENV=staging wrangler deploy
```

**Importante:** Bindings (`vars`, `kv_namespaces`, `d1_databases`, etc.) **não são herdados** — precisam ser definidos explicitamente em cada environment.

### Secrets (dados sensíveis)

```bash
# Definir secrets via CLI (nunca no wrangler.toml)
wrangler secret put API_KEY
wrangler secret put JWT_SECRET
wrangler secret put DATABASE_URL

# Listar secrets
wrangler secret list

# Para desenvolvimento local
# Criar .dev.vars (NÃO commitar)
echo "API_KEY=sk-dev-xxx" > .dev.vars
```

Secrets são acessados via `env` igual a variáveis normais:

```typescript
export default {
  async fetch(request, env) {
    const apiKey = env.API_KEY // secret
    const host = env.API_HOST  // var
  }
}
```

**Atenção:** Se mudar variáveis no Dashboard, `wrangler deploy` sobrescreve. Usar `keep_vars = true` para evitar.

---

## 4. Storage — Qual Usar

| Storage | Tipo | Ideal para | Limite (free) |
|---|---|---|---|
| **KV** | Key-value global, eventually consistent | Cache, configs, feature flags | 100K reads/dia |
| **D1** | SQLite gerenciado | Dados relacionais, queries SQL | 5M reads/dia, 5GB |
| **R2** | Object storage (S3 compatible) | Arquivos, imagens, backups | 10 GB, sem egress |
| **Durable Objects** | Stateful compute, SQLite co-located | Real-time, coordenação, rate limiting | Paid only (SQLite free) |

### KV — Cache e configurações globais

```typescript
// Escrita
await env.CACHE.put('user:123', JSON.stringify(user), { expirationTtl: 3600 })

// Leitura (eventually consistent, ~60s propagação global)
const cached = await env.CACHE.get('user:123', 'json')

// Com metadata
await env.CACHE.put('key', value, {
  metadata: { version: 2, createdAt: Date.now() }
})
const { value, metadata } = await env.CACHE.getWithMetadata('key', 'json')
```

**Quando usar:** dados que mudam raramente, cache de API responses, feature flags.
**Quando NÃO usar:** dados que precisam de consistência forte, counters, operações transacionais.

### D1 — Banco relacional

```typescript
// Query preparada (previne SQL injection)
const user = await env.DB
  .prepare('SELECT * FROM users WHERE id = ?')
  .bind(userId)
  .first()

// Insert
await env.DB
  .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
  .bind(name, email)
  .run()

// Batch (transação implícita)
await env.DB.batch([
  env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').bind(100, fromId),
  env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').bind(100, toId),
])

// Migrations — usar wrangler
// wrangler d1 migrations create my-db add-users-table
// wrangler d1 migrations apply my-db
```

**Boas práticas D1:**
- Sempre usar prepared statements (`.prepare().bind()`)
- Índices em colunas usadas em WHERE/JOIN
- Migrations grandes em batches (não UPDATE milhões de rows de uma vez)
- `env.DB.batch()` para operações transacionais

### R2 — Object Storage

```typescript
// Upload
await env.STORAGE.put('images/avatar.png', imageBuffer, {
  httpMetadata: { contentType: 'image/png' }
})

// Download
const object = await env.STORAGE.get('images/avatar.png')
if (object) {
  return new Response(object.body, {
    headers: { 'Content-Type': object.httpMetadata?.contentType || '' }
  })
}

// List
const listed = await env.STORAGE.list({ prefix: 'images/', limit: 100 })

// Delete
await env.STORAGE.delete('images/old-avatar.png')

// Presigned URLs (via S3 API)
// R2 é S3-compatible — use @aws-sdk/client-s3 para presigned URLs
```

**Destaque:** R2 não cobra egress — diferencial vs S3.

### Durable Objects — Estado coordenado

```typescript
// Worker que usa o Durable Object
export default {
  async fetch(request, env) {
    const id = env.COUNTER.idFromName('global')
    const stub = env.COUNTER.get(id)
    return stub.increment(1) // RPC method
  }
}

// Durable Object class
export class Counter extends DurableObject {
  async increment(amount: number): Promise<Response> {
    const current = (await this.ctx.storage.get<number>('count')) || 0
    const newVal = current + amount
    await this.ctx.storage.put('count', newVal)
    return Response.json({ count: newVal })
  }
}
```

**Com SQLite (recomendado para novos DOs):**

```typescript
export class ChatRoom extends DurableObject {
  sql = this.ctx.storage.sql

  async addMessage(user: string, text: string) {
    this.sql.exec(
      'INSERT INTO messages (user, text, ts) VALUES (?, ?, ?)',
      user, text, Date.now()
    )
  }

  async getMessages(limit = 50) {
    return this.sql.exec(
      'SELECT * FROM messages ORDER BY ts DESC LIMIT ?', limit
    ).toArray()
  }
}
```

**Quando usar DOs:** rate limiting, chat rooms, collaborative editing, game state, counters, distributed locks.
**Limite:** ~500-1000 req/s por DO. Se precisar mais, shardear entre múltiplos DOs.

---

## 5. Padrões Comuns

### API com Hono (recomendado)

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
  CACHE: KVNamespace
  API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

app.get('/api/users', async (c) => {
  // Check cache first
  const cached = await c.env.CACHE.get('users', 'json')
  if (cached) return c.json(cached)

  // Query D1
  const { results } = await c.env.DB
    .prepare('SELECT id, name, email FROM users')
    .all()

  // Cache for 5 min
  await c.env.CACHE.put('users', JSON.stringify(results), { expirationTtl: 300 })

  return c.json(results)
})

app.post('/api/users', async (c) => {
  const { name, email } = await c.req.json()

  await c.env.DB
    .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
    .bind(name, email)
    .run()

  // Invalidate cache
  await c.env.CACHE.delete('users')

  return c.json({ success: true }, 201)
})

export default app
```

### Cron Triggers (scheduled)

```toml
# wrangler.toml
[triggers]
crons = ["0 */6 * * *"]  # a cada 6 horas
```

```typescript
export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(cleanupOldRecords(env))
  },

  async fetch(request, env) {
    // requests HTTP normais
  }
}

async function cleanupOldRecords(env) {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  await env.DB
    .prepare('DELETE FROM logs WHERE created_at < ?')
    .bind(cutoff)
    .run()
}
```

### Middleware pattern

```typescript
// Auth middleware para Workers puro
async function authenticate(request: Request, env: Env): Promise<User | null> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null

  const user = await env.DB
    .prepare('SELECT * FROM users WHERE token = ?')
    .bind(token)
    .first()

  return user
}

export default {
  async fetch(request, env) {
    // Rotas públicas
    if (new URL(request.url).pathname === '/health') {
      return Response.json({ status: 'ok' })
    }

    // Auth para rotas protegidas
    const user = await authenticate(request, env)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ... lógica protegida
  }
}
```

---

## 6. Deploy — Checklist Rápido

### Pré-deploy

- [ ] `wrangler.toml` configurado com bindings corretos
- [ ] Secrets definidos via `wrangler secret put` (nunca no toml)
- [ ] `.dev.vars` no `.gitignore`
- [ ] `compatibility_date` atualizado
- [ ] D1 migrations aplicadas (`wrangler d1 migrations apply`)
- [ ] Script size < 1MB (free) ou < 10MB (paid)
- [ ] CPU time estimado por request < limite do plano

### Comandos essenciais

```bash
# Dev local
wrangler dev

# Deploy production
wrangler deploy

# Deploy staging
wrangler deploy --env staging

# Tail logs (tempo real)
wrangler tail

# D1 — criar e migrar
wrangler d1 create my-db
wrangler d1 migrations create my-db init
wrangler d1 migrations apply my-db

# KV — criar namespace
wrangler kv namespace create CACHE

# R2 — criar bucket
wrangler r2 bucket create my-bucket

# Secrets
wrangler secret put API_KEY
wrangler secret list
```

### Provisão automática (novo)

Wrangler pode criar recursos automaticamente no deploy:

```toml
# Sem database_id — Wrangler cria automaticamente
[[d1_databases]]
binding = "DB"
database_name = "my-app-db"

[[kv_namespaces]]
binding = "CACHE"

[[r2_buckets]]
binding = "STORAGE"
```

---

## 7. Armadilhas Comuns

### Memory limit (128 MB)

```typescript
// ERRADO: carregar dataset grande em memória
const allData = await env.DB.prepare('SELECT * FROM logs').all() // milhões de rows
const processed = allData.results.map(transform) // 128MB boom

// CORRETO: paginar e processar em chunks
let cursor = 0
while (true) {
  const { results } = await env.DB
    .prepare('SELECT * FROM logs LIMIT 1000 OFFSET ?')
    .bind(cursor)
    .all()
  if (results.length === 0) break
  await processChunk(results)
  cursor += 1000
}
```

### KV eventual consistency

```typescript
// ERRADO: ler logo após escrever (pode não ter propagado)
await env.CACHE.put('key', 'new-value')
const value = await env.CACHE.get('key') // pode retornar valor antigo!

// CORRETO: usar D1 ou Durable Objects para consistência forte
// KV é eventually consistent (~60s para propagação global)
```

### Script size no free tier

```typescript
// ERRADO: importar biblioteca grande
import lodash from 'lodash' // ~70KB compressed
import moment from 'moment' // ~70KB compressed

// CORRETO: imports específicos ou alternativas leves
import groupBy from 'lodash/groupBy' // ~2KB
// Ou usar date-fns, dayjs, ou APIs nativas
```

### blockConcurrencyWhile em Durable Objects

```typescript
// ERRADO: bloqueia todas as requests durante I/O externo
async fetch(request) {
  await this.ctx.blockConcurrencyWhile(async () => {
    await fetch('https://slow-api.com/data') // ← bloqueia TUDO
    await this.ctx.storage.put('key', 'value')
  })
}

// CORRETO: blockConcurrencyWhile só para storage local
async fetch(request) {
  const externalData = await fetch('https://slow-api.com/data')
  await this.ctx.blockConcurrencyWhile(async () => {
    await this.ctx.storage.put('key', await externalData.json())
  })
}
```

---

## Skills Relacionadas

- `skills/backend/rest-api-design.md` — Design de API REST
- `skills/backend/error-handling.md` — Tratamento de erros
- `skills/performance/caching-strategies.md` — Estratégias de cache L1-L3
- `skills/database/query-compliance.md` — Queries seguras, índices
- `skills/security/api-hardening.md` — Hardening de endpoints
- `skills/devops/deploy-procedures.md` — Procedimentos de deploy agnósticos
- `skills/platforms/vercel/vercel-patterns.md` — Comparação com Vercel
- `skills/platforms/replit/replit-patterns.md` — Comparação com Replit
