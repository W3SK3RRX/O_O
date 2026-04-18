# Replit Patterns

Guia de padrões, limites e boas práticas específicos para projetos na Replit.
Complementa as skills agnósticas do agnostic-core com conhecimento pontual da plataforma.

Fontes: documentação oficial da Replit, blog.replit.com.

---

## Quando usar

- Projeto está sendo desenvolvido ou deployado na Replit
- Escolhendo entre Autoscale, Reserved VM, Static ou Scheduled
- Configurando `.replit` e `replit.nix`
- Gerenciando secrets e banco de dados
- Otimizando custos de deployment

---

## 1. Tipos de Deployment

| Tipo | Ideal para | Escalabilidade | Custo |
|---|---|---|---|
| **Autoscale** | APIs, web apps, microsserviços | Escala com tráfego, zero quando idle | ~$0.000024/s (pay-as-you-go) |
| **Reserved VM** | Bots, jobs, apps always-on | 1 instância fixa, 99.9% uptime | A partir de $10/mês |
| **Static** | Portfólios, landing pages, SPAs | CDN, sem servidor | Grátis |
| **Scheduled** | Cron jobs, cleanup, relatórios | 1 execução por schedule | $0.000061/s + $0.10/mês |

### Quando usar cada

**Autoscale:**
- Web apps com tráfego variável
- APIs que precisam escalar horizontalmente
- Apps que podem tolerar cold starts
- Escala para zero = sem custo quando ocioso

**Reserved VM:**
- Discord/Telegram bots (conexão persistente)
- Workers com processamento contínuo
- Apps que não toleram cold starts
- Background jobs fora do ciclo request/response

**Static:**
- Sites sem backend (React, Vue, Svelte builds)
- Documentação, portfólios
- **Não compatível** com apps criadas pelo Replit Agent (que são full-stack)

**Scheduled:**
- Limpeza de dados diária/semanal
- Relatórios periódicos
- Health checks automatizados
- Máximo de 11 horas por job, 1vCPU / 2 GiB RAM

---

## 2. Configuração — `.replit` e `replit.nix`

### Estrutura do `.replit`

```toml
# Arquivo principal do projeto
entrypoint = "main.py"

# Módulo de runtime (gerenciado pelo Replit)
modules = ["python-3.11:v28-20240901"]

[nix]
channel = "stable-24_05"

# Comando de execução no workspace (dev)
run = "python main.py"

# Build separado (para linguagens compiladas)
[build]
run = "npm run build"

# Testes unitários
[unitTest]
language = "python3"

# Configuração de portas
[[ports]]
localPort = 3000
externalPort = 80

[[ports]]
localPort = 5432
externalPort = 5432

# Configuração de deployment (separada do dev)
[deployment]
run = ["python3", "main.py"]
build = "pip install -r requirements.txt"
deploymentTarget = "cloudrun"
# ignorePorts = true  # descomenta se necessário

# Environment variables para o run
[run.env]
NODE_ENV = "development"

# Environment variables para deployment
[deployment.env]
NODE_ENV = "production"
```

### Estrutura do `replit.nix`

```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-20_x
    pkgs.nodePackages.typescript-language-server
    pkgs.python311
    pkgs.postgresql
    pkgs.redis
  ];
}
```

**Dicas Nix:**
- Pacotes ficam disponíveis imediatamente (pré-cached no Nix store)
- Cache salvo em `.cache/replit/nix/env.json` — reutilizado em restarts
- Para encontrar pacotes: `nix-env -qaP | grep <nome>` ou buscar em search.nixos.org

### Múltiplos processos

```toml
# Executar frontend + backend simultaneamente
run = "python -m app & npm run start & wait"
```

Para orquestração mais robusta, adicionar `pkgs.process-compose` no `replit.nix`.

### Port binding

A app deve escutar na porta definida pela variável de ambiente:

```python
# Python
port = int(os.environ.get('PORT', 3000))
app.run(host='0.0.0.0', port=port)
```

```javascript
// Node.js
const port = process.env.PORT || 3000
app.listen(port, '0.0.0.0')
```

**Importante:** Sempre bindar em `0.0.0.0`, não em `localhost` ou `127.0.0.1`.

---

## 3. Secrets e Environment Variables

### Regra de ouro: nunca usar `.env`

