# Estratégias de Cache

Ideias de cache que valem considerar dependendo do problema que você está resolvendo.
Cache resolve problemas específicos — identifique o gargalo antes de adicionar uma camada.

---

## Quando cache faz sentido

- Dados que mudam raramente mas são lidos com frequência (configurações, catálogos)
- Respostas de APIs externas com custo por requisição ou rate limit
- Computações pesadas cujo resultado é determinístico para os mesmos parâmetros
- Sessões de usuário e tokens de autenticação
- Resultados de queries agregadas (relatórios, dashboards)

## Quando cache pode causar problema

- Dados financeiros — cache pode causar leitura de saldo desatualizado
- Dados com consistência forte necessária (estoque em tempo real, agendamentos)
- Quando a invalidação é complexa demais de manter correta

---

## Estratégias principais

### Cache-Aside (Lazy Loading)
A aplicação verifica o cache. Se não encontrar (miss), busca na fonte, armazena no cache e retorna.

```
Cache miss → busca no banco → armazena no cache → retorna
Cache hit  → retorna direto do cache
```

**Bom para:** leitura pesada, dados que nem sempre são necessários
**Cuidado:** cold start (primeiro acesso sempre vai ao banco), thundering herd

### Read-Through
O cache gerencia automaticamente a busca na fonte quando há miss.
A aplicação só fala com o cache.

**Bom para:** simplificar o código da aplicação
**Cuidado:** requer suporte do provider de cache

### Write-Through
Toda escrita vai ao cache e ao banco ao mesmo tempo.

**Bom para:** leitura frequente logo após escrita, consistência importante
**Cuidado:** latência de escrita maior, dados raramente lidos ficam no cache sem necessidade

### Write-Behind (Write-Back)
Escreve no cache primeiro, banco depois (assíncrono).

**Bom para:** alta frequência de escrita, cenários onde latência de escrita importa
**Cuidado:** risco de perda de dados se o cache cair antes de persistir; evite em dados críticos

---

## Onde cachear

| Camada | Ferramenta | Bom para |
|---|---|---|
| In-memory (processo) | Map, LRU local | dados imutáveis por deploy, config |
| Distributed cache | Redis, Memcached | sessões, tokens, dados entre instâncias |
| HTTP cache | Cache-Control, ETags | respostas de API, assets |
| CDN | Cloudflare, Fastly | assets estáticos, conteúdo geográfico |
| Query cache | ORM built-in | queries repetitivas no mesmo request |

---

## TTL — Time to Live

- Defina TTL explícito para toda entrada; nunca confie em cache que "dura para sempre"
- TTL muito curto: pouca vantagem, muitas idas ao banco
- TTL muito longo: risco de dados stale, problema maior quando é dado crítico
- Referência aproximada: sessão (15min–24h), catálogos (1h–24h), config (até o próximo deploy)

---

## Invalidação

Cache tem dois problemas difíceis: nomear coisas e invalidar cache.

- **Por TTL:** simples, mas pode entregar dado desatualizado até expirar
- **Por evento:** invalida no momento da mudança (mais correto, mais complexo)
- **Por versão:** inclui versão na chave (`produto:v2:123`) — troca a chave em vez de invalidar

```
# Padrão de chave com namespace
{entidade}:{id}           → produto:456
{entidade}:{filtro}       → produtos:categoria:eletronicos
{usuario}:{recurso}       → usuario:789:permissoes
```

---

## Armadilhas comuns

**Cache como fonte de verdade** — o banco é a fonte de verdade. O cache é otimização.
Nunca tome decisões críticas (autorização, saldo, estoque) baseado só no cache.

**Cache stampede / thundering herd** — múltiplas requisições simultâneas com miss,
todas indo ao banco ao mesmo tempo. Mitigue com: mutex/lock na busca, probabilistic early expiration,
ou warm-up antes de remover o TTL.

**Memória ilimitada** — sempre configure `maxmemory` e política de eviction no Redis
(`allkeys-lru` é um bom padrão).

**Sem monitoramento** — rastreie hit rate, miss rate e latência. Hit rate abaixo de 70-80%
geralmente indica problema na estratégia.

---

Ver também: `skills/performance/performance-audit.md`, `skills/database/query-compliance.md`
