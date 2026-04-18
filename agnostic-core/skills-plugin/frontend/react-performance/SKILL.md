---
name: react-performance
description: '58 regras de performance React: waterfalls, bundle, SSR, re-renders'
---

## Categorias por prioridade

| # | Categoria | Impacto | Prefixo |
|---|---|---|---|
| 1 | Eliminação de Waterfalls | CRITICAL | `async-` |
| 2 | Otimização de Bundle Size | CRITICAL | `bundle-` |
| 3 | Performance Server-Side | HIGH | `server-` |
| 4 | Data Fetching Client-Side | MEDIUM-HIGH | `client-` |
| 5 | Otimização de Re-renders | MEDIUM | `rerender-` |
| 6 | Performance de Renderização | MEDIUM | `rendering-` |
| 7 | Performance JavaScript | LOW-MEDIUM | `js-` |
| 8 | Padrões Avançados | LOW | `advanced-` |

---

## 1. Eliminação de Waterfalls — CRITICAL

Waterfalls são o maior problema de performance. Cada `await` sequencial adiciona latência de rede completa.

### 1.1 Defer await até ser necessário

Mover `await` para dentro dos branches onde é realmente usado.

```typescript
// ERRADO: bloqueia ambos os branches
async function handleRequest(userId: string, skip: boolean) {
  const data = await fetchUserData(userId)
  if (skip) return { skipped: true }
  return processUserData(data)
}

// CORRETO: só bloqueia quando necessário
async function handleRequest(userId: string, skip: boolean) {
  if (skip) return { skipped: true }
  const data = await fetchUserData(userId)
  return processUserData(data)
}
```

### 1.2 Paralelização baseada em dependências

Para operações com dependências parciais, iniciar todas o mais cedo possível.

```typescript
// ERRADO: config espera auth, data espera ambos
const session = await auth()
const config = await fetchConfig()
const data = await fetchData(session.user.id)

// CORRETO: auth e config iniciam imediatamente
const sessionPromise = auth()
const configPromise = fetchConfig()
const session = await sessionPromise
const [config, data] = await Promise.all([
  configPromise,
  fetchData(session.user.id)
])
```

### 1.3 Promise.all() para operações independentes

```typescript
// ERRADO: 3 round trips sequenciais
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// CORRETO: 1 round trip paralelo
const [user, posts, comments] = await Promise.all([
  fetchUser(), fetchPosts(), fetchComments()
])
```

### 1.4 Suspense Boundaries estratégicos

Usar Suspense para mostrar o layout imediatamente enquanto dados carregam.

```tsx
// ERRADO: página inteira bloqueada por data fetching
async function Page() {
  const data = await fetchData()
  return (
    <div>
      <Sidebar /><Header />
      <DataDisplay data={data} />
      <Footer />
    </div>
  )
}

// CORRETO: layout renderiza imediatamente, dados carregam via streaming
function Page() {
  return (
    <div>
      <Sidebar /><Header />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
      <Footer />
    </div>
  )
}

async function DataDisplay() {
  const data = await fetchData()
  return <div>{data.content}</div>
}
```

Compartilhar promises entre componentes com `use()`:

```tsx
function Page() {
  const dataPromise = fetchData()
  return (
    <Suspense fallback={<Skeleton />}>
      <DataDisplay dataPromise={dataPromise} />
      <DataSummary dataPromise={dataPromise} />
    </Suspense>
  )
}

function DataDisplay({ dataPromise }) {
  const data = use(dataPromise) // Unwrap a promise
  return <div>{data.content}</div>
}
```

**Não usar quando:** dados críticos para layout, conteúdo SEO above the fold, queries rápidas.

---

## 2. Otimização de Bundle Size — CRITICAL

Reduzir bundle inicial melhora Time to Interactive e Largest Contentful Paint.

### 2.1 Evitar barrel file imports

Import direto do arquivo fonte, não de barrel files. Bibliotecas de ícones/componentes podem ter 10.000+ re-exports e custar 200-800ms só para importar.

