REST API Design

Objetivo: Projetar APIs REST consistentes, predicaveis e faceis de consumir seguindo convencoes amplamente adotadas.

---

NOMENCLATURA DE RECURSOS

- [ ] Substantivos no plural para colecoes: `/users`, `/orders`, `/products`
- [ ] Sem verbos na URL — o metodo HTTP define a acao
- [ ] Hierarquia reflete relacao real: `/users/{id}/orders` (pedidos de um usuario)
- [ ] Profundidade maxima de 3 niveis: `/users/{id}/orders/{orderId}`
- [ ] kebab-case para recursos multi-palavra: `/payment-methods`, `/order-items`
- [ ] Sem extensoes de arquivo na URL (`.json`, `.xml`)

  Bom:  GET /users/42/orders
  Ruim: GET /getOrdersForUser/42
  Ruim: GET /users/42/getOrders

---

METODOS HTTP

| Metodo | Semantica | Idempotente | Corpo |
|---|---|---|---|
| GET | Ler recurso ou colecao | Sim | Nao |
| POST | Criar novo recurso | Nao | Sim |
| PUT | Substituir recurso completo | Sim | Sim |
| PATCH | Atualizar campos especificos | Nao (idealmente sim) | Sim |
| DELETE | Remover recurso | Sim | Opcional |

- [ ] GET nunca tem efeito colateral
- [ ] POST nao e idempotente — retornar 409 se recurso ja existe, nao criar duplicata
- [ ] PUT requer corpo completo do recurso
- [ ] PATCH aceita apenas os campos a alterar

---

STATUS CODES

Sucesso:
- [ ] 200 OK — GET, PUT, PATCH com resposta
- [ ] 201 Created — POST que criou recurso (incluir Location header com URL do novo recurso)
- [ ] 204 No Content — DELETE, ou operacao sem corpo de resposta
- [ ] 202 Accepted — operacao async iniciada (processar em background)

Erros do cliente (4xx):
- [ ] 400 Bad Request — input invalido (corpo malformado, campo obrigatorio ausente)
- [ ] 401 Unauthorized — sem autenticacao ou token invalido
- [ ] 403 Forbidden — autenticado mas sem permissao
- [ ] 404 Not Found — recurso nao existe
- [ ] 409 Conflict — conflito de estado (ex: email ja cadastrado)
- [ ] 422 Unprocessable Entity — sintaxe valida mas semantica invalida (ex: data no passado)
- [ ] 429 Too Many Requests — rate limit atingido (incluir Retry-After header)

Erros do servidor (5xx):
- [ ] 500 Internal Server Error — erro inesperado (nao expor detalhes internos)
- [ ] 503 Service Unavailable — servico temporariamente indisponivel

---

ESTRUTURA DE RESPOSTA

Padrao para recursos singulares:
  {
    "id": "uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00Z"
  }

Padrao para colecoes paginadas:
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }

Padrao de erro:
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Email invalido",
      "details": [
        { "field": "email", "message": "Formato invalido" }
      ]
    }
  }

Regras:
- [ ] Datas sempre em ISO 8601 com timezone: `2024-01-15T10:30:00Z`
- [ ] IDs como strings (UUID ou ULID) — nao expor IDs numericos sequenciais de banco
- [ ] Campos em camelCase no JSON
- [ ] Nunca retornar `null` em colecoes — retornar array vazio `[]`
- [ ] Nunca retornar campos sensiveis: passwordHash, tokens internos, dados de infra

---

PAGINACAO

Cursor-based (recomendado para grandes volumes):
  GET /orders?cursor=eyJpZCI6MTAwfQ&limit=20

Offset-based (simples, adequado para volumes pequenos):
  GET /orders?page=2&pageSize=20

- [ ] Limite maximo por pagina: definir e documentar (ex: max 100)
- [ ] Limite padrao quando nao informado (ex: 20)
- [ ] Incluir total de registros na resposta

---

VERSIONAMENTO

Header (recomendado para APIs com clientes externos):
  Accept: application/vnd.api+json; version=2

URL (mais visivel, mais facil de testar):
  /v1/users
  /v2/users

- [ ] Definir politica de deprecacao antes de v1 (ex: 6 meses de suporte por versao)
- [ ] Documentar breaking changes entre versoes
- [ ] Nunca remover campo sem deprecar na versao anterior

---

FILTROS E ORDENACAO

  GET /products?category=electronics&minPrice=100&maxPrice=500
  GET /users?sort=createdAt:desc,name:asc
  GET /orders?status=pending&createdAfter=2024-01-01

- [ ] Filtros via query string, nao no corpo do GET
- [ ] Campos de filtro documentados explicitamente
- [ ] Inputs de filtro validados e sanitizados antes de usar em queries

---

HEADERS OBRIGATORIOS

Request:
- [ ] Content-Type: application/json (em POST, PUT, PATCH)
- [ ] Authorization: Bearer {token} (em rotas protegidas)

Response:
- [ ] Content-Type: application/json
- [ ] X-Request-ID: {uuid} (para rastreabilidade de logs)
- [ ] Location: /resources/{id} (em respostas 201)
- [ ] Retry-After: {segundos} (em respostas 429)

---

CHECKLIST DE DESIGN

- [ ] Toda rota documentada em OpenAPI/Swagger antes de implementar
- [ ] Status codes corretos para todos os cenarios (feliz e erro)
- [ ] IDs de banco nao expostos diretamente
- [ ] Respostas de erro seguem estrutura padrao
- [ ] Paginacao implementada em todas as colecoes
- [ ] Rate limiting configurado por rota ou por autenticado/anonimo
