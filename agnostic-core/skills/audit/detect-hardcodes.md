# Detect Hardcodes — Auditoria de Valores Fixos

Referência para identificar e classificar valores hardcoded no código-fonte — útil em
code review, auditoria de segurança ou ao preparar um codebase para múltiplos ambientes
(dev, staging, prod).

---

## O que é um hardcode

Qualquer valor literal embutido diretamente no código que deveria ser:
- Configurável por ambiente (URLs, portas, timeouts)
- Protegido como segredo (API keys, senhas, tokens)
- Centralizado como constante de negócio (limites, tarifas, IDs fixos)
- Internacionalizável (textos visíveis ao usuário)

---

## Categorias e Prioridade

### CRÍTICO — Risco de segurança imediato
- Credenciais: senha, token, API key, secret, private key
- URLs de produção com dados sensíveis
- IDs de usuários ou contas reais em código de produção
- Chaves de criptografia ou IV fixos

```
# Exemplos CRÍTICOS a buscar
grep -rn "password\s*=" src/
grep -rn "api_key\s*=" src/
grep -rn "secret\s*=" src/
grep -rn "Bearer [A-Za-z0-9]" src/
grep -rn "sk-[a-zA-Z0-9]" src/   # OpenAI keys
grep -rn "sk-ant-" src/           # Anthropic keys
```

### ALTO — Quebra entre ambientes
- URLs base de APIs (http://api.producao.com/v1)
- Portas fixas (3000, 5432, 6379)
- Nomes de banco de dados, schemas, tabelas em strings SQL
- Endereços de email de sistema fixos
- Paths absolutos de sistema de arquivos

```
grep -rn "http://\|https://" src/ --include="*.ts" --include="*.js"
grep -rn "localhost:[0-9]" src/
grep -rn "/home/\|/var/\|/etc/" src/
```

### MÉDIO — Dívida técnica e manutenção
- Limites de negócio numéricos (máximo de itens, tamanho de arquivo)
- Tarifas, percentuais, coeficientes financeiros
- Timeouts e intervalos de retry
- IDs de categorias, status ou tipos fixos no banco

```
grep -rn "= [0-9]\{4,\}" src/     # números grandes sem contexto
grep -rn "setTimeout.*[0-9]\{4\}" src/
grep -rn "0\.[0-9]\+" src/ | grep -v test   # percentuais/taxas
```

### BAIXO — Internacionalização e UX
- Strings visíveis ao usuário fora de arquivos de i18n
- Mensagens de erro em idioma fixo
- Labels e placeholders hardcoded em componentes

```
grep -rn '"[A-Z]' src/components/   # strings em maiúscula (possível texto UI)
grep -rn "placeholder=" src/ | grep -v i18n
```

---

## Processo de Auditoria

### Passo 1 — Varredura automatizada

```bash
# Buscar padrões de credenciais
git log --all --full-history -- "*.env" 2>/dev/null   # env files no histórico
grep -rn "password\|passwd\|pwd\|secret\|token\|apikey\|api_key" \
  --include="*.js" --include="*.ts" --include="*.py" \
  --exclude-dir=node_modules --exclude-dir=.git src/

# Buscar valores que deveriam ser variáveis de ambiente
grep -rn "process\.env\." src/ > /tmp/env-uses.txt
grep -rn "os\.environ" src/ >> /tmp/env-uses.txt
```

### Passo 2 — Classificar cada ocorrência

Para cada hardcode encontrado, responder:
- [ ] Qual categoria? (CRÍTICO / ALTO / MÉDIO / BAIXO)
- [ ] Está em código de produção ou apenas em testes?
- [ ] Já existe variável de ambiente equivalente?
- [ ] Qual é o impacto de expor este valor?

### Passo 3 — Verificar histórico git

```bash
# Verificar se credenciais já foram commitadas (mesmo removidas depois)
git log --all -p --source | grep -i "api_key\|password\|secret\|token" | head -50

# Verificar .gitignore cobre arquivos sensíveis
cat .gitignore | grep -E "\.env|secrets|credentials"
```

### Passo 4 — Priorizar correções

Ordem de prioridade:
1. CRÍTICO em código de produção → rotacionar credencial imediatamente, corrigir código
2. CRÍTICO em histórico git → rotacionar credencial + considerar reescrita de histórico
3. ALTO → criar variável de ambiente antes do próximo deploy
4. MÉDIO → criar constante nomeada ou configuração centralizada
5. BAIXO → planejar para próximo ciclo de i18n

---

## Padrões de Correção

### Credenciais: usar variáveis de ambiente

```python
# ERRADO
client = AnthropicClient(api_key="sk-ant-api03-...")

# CORRETO
import os
api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    raise ValueError("ANTHROPIC_API_KEY não configurada")
client = AnthropicClient(api_key=api_key)
```

### URLs: usar configuração por ambiente

```javascript
// ERRADO
const API_BASE = "https://api.producao.com/v1"

// CORRETO
const API_BASE = process.env.API_BASE_URL
  ?? "http://localhost:3000"   // fallback apenas para dev local
```

### Constantes de negócio: centralizar

```typescript
// ERRADO (espalhado em vários arquivos)
if (items.length > 50) { ... }
if (fileSize > 10485760) { ... }

// CORRETO (em constants.ts ou config.ts)
export const MAX_ITEMS_PER_PAGE = 50
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  // 10 MB
```

---

## Checklist de Auditoria

- [ ] Varredura com grep por padrões de credenciais feita
- [ ] Histórico git verificado (commits antigos)
- [ ] .gitignore cobre todos os arquivos de configuração sensível
- [ ] Nenhuma URL de produção hardcoded em código de aplicação
- [ ] Variáveis de ambiente documentadas (README ou .env.example)
- [ ] Constantes de negócio nomeadas e centralizadas
- [ ] Textos de UI em arquivos de i18n (se projeto usa internacionalização)
- [ ] Ferramentas de secret scanning configuradas no CI (ex: truffleHog, gitleaks)

---

## Ferramentas

- `gitleaks`: escaneamento de segredos no histórico git — https://github.com/gitleaks/gitleaks
- `truffleHog`: detecção de segredos em repos — https://github.com/trufflesecurity/trufflehog
- `dotenv-linter`: lint de arquivos .env — https://github.com/dotenv-linter/dotenv-linter
- GitHub Secret Scanning: habilitado automaticamente em repos públicos