```tsx
// ERRADO: carrega 1.583 módulos
import { Check, X, Menu } from 'lucide-react'

// CORRETO: carrega só 3 módulos (~2KB vs ~1MB)
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'
import Menu from 'lucide-react/dist/esm/icons/menu'
```

Bibliotecas comumente afetadas: `lucide-react`, `@mui/material`, `@mui/icons-material`, `@tabler/icons-react`, `react-icons`, `@headlessui/react`, `@radix-ui/react-*`, `lodash`, `ramda`, `date-fns`, `rxjs`, `react-use`.

**Next.js 13.5+:** Usar `optimizePackageImports` no config para transformar automaticamente.

### 2.2 Dynamic imports para componentes pesados

```tsx
// ERRADO: Monaco bundled com main chunk ~300KB
import { MonacoEditor } from './monaco-editor'

// CORRETO: Monaco carrega on demand
import dynamic from 'next/dynamic' // ou React.lazy()

const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)
```

Framework-agnostic com `React.lazy()`:

```tsx
const MonacoEditor = React.lazy(() => import('./monaco-editor'))
```

### 2.3 Defer bibliotecas não-críticas

Analytics, logging, error tracking — carregar após hydration.

```tsx
// ERRADO: bloqueia bundle inicial
import { Analytics } from '@vercel/analytics/react'

// CORRETO: carrega após hydration
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)
```

### 2.4 Preload baseado em intenção do usuário

```tsx
function EditorButton({ onClick }) {
  const preload = () => { void import('./monaco-editor') }

  return (
    <button onMouseEnter={preload} onFocus={preload} onClick={onClick}>
      Open Editor
    </button>
  )
}
```

---

## 3. Performance Server-Side — HIGH

### 3.1 Autenticar Server Actions como API Routes

Server Actions (`"use server"`) são endpoints públicos. Sempre verificar autenticação e autorização dentro de cada Server Action.

```typescript
'use server'

// ERRADO: sem verificação de auth
export async function deleteUser(userId: string) {
  await db.user.delete({ where: { id: userId } })
}

// CORRETO: auth + authz + validação de input
export async function deleteUser(userId: string) {
  const session = await verifySession()
  if (!session) throw unauthorized('Must be logged in')
  if (session.user.role !== 'admin' && session.user.id !== userId) {
    throw unauthorized('Cannot delete other users')
  }
  await db.user.delete({ where: { id: userId } })
}
```

### 3.2 Minimizar serialização na fronteira RSC/Client

Passar apenas os campos que o client realmente usa.

```tsx
// ERRADO: serializa 50 campos
async function Page() {
  const user = await fetchUser() // 50 campos
  return <Profile user={user} />
}

// CORRETO: serializa 1 campo
async function Page() {
  const user = await fetchUser()
  return <Profile name={user.name} />
}
```

Transformações (`.toSorted()`, `.filter()`, `.map()`) devem ser feitas no client, não no server — evitar duplicação de serialização.

### 3.3 Cache cross-request com LRU

`React.cache()` funciona dentro de um request. Para cache entre requests, usar LRU.

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({ max: 1000, ttl: 5 * 60 * 1000 })

export async function getUser(id: string) {
  const cached = cache.get(id)
  if (cached) return cached
  const user = await db.user.findUnique({ where: { id } })
  cache.set(id, user)
  return user
}
```

**Nota:** Em serverless tradicional cada invocação é isolada — considerar Redis. Em ambientes com instâncias persistentes (Fluid Compute, containers), LRU em memória funciona bem.

### 3.4 Hoist I/O estático para nível de módulo

Assets estáticos (fonts, logos, configs) devem ser carregados uma vez no nível de módulo, não por request.

### 3.5 Data fetching paralelo com composição de componentes

```tsx
// ERRADO: Sidebar espera Page terminar fetch
export default async function Page() {
  const header = await fetchHeader()
  return <div><div>{header}</div><Sidebar /></div>
}

