# Vercel Patterns

Guia de padrões, limites e boas práticas específicos para projetos deployados na Vercel.
Complementa as skills agnósticas do agnostic-core com conhecimento pontual da plataforma.

Fontes: documentação oficial da Vercel, vercel-labs/agent-skills (MIT).

---

## Quando usar

- Projeto vai ser deployado na Vercel (ou já está)
- Decidindo entre Edge Runtime vs Node.js Runtime
- Configurando caching, ISR, middleware
- Otimizando custos de Serverless Execution
- Configurando environment variables por ambiente

---

## 1. Runtimes — Edge vs Node.js

| | Edge Runtime | Node.js Runtime |
|---|---|---|
| Cold start | ~1-5ms (V8 isolates) | ~250ms+ |
| Distribuição | Global (todas as regiões) | Região específica |
| Tamanho máximo | 4 MB (compressed) | 250 MB (unzipped) |
| APIs disponíveis | Web Standard APIs apenas | Node.js completo |
| Duração máxima | 30s (Hobby) / 5min (Pro) | 60s (Hobby) / 800s (Pro) |
| Ideal para | Auth checks, redirects, A/B testing, geolocation | DB queries, file processing, APIs complexas |

### Quando usar Edge

```typescript
// middleware.ts — roda antes de QUALQUER request (incluindo cached)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Geolocation (disponível no edge)
  const country = request.geo?.country || 'US'

  // A/B testing via cookie
  const bucket = request.cookies.get('ab-bucket')?.value
    || (Math.random() > 0.5 ? 'a' : 'b')

  const response = NextResponse.next()
  if (!request.cookies.get('ab-bucket')) {
    response.cookies.set('ab-bucket', bucket, { maxAge: 86400 })
  }

  // Rewrite baseado em geolocation
  if (country === 'BR') {
    return NextResponse.rewrite(new URL('/pt-br' + request.nextUrl.pathname, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
```

### Quando usar Node.js

```typescript
// app/api/process/route.ts — operações pesadas
export const runtime = 'nodejs' // default
export const maxDuration = 60   // Hobby: 60s, Pro: até 800s

export async function POST(request: Request) {
  const data = await request.json()
  // DB queries, file I/O, heavy computation
  const result = await heavyProcessing(data)
  return Response.json(result)
}
```

### Regra prática

- **Middleware** → sempre Edge (é o default, roda antes do cache)
- **API Routes simples** (auth, redirects, feature flags) → Edge
- **API Routes com DB/filesystem** → Node.js
- **Server Components** → Node.js (default)

---

## 2. Caching e ISR

### Hierarquia de cache na Vercel

```
Request → Edge Network (CDN) → ISR Cache → Serverless Function → Origin (DB/API)
```

### ISR — Incremental Static Regeneration

```tsx
// app/products/page.tsx
export const revalidate = 60 // revalida a cada 60 segundos

export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products')
  return <ProductList products={await products.json()} />
}
```

- Página servida do CDN instantaneamente
- Após `revalidate` segundos, próximo request dispara regeneração em background
- Usuário sempre vê conteúdo (stale-while-revalidate)

### On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  const { secret, path, tag } = await request.json()

  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (tag) revalidateTag(tag)
  if (path) revalidatePath(path)

  return Response.json({ revalidated: true })
}
```

### Cache headers para API Routes

```typescript
export async function GET() {
  const data = await fetchData()

  return Response.json(data, {
    headers: {
      // CDN cache por 60s, stale-while-revalidate por 600s
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
    },
  })
}
```

### Cache com tags (fetch)

```typescript
// Fetch com tag para invalidação granular
const products = await fetch('https://api.example.com/products', {
  next: { tags: ['products'], revalidate: 3600 }
})

// Invalidar quando produto muda
revalidateTag('products')
```

---

## 3. Limites e Como Evitá-los

### Limites críticos

| Recurso | Hobby | Pro | Enterprise |
|---|---|---|---|
| Serverless Function Size | 250 MB (unzipped) | 250 MB | 250 MB |
| Request Body | 4.5 MB | 4.5 MB | 4.5 MB |
| Response Body (buffered) | 4.5 MB | 4.5 MB | 4.5 MB |
| Execution Duration | 60s | 800s | 900s |
| Edge Function Size | 4 MB | 4 MB | 4 MB |
| Deployments/dia | 100 | 6000 | Ilimitado |
| Env Variables | 64 KB total | 64 KB total | 64 KB total |

### Evitar erro 413 (payload too large)

```typescript
// ERRADO: retornar dataset inteiro
export async function GET() {
  const allProducts = await db.product.findMany() // 10MB+
  return Response.json(allProducts)
}

// CORRETO: paginar + filtrar
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page') || '1')
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 100)

  const products = await db.product.findMany({
    skip: (page - 1) * limit,
    take: limit,
    select: { id: true, name: true, price: true } // só campos necessários
  })

  return Response.json({ data: products, page, limit })
}
```

### Evitar erro 250MB (function too large)

```typescript
// ERRADO: import pesado no serverless function
import sharp from 'sharp'        // ~50MB
import puppeteer from 'puppeteer' // ~200MB+

