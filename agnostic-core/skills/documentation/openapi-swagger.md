OpenAPI / Swagger

Objetivo: Documentar APIs REST com OpenAPI 3.1 de forma precisa, automaticamente validada e sempre sincronizada com o codigo.

---

ESTRUTURA BASICA

  openapi: '3.1.0'
  info:
    title: API do Projeto
    version: '1.0.0'
    description: Descricao publica da API

  servers:
    - url: https://api.example.com/v1
      description: Producao
    - url: http://localhost:3000/v1
      description: Desenvolvimento

  paths:
    /users/{id}:
      get:
        summary: Buscar usuario por ID
        operationId: getUserById
        tags: [Users]
        parameters:
          - name: id
            in: path
            required: true
            schema:
              type: string
              format: uuid
        responses:
          '200':
            description: Usuario encontrado
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/User'
          '404':
            $ref: '#/components/responses/NotFound'

---

SCHEMAS REUTILIZAVEIS

Defina schemas em `components/schemas` e referencie com `$ref`:

  components:
    schemas:
      User:
        type: object
        required: [id, email, createdAt]
        properties:
          id:
            type: string
            format: uuid
            example: '550e8400-e29b-41d4-a716-446655440000'
          email:
            type: string
            format: email
            example: 'user@example.com'
          createdAt:
            type: string
            format: date-time
            example: '2024-01-15T10:30:00Z'

      ErrorResponse:
        type: object
        required: [error]
        properties:
          error:
            type: object
            required: [code, message]
            properties:
              code:
                type: string
                example: 'NOT_FOUND'
              message:
                type: string
                example: 'Usuario nao encontrado'
              details:
                type: array
                items:
                  type: object
                  properties:
                    field: { type: string }
                    message: { type: string }

    responses:
      NotFound:
        description: Recurso nao encontrado
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'
      Unauthorized:
        description: Nao autenticado
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'

---

AUTENTICACAO

  components:
    securitySchemes:
      BearerAuth:
        type: http
        scheme: bearer
        bearerFormat: JWT

  # Aplicar globalmente:
  security:
    - BearerAuth: []

  # Ou por rota (sobrescreve o global):
  paths:
    /auth/login:
      post:
        security: []  # rota publica, sem autenticacao

---

PARAMETROS COMUNS

  components:
    parameters:
      PageParam:
        name: page
        in: query
        schema:
          type: integer
          minimum: 1
          default: 1
      PageSizeParam:
        name: pageSize
        in: query
        schema:
          type: integer
          minimum: 1
          maximum: 100
          default: 20

  # Usar em rotas de listagem:
  parameters:
    - $ref: '#/components/parameters/PageParam'
    - $ref: '#/components/parameters/PageSizeParam'

---

GERACAO AUTOMATICA (Node.js / Express)

Opcao 1 — swagger-jsdoc (anotacoes no codigo):
  npm install swagger-jsdoc swagger-ui-express

  /**
   * @openapi
   * /users/{id}:
   *   get:
   *     summary: Buscar usuario
   *     tags: [Users]
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   */
  router.get('/:id', getUserById)

Opcao 2 — arquivo YAML/JSON separado (recomendado para APIs maiores):
  Manter `docs/openapi.yaml` como fonte de verdade.
  Servir via endpoint: GET /docs → swagger-ui-express

Opcao 3 — geracao a partir de tipos (TypeScript):
  tsoa, nestjs-swagger, fastify-swagger

---

VALIDACAO NO CI

- [ ] Instalar Redocly CLI: `npm install -g @redocly/cli`
- [ ] Lint do schema: `redocly lint docs/openapi.yaml`
- [ ] Verificar que todos os responses documentados estao implementados
- [ ] Adicionar ao pipeline de CI como step obrigatorio

  # .github/workflows/ci.yml
  - name: Validar OpenAPI
    run: redocly lint docs/openapi.yaml

---

FERRAMENTAS

| Ferramenta | Uso |
|---|---|
| Redocly CLI | Lint, bundle e preview do schema |
| Swagger UI | Interface visual interativa para testar |
| Stoplight Studio | Editor visual para criar/editar schema |
| Prism | Mock server a partir do schema OpenAPI |
| openapi-typescript | Gerar types TypeScript a partir do schema |
| schemathesis | Testes automaticos gerados do schema |

---

CHECKLIST

- [ ] Toda rota nova tem entrada no schema antes de implementar (design-first)
- [ ] Todos os status codes possiveis documentados (sucesso e erro)
- [ ] Schemas de request e response com exemplos reais
- [ ] Autenticacao documentada com securitySchemes
- [ ] `redocly lint` passa no CI sem warnings
- [ ] Endpoint `/docs` disponivel em desenvolvimento e staging
- [ ] Schema versionado junto com o codigo (nao gerado e ignorado)