// CORRETO: ambos fetcham simultaneamente
async function Header() {
  const data = await fetchHeader()
  return <div>{data}</div>
}

export default function Page() {
  return <div><Header /><Sidebar /></div>
}
```

### 3.6 Deduplicação per-request com React.cache()

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return await db.user.findUnique({ where: { id: session.user.id } })
})
```

**Atenção:** `React.cache()` usa shallow equality (`Object.is`). Objetos inline criam novas referências e nunca acertam cache.

### 3.7 after() para operações non-blocking

Agendar trabalho para após o response ser enviado (analytics, logging, cache invalidation).

```tsx
import { after } from 'next/server' // Next.js específico

export async function POST(request: Request) {
  await updateDatabase(request)
  after(async () => { logUserAction({ userAgent: '...' }) })
  return Response.json({ status: 'success' })
}
```

---

## 4. Data Fetching Client-Side — MEDIUM-HIGH

### 4.1 SWR para deduplicação automática

```tsx
// ERRADO: cada instância faz fetch separado
function UserList() {
  const [users, setUsers] = useState([])
  useEffect(() => { fetch('/api/users').then(r => r.json()).then(setUsers) }, [])
}

// CORRETO: múltiplas instâncias compartilham um request
import useSWR from 'swr'
function UserList() {
  const { data: users } = useSWR('/api/users', fetcher)
}
```

Alternativas agnósticas: `@tanstack/react-query`, `useSWR`, `Apollo Client`.

### 4.2 Passive event listeners para scroll

```typescript
// CORRETO: passive: true permite scroll imediato
document.addEventListener('touchstart', handler, { passive: true })
document.addEventListener('wheel', handler, { passive: true })
```

Usar quando: tracking, analytics. Não usar quando: precisa `preventDefault()`.

### 4.3 localStorage versionado e mínimo

```typescript
const VERSION = 'v2'

function saveConfig(config: { theme: string; language: string }) {
  try {
    localStorage.setItem(`userConfig:${VERSION}`, JSON.stringify(config))
  } catch {} // Throws em incognito, quota excedida, etc.
}
```

---

## 5. Otimização de Re-renders — MEDIUM

### 5.1 Derivar estado durante render, não em effects

```tsx
// ERRADO: estado redundante + effect
const [fullName, setFullName] = useState('')
useEffect(() => { setFullName(firstName + ' ' + lastName) }, [firstName, lastName])

// CORRETO: derivar durante render
const fullName = firstName + ' ' + lastName
```

### 5.2 Defer state reads para ponto de uso

Não assinar estados dinâmicos (searchParams) se são lidos apenas em callbacks.

```tsx
// ERRADO: re-renderiza em toda mudança de searchParams
const searchParams = useSearchParams()
const handleShare = () => { shareChat(chatId, { ref: searchParams.get('ref') }) }

// CORRETO: lê on demand sem subscription
const handleShare = () => {
  const params = new URLSearchParams(window.location.search)
  shareChat(chatId, { ref: params.get('ref') })
}
```

### 5.3 Não usar useMemo para expressões simples com resultado primitivo

```tsx
// ERRADO: overhead de useMemo maior que a expressão
const isLoading = useMemo(() => user.isLoading || notifications.isLoading,
  [user.isLoading, notifications.isLoading])

// CORRETO: expressão direta
const isLoading = user.isLoading || notifications.isLoading
```

### 5.4 Extrair default non-primitive de componentes memoizados

```tsx
// ERRADO: onClick tem valor diferente a cada render
const UserAvatar = memo(function({ onClick = () => {} }) { /* ... */ })

// CORRETO: default value estável
const NOOP = () => {}
const UserAvatar = memo(function({ onClick = NOOP }) { /* ... */ })
```

### 5.5 Extrair para componentes memoizados

