Integration Testing

Objetivo: Testar o comportamento de modulos integrados (API + banco, service + cache, etc.) em ambiente isolado e reproduzivel.

---

PRINCIPIOS

- [ ] Testes de integracao testam o contrato entre modulos, nao a implementacao interna
- [ ] Cada suite tem seu proprio banco/estado — sem compartilhar estado entre suites
- [ ] Dados de teste criados e destruidos pelo proprio teste (sem fixtures globais mutaveis)
- [ ] Determinismo: resultado identico a cada execucao, independente de ordem

Diferenca de escopo:
  Unitario    → funcao isolada com dependencias mockadas
  Integracao  → modulos reais integrados (DB real, HTTP real)
  E2E         → fluxo completo como usuario final (browser, app, etc.)

---

BANCO DE DADOS ISOLADO

Opcao 1 — banco em memoria (mais rapido):
  MongoDB: mongodb-memory-server
  SQLite: em memoria como substituto de PostgreSQL (limitado)
  Redis: ioredis-mock ou redis-memory-server

Opcao 2 — banco real em Docker (mais fiel):
  Usar Testcontainers para subir container por suite:
  const { MongoDBContainer } = require('@testcontainers/mongodb')
  const container = await new MongoDBContainer().start()

Opcao 3 — banco dedicado de testes:
  Banco separado configurado via TEST_DATABASE_URL
  Resetar schema antes de cada execucao

Setup e teardown:
  beforeAll(async () => {
    await mongoose.connect(testUri)
    await runMigrations()
  })

  afterEach(async () => {
    await clearAllCollections() // limpar entre testes
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await container.stop()
  })

---

TESTES DE API (HTTP)

Usar Supertest (Node.js) ou TestClient (FastAPI/Django):
  const request = require('supertest')
  const app = require('../app')

  describe('POST /auth/login', () => {
    it('deve retornar 200 e JWT para credenciais validas', async () => {
      // Arrange
      await createUser({ email: 'test@test.com', password: 'senha123' })

      // Act
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'senha123' })

      // Assert
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
    })

    it('deve retornar 401 para senha incorreta', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@test.com', password: 'errada' })

      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
    })
  })

Cobrir obrigatoriamente:
- [ ] Caminho feliz (status 2xx + corpo correto)
- [ ] Autenticacao: sem token (401), token expirado (401), sem permissao (403)
- [ ] Validacao: campo obrigatorio ausente (400), formato invalido (422)
- [ ] Idempotencia: POST duplicado (409), DELETE ja deletado (404 ou 204)

---

GERENCIAMENTO DE DADOS DE TESTE

Padrao Factory:
  // factories/userFactory.js
  const createUser = async (overrides = {}) => {
    return User.create({
      email: `test-${Date.now()}@example.com`,
      password: await bcrypt.hash('senha123', 10),
      ...overrides
    })
  }

Regras:
- [ ] Cada teste cria seus proprios dados (nao depende de dados de outro teste)
- [ ] Dados com valores unicos por execucao (ex: email com timestamp) para evitar conflitos
- [ ] Factories com valores defaults uteis, sobrepostos por overrides
- [ ] Nao usar dados de producao em testes (LGPD/GDPR)

---

TESTES DE CONTRATO

Para APIs consumidas por outros times ou clientes externos:

- [ ] Documentar schema esperado em OpenAPI antes de testar
- [ ] Testar que a resposta valida contra o schema (Ajv, Zod, pydantic)
- [ ] Testar campos obrigatorios e tipos de dado
- [ ] Versionar schema de contrato junto com os testes

  const validate = ajv.compile(userSchema)
  it('deve retornar usuario conforme schema', async () => {
    const res = await request(app).get('/users/1').set('Authorization', `Bearer ${token}`)
    expect(validate(res.body)).toBe(true)
  })

---

VARIAVEIS DE AMBIENTE

- [ ] Arquivo `.env.test` separado de `.env.development` e `.env.production`
- [ ] Nunca rodar testes de integracao apontando para banco de producao
- [ ] CI/CD usa variaveis de ambiente injetadas — nao commitar `.env.test` com credenciais reais

  # .env.test
  NODE_ENV=test
  DATABASE_URL=mongodb://localhost:27017/myapp_test
  JWT_SECRET=test-secret-only-for-tests

---

PERFORMANCE DE SUITE

- [ ] Rodar suites em paralelo quando possivel (bancos independentes)
- [ ] Evitar sleep() fixo — usar polling ou eventos para esperar estado assincrono
- [ ] Timeout adequado por tipo de operacao: DB local (2s), HTTP externo mockado (5s)
- [ ] Coverage de integracao separado do coverage unitario no CI

---

CHECKLIST PRE-MERGE

- [ ] Suite passa sem falhas em ambiente limpo (nao apenas na maquina local)
- [ ] Sem dependencia de ordem entre testes
- [ ] Dados criados pelo teste sao destruidos apos a execucao
- [ ] Sem acesso a banco, API ou servico de producao
- [ ] CI executa os testes de integracao em cada PR
