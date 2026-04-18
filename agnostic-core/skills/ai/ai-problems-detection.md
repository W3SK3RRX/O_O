# AI Problems Detection — 5 Anti-Patterns de IA ao Codar

Os 5 problemas mais comuns que modelos de linguagem cometem ao gerar ou modificar
código, e como detectar e corrigir cada um. Útil ao revisar código gerado por IA,
ao usar AI assistants em pair programming, ou ao auditar um codebase com muita
geração automática.

---

## Anti-Pattern 1 — Alucinação de APIs e Funções

**O problema**: A IA inventa funções, métodos, parâmetros ou opções que não existem
na biblioteca ou framework. O código parece correto mas falha em runtime.

**Exemplos comuns**:
```python
# IA inventa parâmetro que não existe
response = anthropic.messages.create(
    model="claude-sonnet-4-6",
    stream_format="json"   # não existe — IA inventou
)

# IA usa versão de API desatualizada ou inexistente
result = db.query.fetchAllPaginated(page=2)  # método inventado
```

**Como detectar**:
- [ ] Toda função/método gerado pela IA foi verificado na documentação oficial
- [ ] Parâmetros opcionais verificados — IA frequentemente inventa nomes plausíveis
- [ ] Versão da biblioteca confirmada — IA pode usar API de versão diferente da instalada
- [ ] Testes executados (não apenas "parece certo")

**Correção**: Sempre validar código gerado contra documentação oficial e executar
os testes. Desconfiar de parâmetros muito específicos que não aparecem nos exemplos
da doc.

---

## Anti-Pattern 2 — Overengineering e Abstração Prematura

**O problema**: A IA tende a criar hierarquias de classes, interfaces, factories e
padrões de design para problemas simples que não justificam a complexidade.

**Exemplos comuns**:
```typescript
// IA cria para um simples "formatar data"
interface IDateFormatterStrategy { format(date: Date): string }
class ISODateFormatterStrategy implements IDateFormatterStrategy { ... }
class LocaleDateFormatterStrategy implements IDateFormatterStrategy { ... }
class DateFormatterFactory { create(type: string): IDateFormatterStrategy { ... } }

// Quando o necessário era apenas
const formatDate = (date: Date) => date.toISOString().split('T')[0]
```

**Como detectar**:
- [ ] Existe apenas um caso de uso real para esta abstração?
- [ ] O PR cria mais de 3 arquivos para uma feature simples?
- [ ] Existe herança com mais de 2 níveis sem necessidade clara?
- [ ] A IA criou "para o futuro" sem requisito existente?

**Correção**: Pedir explicitamente à IA "implemente da forma mais simples possível,
sem abstrações desnecessárias". Revisar se toda classe criada tem mais de um uso.

---

## Anti-Pattern 3 — Ignorar Contexto Existente

**O problema**: A IA gera código que duplica funcionalidade já existente no projeto,
ignora convenções estabelecidas ou recria utilitários que já existem.

**Exemplos comuns**:
- Cria `utils/formatCurrency.js` quando já existe `helpers/currency.ts`
- Usa `fetch()` direto quando o projeto tem um `apiClient` configurado com auth
- Recria validação que já existe em schema Zod/Yup do projeto
- Ignora o padrão de tratamento de erros estabelecido no codebase

**Como detectar**:
- [ ] Novo arquivo de utilidade? Buscar por funcionalidade similar no projeto antes
- [ ] Chamada HTTP direta? Verificar se existe cliente HTTP configurado
- [ ] Validação inline? Verificar se existe schema reutilizável
- [ ] Padrão de código diferente do restante do codebase?

```bash
# Buscar utilitários existentes antes de aceitar novo
grep -rn "formatCurrency\|format_currency" src/
grep -rn "apiClient\|api_client\|httpClient" src/
```

**Correção**: Fornecer contexto adequado à IA (arquivos relevantes, convenções do
projeto). Revisar se código gerado respeita padrões já estabelecidos.

---

## Anti-Pattern 4 — Tratamento de Erros Ingênuo