O Replit **não trata `.env` como seguro** — ele é commitado no histórico. Usar sempre o Secrets Manager (ícone de cadeado na sidebar).

### Como funciona

```python
# Python — acessa como variável de ambiente
import os
api_key = os.environ['OPENAI_API_KEY']

# Validar na inicialização
required = ['DATABASE_URL', 'API_KEY', 'JWT_SECRET']
missing = [k for k in required if k not in os.environ]
if missing:
    raise RuntimeError(f"Missing secrets: {', '.join(missing)}")
```

```javascript
// Node.js
const apiKey = process.env.OPENAI_API_KEY

// Validar na inicialização
const required = ['DATABASE_URL', 'API_KEY', 'JWT_SECRET']
const missing = required.filter(k => !process.env[k])
if (missing.length) {
  throw new Error(`Missing secrets: ${missing.join(', ')}`)
}
```

### Checklist de segurança

- [ ] Secrets no Secrets Manager, nunca no código
- [ ] Nunca usar `.env` files — Replit não os protege
- [ ] API keys nunca no frontend (`NEXT_PUBLIC_*`, `VITE_*`)
- [ ] Nunca logar valores de secrets
- [ ] Se um secret vazar no código: revogar na API, atualizar no Replit
- [ ] Secrets disponíveis tanto em dev quanto em deployment (mesma config)

### Convenção de nomes

```
DATABASE_URL          # connection string do banco
API_KEY               # chave de API genérica
OPENAI_API_KEY        # chave específica de serviço
JWT_SECRET            # secret para tokens
REVALIDATION_SECRET   # secret para webhooks
```

Sempre uppercase, underscore-separated.

---

## 4. Banco de Dados

### Replit Database (PostgreSQL)

Desde dezembro 2025, novos databases são hospedados na infraestrutura própria do Replit (não mais Neon).

```python
# Connection string via Secrets (auto-configurada)
DATABASE_URL = os.environ['DATABASE_URL']

# Verificar provedor:
# - Contém "neon.tech/neondb" → legacy Neon
# - Contém "helium/heliumdb" → novo Replit DB
```

**Características:**
- Serverless — cobra por uso real
- Database tools integrado no workspace (queries, schema, visualização)
- ORM configurado automaticamente pelo Agent (Drizzle, Prisma, SQLAlchemy)
- Migrations via Alembic (Python) ou Drizzle Kit (Node.js)
- 7 dias de version history para recovery

### Boas práticas de banco

```python
# CORRETO: usar ORM para proteção contra SQL injection
from sqlalchemy import select
result = session.execute(select(User).where(User.id == user_id))

# ERRADO: query crua com interpolação
result = session.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

- Connection string sempre no Secrets Manager
- Usar ORM (proteção contra SQL injection built-in)
- Não armazenar dados sensíveis de usuários no Replit DB para apps de produção
- Considerar banco externo (Supabase, PlanetScale, Neon) para produção real

### Object Storage

Para arquivos e dados não-estruturados (imagens, PDFs, CSVs):

```python
# Object Storage — auto-configurado quando adicionado
from replit.object_storage import Client

client = Client()
client.upload_from_text("config.json", '{"key": "value"}')
data = client.download_as_text("config.json")
```

**Ideal para:** media assets, uploads de usuários, arquivos CSV/JSON grandes.

---

## 5. Limites e Otimização de Custos

### Limites por plano

| Recurso | Starter (free) | Core | Pro |
|---|---|---|---|
| Apps privadas | Não | Sim | Sim |
| Dev environment | 0.5 vCPU / 1 GiB | 4 vCPU / 8 GiB | 8 vCPU / 16 GiB |
| Static deployments | 1 | Ilimitado | Ilimitado |
| Autoscale/Reserved VM | Sim (pago) | Sim (pago) | Sim (pago) |
| Egress (static) | 5 GiB | 50 GiB | 100 GiB |

### Machine sizes (deployment)

| Tipo | vCPU | RAM | Custo/mês (Reserved) |
|---|---|---|---|
| Shared (burst) | 0.25–1 | 512MB–2GB | ~$1–5 |
| Shared | 1–2 | 2–4 GiB | ~$10–20 |
| Dedicated | 2–8 | 4–16 GiB | ~$20–80 |

**Shared vs Dedicated:**
- Shared: CPU via token bucket (bursts), mais barato, tráfego ocasional
- Dedicated: CPU completo, 10x mais egress, tráfego constante

### Estratégias de custo

```toml
# 1. Autoscale com máximo de instâncias limitado
# Configurar slider de "max machines" no painel de deployment

