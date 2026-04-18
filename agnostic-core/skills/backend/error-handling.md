Error Handling

Objetivo: Tratar erros de forma consistente, segura e rastreavel — distinguindo erros operacionais (esperados) de erros de programacao (bugs).

---

CLASSIFICACAO DE ERROS

Erro Operacional (esperado em producao):
  Condicoes previstas que podem ocorrer em operacao normal.
  Exemplos: usuario nao encontrado, senha incorreta, servico externo fora do ar, input invalido.
  Acao: tratar, logar com nivel apropriado, retornar mensagem amigavel ao cliente.

Erro de Programacao (bug):
  Falha no codigo que nao deveria acontecer.
  Exemplos: TypeError de variavel undefined, acesso a propriedade nula, logica incorreta.
  Acao: logar como CRITICO, retornar 500 generico ao cliente, alertar time.

---

HIERARQUIA DE ERROS (Node.js / JavaScript)

  class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
      super(message)
      this.name = 'AppError'
      this.statusCode = statusCode
      this.code = code
      this.isOperational = true // distingue de erros de programacao
    }
  }

  class NotFoundError extends AppError {
    constructor(resource = 'Recurso') {
      super(`${resource} nao encontrado`, 404, 'NOT_FOUND')
    }
  }

  class ValidationError extends AppError {
    constructor(message, details = []) {
      super(message, 422, 'VALIDATION_ERROR')
      this.details = details
    }
  }

  class UnauthorizedError extends AppError {
    constructor(message = 'Nao autorizado') {
      super(message, 401, 'UNAUTHORIZED')
    }
  }

  class ConflictError extends AppError {
    constructor(message) {
      super(message, 409, 'CONFLICT')
    }
  }

---

MIDDLEWARE CENTRALIZADO (Express)

  // middleware/errorHandler.js
  const errorHandler = (err, req, res, next) => {
    const requestId = req.headers['x-request-id'] || 'sem-id'

    // Erro operacional: logar em nivel adequado
    if (err.isOperational) {
      logger.warn({ requestId, code: err.code, message: err.message })
      return res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          ...(err.details && { details: err.details })
        }
      })
    }

    // Erro de programacao: logar como critico, resposta generica
    logger.error({ requestId, err }, 'Erro nao tratado')
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno. Tente novamente em alguns instantes.'
      }
    })
  }

  // app.js — SEMPRE o ultimo middleware
  app.use(errorHandler)

Regras:
- [ ] Middleware de erro e sempre o ULTIMO app.use()
- [ ] Nunca expor stack trace, mensagens de banco ou paths internos ao cliente
- [ ] Sempre incluir requestId no log para rastreabilidade
- [ ] Resposta de erro segue estrutura padrao (ver rest-api-design.md)

---

ASYNC/AWAIT E PROPAGACAO

Sem async wrapper — erro nao chega ao middleware:
  // RUIM
  app.get('/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id) // pode lancar, nao tratado
    res.json(user)
  })

Com wrapper ou express-async-errors:
  // BOM — opcao 1: try/catch explicito
  app.get('/users/:id', async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id)
      if (!user) throw new NotFoundError('Usuario')
      res.json(user)
    } catch (err) {
      next(err)
    }
  })

  // BOM — opcao 2: instalar express-async-errors (propaga automaticamente)
  require('express-async-errors')

  app.get('/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) throw new NotFoundError('Usuario')
    res.json(user)
  })

---

O QUE LOGAR VS O QUE EXPOR

| Dado | Logar? | Expor ao cliente? |
|---|---|---|
| Stack trace | Sim (nivel error) | Nunca |
| Mensagem tecnica do banco | Sim | Nunca |
| Request ID | Sim | Sim (header ou body) |
| Codigo de erro legivel | Sim | Sim |
| Mensagem amigavel | Sim | Sim |
| Dados do usuario no request | Sim (sanitizado) | Nao |
| Credenciais ou tokens | Nunca | Nunca |

Niveis de log:
- `error` → erros de programacao, falhas criticas
- `warn` → erros operacionais, rate limit atingido, tentativas invalidas
- `info` → eventos de negocio relevantes (login, compra, deploy)
- `debug` → diagnostico tecnico (so em desenvolvimento)

---

TRATAMENTO POR TIPO DE INTEGRACAO

Banco de dados:
  try {
    await db.query(...)
  } catch (err) {
    if (err.code === '23505') throw new ConflictError('Email ja cadastrado') // PostgreSQL unique violation
    if (err.code === 11000) throw new ConflictError('Email ja cadastrado')  // MongoDB duplicate key
    throw err // propaga erros inesperados
  }

APIs externas:
  try {
    const res = await axios.post(url, data, { timeout: 5000 })
    return res.data
  } catch (err) {
    if (err.code === 'ECONNABORTED') throw new AppError('Servico externo indisponivel', 503, 'EXTERNAL_TIMEOUT')
    if (err.response?.status === 429) throw new AppError('Limite de requisicoes atingido', 429, 'RATE_LIMITED')
    throw new AppError('Erro ao comunicar com servico externo', 502, 'EXTERNAL_ERROR')
  }

---

CHECKLIST DE QUALIDADE

- [ ] Hierarquia de erros definida e documentada
- [ ] Middleware centralizado como ultimo middleware do Express
- [ ] Nenhum endpoint com async sem tratamento de erro (express-async-errors ou try/catch)
- [ ] Erros de banco mapeados para erros de aplicacao (nao expor codigos de banco)
- [ ] Stack trace nunca exposto em resposta de producao (NODE_ENV=production)
- [ ] Request ID rastreavel do log ate a resposta ao cliente
- [ ] Erros de programacao alertam o time (Sentry, Datadog, etc.)