```tsx
// ERRADO: computa avatar mesmo quando loading
function Profile({ user, loading }) {
  const avatar = useMemo(() => <Avatar id={computeAvatarId(user)} />, [user])
  if (loading) return <Skeleton />
  return <div>{avatar}</div>
}

// CORRETO: pula computação quando loading
const UserAvatar = memo(function({ user }) {
  return <Avatar id={computeAvatarId(user)} />
})

function Profile({ user, loading }) {
  if (loading) return <Skeleton />
  return <div><UserAvatar user={user} /></div>
}
```

**Nota:** Com React Compiler habilitado, memoização manual é desnecessária.

### 5.6 Dependências de effects: usar primitivos

```tsx
// ERRADO: re-executa em qualquer mudança no user
useEffect(() => { console.log(user.id) }, [user])

// CORRETO: re-executa só quando id muda
useEffect(() => { console.log(user.id) }, [user.id])
```

Derivar booleans antes do effect:

```tsx
const isMobile = width < 768
useEffect(() => { if (isMobile) enableMobileMode() }, [isMobile])
```

### 5.7 Lógica de interação em event handlers, não effects

```tsx
// ERRADO: side effect modelado como state + effect
const [submitted, setSubmitted] = useState(false)
useEffect(() => { if (submitted) post('/api/register') }, [submitted, theme])

// CORRETO: no handler
function handleSubmit() {
  post('/api/register')
  showToast('Registered', theme)
}
```

### 5.8 Assinar estado derivado (booleans), não valores contínuos

```tsx
// ERRADO: re-renderiza em cada pixel
const width = useWindowWidth()
const isMobile = width < 768

// CORRETO: re-renderiza só na transição de boolean
const isMobile = useMediaQuery('(max-width: 767px)')
```

### 5.9 Functional setState para callbacks estáveis

```tsx
// ERRADO: callback recriada a cada mudança de items
const addItems = useCallback((newItems) => {
  setItems([...items, ...newItems])
}, [items])

// CORRETO: callback estável, sem stale closures
const addItems = useCallback((newItems) => {
  setItems(curr => [...curr, ...newItems])
}, [])
```

### 5.10 Lazy state initialization

```tsx
// ERRADO: buildSearchIndex() roda em CADA render
const [searchIndex] = useState(buildSearchIndex(items))

// CORRETO: roda apenas na inicialização
const [searchIndex] = useState(() => buildSearchIndex(items))
```

### 5.11 useTransition para updates não-urgentes

```tsx
import { startTransition } from 'react'

const handler = () => {
  startTransition(() => setScrollY(window.scrollY))
}
```

### 5.12 useRef para valores transientes

Valores que mudam frequentemente sem necessidade de re-render (mouse position, intervals, flags temporários).

```tsx
// ERRADO: re-renderiza a cada movimento do mouse
const [lastX, setLastX] = useState(0)

// CORRETO: atualiza DOM diretamente via ref
const lastXRef = useRef(0)
const dotRef = useRef<HTMLDivElement>(null)
useEffect(() => {
  const onMove = (e) => {
    lastXRef.current = e.clientX
    if (dotRef.current) dotRef.current.style.transform = `translateX(${e.clientX}px)`
  }
  window.addEventListener('mousemove', onMove)
  return () => window.removeEventListener('mousemove', onMove)
}, [])
```

---

## 6. Performance de Renderização — MEDIUM

### 6.1 Animar wrapper do SVG, não o SVG

```tsx
// ERRADO: sem aceleração de hardware
<svg className="animate-spin">...</svg>

// CORRETO: aceleração GPU via wrapper div
<div className="animate-spin"><svg>...</svg></div>
```

### 6.2 content-visibility para listas longas

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

Para 1000 items, o browser pula layout/paint de ~990 off-screen (10x mais rápido).

### 6.3 Hoist JSX estático fora de componentes