// CORRETO: separar em microserviço ou usar alternativas leves
// Opção 1: usar @vercel/og (built-in, leve)
import { ImageResponse } from 'next/og'

// Opção 2: chamar serviço externo
const result = await fetch(process.env.IMAGE_SERVICE_URL, {
  method: 'POST',
  body: imageData
})
```

### Streaming para responses grandes

```typescript
// Streaming — sem limite de body size
export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of fetchLargeDataset()) {
        controller.enqueue(encoder.encode(JSON.stringify(chunk) + '\n'))
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' }
  })
}
```

---

## 4. Environment Variables

### Ambientes na Vercel

| Ambiente | Quando usado | Branch |
|---|---|---|
| Production | Deploy do branch principal | `main` / `master` |
| Preview | Deploy de qualquer outro branch | feature branches, PRs |
| Development | `vercel dev` local | local |

### Boas práticas

```bash
# Definir via CLI (recomendado para secrets)
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env add DATABASE_URL development

# Pull para .env.local (desenvolvimento)
vercel env pull .env.local
```

**Nunca fazer:**
- Commitar `.env` com secrets no repositório
- Usar mesma DB de produção em preview
- Prefixar secrets com `NEXT_PUBLIC_` (expõe no client)

**Padrão recomendado:**
```
# .env.example (commitado, sem valores reais)
DATABASE_URL=postgresql://user:password@host:5432/dbname
REVALIDATION_SECRET=your-secret-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# .env.local (NÃO commitado, valores reais)
DATABASE_URL=postgresql://real-user:real-pass@real-host:5432/prod
```

### Variáveis por branch (Preview)

```bash
# DB diferente para preview deploys
vercel env add DATABASE_URL preview --git-branch feature-x
```

---

## 5. Fluid Compute

Fluid Compute combina flexibilidade serverless com capacidades de servidor persistente.

### Benefícios chave

- Múltiplos requests compartilham mesma instância (como container)
- LRU cache em memória funciona entre requests
- Cold starts reduzidos significativamente
- Cobrança por CPU ativo, não por duração de invocação

### Padrão: LRU Cache em memória

```typescript
import { LRUCache } from 'lru-cache'

// Cache persiste entre requests na mesma instância
const cache = new LRUCache<string, any>({ max: 1000, ttl: 5 * 60 * 1000 })

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')!

  const cached = cache.get(userId)
  if (cached) return Response.json(cached)

  const user = await db.user.findUnique({ where: { id: userId } })
  cache.set(userId, user)
  return Response.json(user)
}
```

### Padrão: Module-level initialization

```typescript
// Executa uma vez por instância, reutilizado entre requests
const dbPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 })

export async function GET() {
  const client = await dbPool.connect()
  try {
    const result = await client.query('SELECT * FROM users LIMIT 10')
    return Response.json(result.rows)
  } finally {
    client.release()
  }
}
```

**Nota:** Em serverless tradicional (sem Fluid Compute), cada invocação é isolada — LRU em memória não persiste.

---

## 6. Deploy — Checklist Rápido

### Pré-deploy

- [ ] `vercel env pull` atualizado
- [ ] Environment variables configuradas para production E preview
- [ ] `NEXT_PUBLIC_*` contém apenas dados públicos (nunca secrets)
- [ ] `vercel build` local passa sem erros
- [ ] Bundle size das functions < 250 MB
- [ ] Nenhum import pesado desnecessário em API Routes

### vercel.json — Configurações comuns

```json
{
  "framework": "nextjs",
  "regions": ["gru1"],
  "crons": [{
    "path": "/api/cron/daily-cleanup",
    "schedule": "0 3 * * *"
  }],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/api/v1/:path*", "destination": "/api/:path*" }
  ]
}
```

### Regiões recomendadas

| Região | Código | Uso |
|---|---|---|
| São Paulo | `gru1` | América Latina |
| Washington DC | `iad1` | América do Norte (default) |
| London | `lhr1` | Europa |
| Tokyo | `hnd1` | Ásia |
| Sydney | `syd1` | Oceania |

Escolher região mais próxima do banco de dados para minimizar latência.

---

## 7. Monitoramento e Debugging

### Logs

```bash
# Ver logs em tempo real
vercel logs --follow

# Logs de um deploy específico
vercel logs https://my-app-abc123.vercel.app
```

### Vercel Speed Insights

```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Vercel Analytics

```tsx
import dynamic from 'next/dynamic'

// Carregar após hydration (ver skills/frontend/react-performance.md)
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)
```

---

## Skills Relacionadas

- `skills/frontend/react-performance.md` — 58 regras de performance React
- `skills/performance/caching-strategies.md` — Estratégias de cache L1-L3
- `skills/devops/deploy-procedures.md` — Procedimentos de deploy agnósticos
- `skills/devops/pre-deploy-checklist.md` — Checklist pré-deploy
- `skills/security/api-hardening.md` — Hardening de endpoints
- `skills/backend/rest-api-design.md` — Design de API REST
