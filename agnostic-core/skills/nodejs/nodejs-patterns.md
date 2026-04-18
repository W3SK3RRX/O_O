Node.js Patterns

Objetivo: Estruturar aplicacoes Node.js com padroes de producao: organizacao de projeto, validacao de ambiente, graceful shutdown e tratamento de erros nao capturados.

---

ESTRUTURA DE PROJETO (MVC)

  src/
  ├── app.js              → configuracao do Express (middlewares, rotas)
  ├── server.js           → entry point: conecta DB e inicia servidor
  ├── routes/             → definicao de rotas (apenas roteamento)
  ├── controllers/        → orquestra request → service → response
  ├── services/           → logica de negocio (sem Express)
  ├── models/             → schemas e acesso ao banco
  ├── middleware/         → authenticate, errorHandler, rateLimiter, etc.
  ├── utils/              → helpers puros sem estado (formatters, validators)
  └── config/             → configuracoes carregadas do ambiente

  tests/
  ├── unit/               → testes de services e utils
  └── integration/        → testes de API (Supertest)

Separar app.js de server.js:
  // app.js — exporta o app sem iniciar o servidor
  const express = require('express')
  const app = express()
  // middlewares, rotas...
  module.exports = app

  // server.js — conecta e inicia
  const app = require('./app')
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`))
  })

Por que: permite importar app.js nos testes sem iniciar servidor/conexao de banco.

---

VALIDACAO DE VARIAVEIS DE AMBIENTE

Validar no startup — falha rapida e explicita:

  // config/env.js (usando Zod)
  const { z } = require('zod')

  const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default('24h'),
  })

  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Variaveis de ambiente invalidas:', parsed.error.format())
    process.exit(1)
  }

  module.exports = parsed.data

Alternativa simples (sem Zod):
  const required = ['DATABASE_URL', 'JWT_SECRET']
  const missing = required.filter(k => !process.env[k])
  if (missing.length) {
    console.error(`Variaveis ausentes: ${missing.join(', ')}`)
    process.exit(1)
  }

---

GRACEFUL SHUTDOWN

Fechar conexoes ao desligar o processo — nao matar requests em andamento:

  // server.js
  const server = app.listen(PORT)

  const shutdown = async (signal) => {
    console.log(`${signal} recebido. Encerrando gracefully...`)

    server.close(async () => {
      await mongoose.connection.close()
      await redisClient.quit()
      console.log('Conexoes encerradas. Processo finalizado.')
      process.exit(0)
    })

    // Timeout de seguranca: forcar encerramento apos 10s
    setTimeout(() => {
      console.error('Forcando encerramento (timeout de 10s)')
      process.exit(1)
    }, 10_000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM')) // Kubernetes, Docker stop
  process.on('SIGINT', () => shutdown('SIGINT'))   // Ctrl+C local

---

ERROS NAO CAPTURADOS

  // Previne crash silencioso em Promises sem .catch()
  process.on('unhandledRejection', (reason, promise) => {
    logger.error({ reason }, 'unhandledRejection')
    // Em producao: alertar time, nao necessariamente crashar
  })

  // Previne crash em erros sincronos nao tratados
  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException')
    // SEMPRE crashar aqui — estado do processo e indeterminado
    process.exit(1)
  })

---

CONNECTION POOLING (MongoDB / PostgreSQL)

MongoDB (Mongoose):
  await mongoose.connect(process.env.DATABASE_URL, {
    maxPoolSize: 10,          // max conexoes simultaneas
    minPoolSize: 2,           // conexoes minimas mantidas
    socketTimeoutMS: 30_000,  // timeout de operacao
    serverSelectionTimeoutMS: 5_000, // timeout para encontrar servidor
  })

PostgreSQL (pg / node-postgres):
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  })

Regras:
- [ ] Pool size = (numero de CPUs * 2) + numero de discos (regra pratica)
- [ ] Timeout de conexao < timeout de request do cliente
- [ ] Monitorar conexoes abertas em producao (metric: db.connections.active)

---

LOGGING ESTRUTURADO

  // Usar pino (mais rapido) ou winston
  const pino = require('pino')

  const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: ['req.headers.authorization', 'body.password'], // nunca logar senhas
  })

  // Nos controllers/services:
  logger.info({ userId, action: 'login' }, 'Login bem-sucedido')
  logger.warn({ ip, attempts }, 'Tentativas de login excedidas')
  logger.error({ err, requestId }, 'Erro ao processar pagamento')

Regras:
- [ ] Log estruturado (JSON) em producao — nao usar console.log
- [ ] Incluir requestId em todos os logs de request
- [ ] Nunca logar senhas, tokens ou dados de cartao
- [ ] Nivel `info` por padrao — `debug` apenas em desenvolvimento

---

CHECKLIST

- [ ] app.js separado de server.js (testabilidade)
- [ ] Variaveis de ambiente validadas no startup
- [ ] Graceful shutdown implementado (SIGTERM + SIGINT)
- [ ] unhandledRejection e uncaughtException tratados
- [ ] Connection pooling configurado com timeouts
- [ ] Logging estruturado (nao console.log) em producao