```tsx
// ERRADO: recria elemento a cada render
function Container() {
  return <div>{loading && <div className="animate-pulse h-20 bg-gray-200" />}</div>
}

// CORRETO: reusa mesmo elemento
const skeleton = <div className="animate-pulse h-20 bg-gray-200" />
function Container() {
  return <div>{loading && skeleton}</div>
}
```

**Nota:** React Compiler faz isso automaticamente.

### 6.4 Prevenir hydration mismatch sem flickering

Para conteúdo dependente de client-side storage (theme, preferences), usar inline script síncrono.

```tsx
function ThemeWrapper({ children }) {
  return (
    <>
      <div id="theme-wrapper">{children}</div>
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          try {
            var theme = localStorage.getItem('theme') || 'light';
            document.getElementById('theme-wrapper').className = theme;
          } catch (e) {}
        })();
      ` }} />
    </>
  )
}
```

### 6.5 Activity component para show/hide

```tsx
import { Activity } from 'react'

function Dropdown({ isOpen }) {
  return (
    <Activity mode={isOpen ? 'visible' : 'hidden'}>
      <ExpensiveMenu />
    </Activity>
  )
}
```

Preserva estado e DOM de componentes caros que alternam visibilidade.

### 6.6 Ternário explícito para renderização condicional

```tsx
// ERRADO: renderiza "0" quando count é 0
{count && <span className="badge">{count}</span>}

// CORRETO: não renderiza nada quando count é 0
{count > 0 ? <span className="badge">{count}</span> : null}
```

### 6.7 useTransition sobre loading states manuais

```tsx
// ERRADO: gerenciamento manual de loading
const [isLoading, setIsLoading] = useState(false)
const handleSearch = async (value) => {
  setIsLoading(true)
  const data = await fetchResults(value)
  setResults(data)
  setIsLoading(false)
}

// CORRETO: useTransition com isPending automático
const [isPending, startTransition] = useTransition()
const handleSearch = (value) => {
  setQuery(value)
  startTransition(async () => {
    const data = await fetchResults(value)
    setResults(data)
  })
}
```

---

## 7. Performance JavaScript — LOW-MEDIUM

Micro-otimizações para hot paths.

### 7.1 Evitar layout thrashing

Não intercalar escritas de estilo com leituras de layout.

```typescript
// ERRADO: cada leitura força reflow
element.style.width = '100px'
const width = element.offsetWidth  // Força reflow
element.style.height = '200px'

// CORRETO: batch writes → read
element.style.width = '100px'
element.style.height = '200px'
const { width } = element.getBoundingClientRect()
```

Preferir CSS classes a inline styles.

### 7.2 Map para lookups repetidos

```typescript
// ERRADO: O(n) por lookup → O(n²)
orders.map(order => ({ ...order, user: users.find(u => u.id === order.userId) }))

// CORRETO: O(1) por lookup → O(n)
const userById = new Map(users.map(u => [u.id, u]))
orders.map(order => ({ ...order, user: userById.get(order.userId) }))
```

### 7.3 Cache de property access em loops

```typescript
const value = obj.config.settings.value
const len = arr.length
for (let i = 0; i < len; i++) { process(value) }
```

### 7.4 Cache de chamadas de função repetidas

```typescript
const slugifyCache = new Map<string, string>()
function cachedSlugify(text: string): string {
  if (slugifyCache.has(text)) return slugifyCache.get(text)!
  const result = slugify(text)
  slugifyCache.set(text, result)
  return result
}
```

### 7.5 Cache de Storage API

`localStorage`, `sessionStorage`, `document.cookie` são síncronos e custosos. Cachear em memória.

```typescript
const storageCache = new Map<string, string | null>()
function getLocalStorage(key: string) {
  if (!storageCache.has(key)) storageCache.set(key, localStorage.getItem(key))
  return storageCache.get(key)
}
```

Invalidar em mudanças externas:

```typescript
window.addEventListener('storage', (e) => { if (e.key) storageCache.delete(e.key) })
```

### 7.6 Combinar iterações de array

```typescript
// ERRADO: 3 iterações
const admins = users.filter(u => u.isAdmin)
const testers = users.filter(u => u.isTester)