**O problema**: A IA frequentemente gera tratamento de erros que silencia falhas,
usa `catch` vazios, ou trata todos os erros da mesma forma sem distinção de tipo
ou criticidade.

**Exemplos comuns**:
```javascript
// catch vazio — engole o erro silenciosamente
try {
  await processarPagamento(dados)
} catch (e) {
  // TODO: handle error
}

// catch que retorna null sem logar
async function buscarUsuario(id) {
  try {
    return await db.users.findById(id)
  } catch {
    return null  // sistema acha que usuário não existe quando há erro de DB
  }
}

// erro genérico sem contexto
throw new Error("Something went wrong")
```

**Como detectar**:
- [ ] Algum `catch` está vazio ou apenas tem comentário?
- [ ] Erros de infraestrutura (DB, rede) tratados igual a erros de negócio?
- [ ] `return null` em catch onde null é valor válido de negócio?
- [ ] Mensagens de erro sem contexto suficiente para debug?
- [ ] Erro logado sem stack trace?

**Correção**: Revisar todo bloco `try/catch` gerado por IA. Erros devem ser:
logados com contexto, relançados se não tratáveis localmente, ou convertidos
em tipo de erro de domínio com semântica clara.

---

## Anti-Pattern 5 — Segurança e Dados Sensíveis

**O problema**: A IA frequentemente não considera implicações de segurança:
hardcoda credenciais, expõe dados sensíveis em logs, gera queries vulneráveis
a SQL injection, ou ignora validação de input.

**Exemplos comuns**:
```python
# Credencial hardcoded
API_KEY = "sk-ant-api03-real-key-here"

# Dado sensível em log
logger.info(f"Processando pagamento para {user.cpf} com cartão {card.number}")

# SQL injection
query = f"SELECT * FROM users WHERE email = '{email}'"  # vulnerável

# Input não validado
def criar_arquivo(nome):
    open(f"/uploads/{nome}", "w")  # path traversal: nome = "../../etc/passwd"
```

**Como detectar**:
- [ ] Alguma string parece uma credencial real (token, key, senha)?
- [ ] Logs incluem CPF, email, número de cartão, senha?
- [ ] Queries SQL usam f-string ou concatenação com variáveis de usuário?
- [ ] Input do usuário usado em operações de arquivo, shell ou banco sem sanitização?
- [ ] Secrets em código que vai para o repositório?

```bash
# Detectar possíveis credenciais em código gerado por IA
grep -n "api_key\s*=\s*['\"]" arquivo_gerado.py
grep -n "password\s*=\s*['\"]" arquivo_gerado.py
grep -n "SELECT.*WHERE.*+\s*\w" arquivo_gerado.js   # concatenação em SQL
```

**Correção**: Revisar todo código de autenticação, acesso a dados sensíveis e
entrada de usuário gerado por IA. Ver skills/security/security-review.md e
skills/audit/detect-hardcodes.md.

---

## Checklist de Revisão de Código Gerado por IA

Antes de aceitar qualquer bloco de código gerado por IA em produção:

- [ ] APIs e métodos verificados na documentação oficial da versão instalada
- [ ] Sem abstrações desnecessárias para o caso de uso atual
- [ ] Funcionalidade existente no projeto não foi duplicada
- [ ] Todo `try/catch` trata erros de forma adequada (sem catch vazio)
- [ ] Sem credenciais, tokens ou dados sensíveis hardcoded
- [ ] Inputs de usuário validados antes de qualquer operação
- [ ] Queries parametrizadas (sem concatenação de strings em SQL)
- [ ] Testes executados (não apenas revisão visual)
- [ ] Código segue convenções e padrões do projeto existente

---

## Referências

- Ver skills/security/security-review.md — revisão de segurança completa
- Ver skills/audit/detect-hardcodes.md — auditoria de valores hardcoded
- Ver skills/audit/code-review.md — checklist geral de code review
- OWASP Top 10: https://owasp.org/www-project-top-ten/