# 2. Build cache — não rebuildar se nada mudou
# Replit faz isso automaticamente

# 3. Static onde possível
# Frontend estático é grátis — separar frontend de backend
```

**Armadilhas comuns:**
- Autoscale com tráfego inesperado → conta alta (configurar max machines)
- Reserved VM quando autoscale bastaria → custo fixo desnecessário
- Usar Agent intensivamente → checkpoints consomem créditos AI

---

## 6. Deployment — Checklist Rápido

### Pré-deploy

- [ ] `.replit` com `[deployment]` configurado (run + build)
- [ ] Secrets configurados no Secrets Manager
- [ ] App escuta em `0.0.0.0:$PORT`
- [ ] Sem `.env` files no projeto
- [ ] Banco de dados migrado
- [ ] Tipo de deployment escolhido (Autoscale / Reserved VM / Static)

### Arquivo `.replit` para deployment — Node.js

```toml
entrypoint = "src/index.ts"
modules = ["nodejs-20:v8-20230920-bd784b9"]

[nix]
channel = "stable-24_05"

run = "npm run dev"

[deployment]
run = ["npm", "start"]
build = "npm run build"
deploymentTarget = "cloudrun"

[[ports]]
localPort = 3000
externalPort = 80
```

### Arquivo `.replit` para deployment — Python

```toml
entrypoint = "main.py"
modules = ["python-3.11:v28-20240901"]

[nix]
channel = "stable-24_05"

run = "python main.py"

[deployment]
run = ["gunicorn", "--bind", "0.0.0.0:3000", "app:app"]
build = "pip install -r requirements.txt"
deploymentTarget = "cloudrun"

[[ports]]
localPort = 3000
externalPort = 80
```

### Custom domain

1. No painel de Deployments, adicionar domínio customizado
2. Configurar DNS (CNAME para o endereço fornecido)
3. HTTPS gerenciado automaticamente pelo Replit

---

## 7. Monitoramento

### CPU e RAM

Disponível diretamente no workspace na aba Deployments — monitora uso de CPU e memória da máquina de deployment.

### Logs

Logs de deployment acessíveis no painel de Deployments no workspace.

### Health checks externos

```python
# Endpoint de health check (recomendado)
@app.get("/health")
async def health():
    return {"status": "ok", "db": await check_db()}
```

Usar serviços como UptimeRobot para monitorar uptime e manter apps acordadas (se necessário).

### Scheduled health checks

```toml
# Scheduled deployment para verificar saúde periodicamente
[deployment]
run = ["python3", "health_check.py"]
# Configurar schedule: "every 5 minutes" no painel
```

---

## 8. Diferenças Dev vs Deploy

| Aspecto | Workspace (dev) | Deployment (prod) |
|---|---|---|
| Comando | `run` (top-level) | `[deployment].run` |
| Build | `[build].run` | `[deployment].build` |
| Env vars | `[run.env]` | `[deployment.env]` + Secrets |
| Porta | Qualquer | `$PORT` (obrigatória) |
| Filesystem | Persistente | Efêmero (exceto Object Storage) |
| Logs | Console do workspace | Painel de Deployments |
| Reinicialização | Manual (Run button) | Automática (health checks) |

**Armadilha comum:** código funciona no workspace mas falha no deployment porque:
- Usa porta hardcoded em vez de `$PORT`
- Depende de arquivos locais (filesystem efêmero no deploy)
- Build command diferente ou ausente no `[deployment]`
- Binds em `localhost` em vez de `0.0.0.0`

---

## Skills Relacionadas

- `skills/devops/deploy-procedures.md` — Procedimentos de deploy agnósticos
- `skills/devops/pre-deploy-checklist.md` — Checklist pré-deploy
- `skills/security/api-hardening.md` — Hardening de endpoints
- `skills/backend/error-handling.md` — Tratamento de erros
- `skills/database/schema-design.md` — Design de schema
- `skills/platforms/vercel/vercel-patterns.md` — Comparação com Vercel