// CORRETO: 1 iteração
const admins = [], testers = []
for (const u of users) {
  if (u.isAdmin) admins.push(u)
  if (u.isTester) testers.push(u)
}
```

### 7.7 Check de length antes de comparações

```typescript
function hasChanges(current: string[], original: string[]) {
  if (current.length !== original.length) return true
  const a = current.toSorted(), b = original.toSorted()
  return a.some((v, i) => v !== b[i])
}
```

### 7.8 Early return

```typescript
// ERRADO: continua verificando após encontrar erro
// CORRETO: retorna imediatamente no primeiro erro
for (const user of users) {
  if (!user.email) return { valid: false, error: 'Email required' }
}
return { valid: true }
```

### 7.9 Hoist RegExp

```tsx
// ERRADO: new RegExp a cada render
const regex = new RegExp(`(${query})`, 'gi')

// CORRETO: memoize
const regex = useMemo(() => new RegExp(`(${escapeRegex(query)})`, 'gi'), [query])
```

**Atenção:** regex com flag `/g` tem estado mutável via `lastIndex`.

### 7.10 Loop para min/max em vez de sort

```typescript
// ERRADO: O(n log n) para achar máximo
const latest = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)[0]

// CORRETO: O(n)
let latest = projects[0]
for (let i = 1; i < projects.length; i++) {
  if (projects[i].updatedAt > latest.updatedAt) latest = projects[i]
}
```

### 7.11 Set/Map para O(1) lookups

```typescript
// ERRADO: O(n) por check
items.filter(item => allowedIds.includes(item.id))

// CORRETO: O(1) por check
const allowed = new Set(allowedIds)
items.filter(item => allowed.has(item.id))
```

### 7.12 toSorted() para imutabilidade

```typescript
// ERRADO: muta o array original (bug em React state/props)
const sorted = users.sort((a, b) => a.name.localeCompare(b.name))

// CORRETO: novo array, original inalterado
const sorted = users.toSorted((a, b) => a.name.localeCompare(b.name))
```

Métodos imutáveis: `.toSorted()`, `.toReversed()`, `.toSpliced()`, `.with()`.

---

## 8. Padrões Avançados — LOW

### 8.1 Inicializar app uma vez, não por mount

```tsx
// ERRADO: roda 2x em dev, re-roda em remount
useEffect(() => { loadFromStorage(); checkAuthToken() }, [])

// CORRETO: uma vez por app load
let didInit = false
function App() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    loadFromStorage(); checkAuthToken()
  }, [])
}
```

### 8.2 useEffectEvent para callbacks estáveis em refs

```tsx
import { useEffectEvent } from 'react'

function useWindowEvent(event: string, handler: (e) => void) {
  const onEvent = useEffectEvent(handler)
  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

Cria referência estável que sempre chama a versão mais recente do handler.

---

## Referências

- https://react.dev
- https://react.dev/learn/you-might-not-need-an-effect
- https://react.dev/reference/react/cache
- https://react.dev/reference/react/useTransition
- https://react.dev/learn/react-compiler
- https://swr.vercel.app
- https://github.com/shuding/better-all
- https://github.com/isaacs/node-lru-cache
- https://vercel.com/blog/how-we-optimized-package-imports-in-next-js
- https://vercel.com/blog/how-we-made-the-vercel-dashboard-twice-as-fast
- https://csstriggers.com

---

## Skills Relacionadas

- `skills/performance/performance-audit.md` — Auditoria genérica de performance
- `skills/performance/caching-strategies.md` — Cache L1-L3, Redis, TTL
- `skills/frontend/html-css-audit.md` — HTML/CSS quality
- `skills/frontend/accessibility.md` — WCAG 2.1 AA
- `skills/frontend/seo-checklist.md` — Core Web Vitals, LCP, CLS

