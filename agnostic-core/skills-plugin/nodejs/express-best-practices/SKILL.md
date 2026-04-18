---
name: express-best-practices
description: 'Ordem de middleware, CORS, rate limiting, validacao de input'
---

HELMET — SEGURANCA DE HEADERS

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
  }))

Headers que o Helmet configura automaticamente:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 0 (moderno — desativa handler antigo)
- Referrer-Policy: no-referrer
- Remove X-Powered-By

---

CORS

  const corsOptions = {
    origin: (origin, callback) => {
      const allowed = process.env.ALLOWED_ORIGINS?.split(',') || []
      if (!origin || allowed.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Origem nao permitida pelo CORS'))
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
    maxAge: 86400, // cache preflight por 24h
  }

Regras:
- [ ] Nunca usar `origin: '*'` com `credentials: true` (erro de CORS)
- [ ] Lista de origens permitidas via variavel de ambiente, nunca hardcoded
- [ ] Em desenvolvimento: `origin: true` apenas com NODE_ENV=development

---

RATE LIMITING

  const { rateLimit } = require('express-rate-limit')

  // Limite global (todas as rotas)
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,                  // 100 requests por IP por janela
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Limite de requisicoes atingido.' } }
  })

  // Limite estrito para autenticacao
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,                    // 5 tentativas de login por IP
    skipSuccessfulRequests: true, // nao contar requests com sucesso
  })

---

ORGANIZACAO DE ROTAS

  // routes/userRoutes.js — apenas roteamento
  const router = require('express').Router()
  const userController = require('../controllers/userController')
  const { validateUpdateUser } = require('../middleware/validators')

  router.get('/', userController.listUsers)
  router.get('/:id', userController.getUser)
  router.put('/:id', validateUpdateUser, userController.updateUser)
  router.delete('/:id', userController.deleteUser)

  module.exports = router

  // controllers/userController.js — orquestra, delega para service
  const userService = require('../services/userService')

  exports.getUser = async (req, res) => {
    const user = await userService.findById(req.params.id)
    res.json(user)
  }

  exports.updateUser = async (req, res) => {
    const user = await userService.update(req.params.id, req.body)
    res.json(user)
  }

Regras:
- [ ] Controller nao tem logica de negocio — apenas orquestra
- [ ] Service nao conhece req/res — recebe dados puros, retorna dados puros
- [ ] Validacao de input em middleware dedicado (nao no controller)

---

VALIDACAO DE INPUT

  // middleware/validators.js usando Zod
  const { z } = require('zod')

  const updateUserSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
  }).strict() // rejeita campos extras

  exports.validateUpdateUser = (req, res, next) => {
    const result = updateUserSchema.safeParse(req.body)
    if (!result.success) {
      const details = result.error.issues.map(i => ({
        field: i.path.join('.'),
        message: i.message
      }))
      return next(new ValidationError('Dados invalidos', details))
    }
    req.body = result.data // sobrescreve com dado sanitizado
    next()
  }

---

REQUEST ID PARA RASTREABILIDADE

  const { v4: uuidv4 } = require('uuid')

  app.use((req, res, next) => {
    req.requestId = req.headers['x-request-id'] || uuidv4()
    res.set('X-Request-ID', req.requestId)
    next()
  })

  // Usar no logger e no error handler
  logger.info({ requestId: req.requestId, method: req.method, url: req.url })

---

CHECKLIST

- [ ] Ordem de middlewares: helmet → cors → rate-limit → body-parser → rotas → 404 → errorHandler
- [ ] helmet() configurado (nao apenas `app.use(helmet())` default em producao)
- [ ] CORS com lista de origens explicita, nao `origin: '*'`
- [ ] Rate limiting em rotas de autenticacao e globalmente
- [ ] express-async-errors instalado ou try/catch em todos os controllers async
- [ ] Validacao de input com schema (Zod, Joi, Yup) antes de processar
- [ ] X-Request-ID propagado nos logs e na resposta
- [ ] Limite de tamanho de body configurado (padrao 100kb e pequeno demais para uploads)

