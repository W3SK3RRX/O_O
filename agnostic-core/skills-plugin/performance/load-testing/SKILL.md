---
name: load-testing
description: 'Tipos de teste, SLA (p95/p99), k6, Artillery, analise de resultados'
---

METRICAS SLA

Definir e documentar antes de rodar o teste:

  Throughput (requisicoes por segundo):
  - Meta: X req/s sem erros
  - Aceitavel: Y req/s com taxa de erro < 1%

  Latencia (percentis):
  - p50 (mediana): < 100ms
  - p95: < 300ms (95% das requests abaixo deste valor)
  - p99: < 1000ms (99% das requests abaixo deste valor)
  - Nao usar media — ela mascara outliers criticos

  Taxa de erros:
  - Aceitavel: < 1% em carga normal
  - Inaceitavel: qualquer erro 5xx em smoke test

---

K6 (recomendado — JavaScript, open source)

Instalar: https://k6.io/docs/getting-started/installation/

Script basico:
  // tests/load/auth-load.js
  import http from 'k6/http'
  import { check, sleep } from 'k6'

  export const options = {
    stages: [
      { duration: '2m', target: 10 },   // ramp-up
      { duration: '5m', target: 10 },   // carga sustentada
      { duration: '2m', target: 0 },    // ramp-down
    ],
    thresholds: {
      http_req_duration: ['p(95)<300'],  // 95% abaixo de 300ms
      http_req_failed: ['rate<0.01'],    // menos de 1% de erros
    },
  }

  export default function () {
    const res = http.post('http://localhost:3000/auth/login', JSON.stringify({
      email: 'loadtest@example.com',
      password: 'senha123',
    }), { headers: { 'Content-Type': 'application/json' } })

    check(res, {
      'status 200': (r) => r.status === 200,
      'tem token': (r) => r.json('token') !== undefined,
    })

    sleep(1) // pausa realista entre acoes do usuario
  }

Rodar: `k6 run tests/load/auth-load.js`

---

ARTILLERY (alternativa — YAML, mais simples)

  config:
    target: 'http://localhost:3000'
    phases:
      - duration: 60
        arrivalRate: 10
        name: Warm up
      - duration: 300
        arrivalRate: 50
        name: Load test
    defaults:
      headers:
        Authorization: 'Bearer {{ token }}'

  scenarios:
    - name: Listar tarefas
      flow:
        - get:
            url: /tasks
            expect:
              - statusCode: 200

Rodar: `artillery run tests/load/tasks.yaml`

---

PREPARACAO DO AMBIENTE

- [ ] Ambiente de testes separado de producao
- [ ] Banco de dados populado com dados realistas (mesmo volume que producao)
- [ ] Autenticacao configurada: gerar tokens de teste com usuarios dedicados
- [ ] Monitoring ativo durante o teste (APM, logs, metricas de banco, CPU/mem)
- [ ] Baseline estabelecido antes de mudancas (para comparacao)

---

ANALISE DE RESULTADOS

Sinais de problema:
  - p99 muito maior que p95 → outliers, conexoes lentas, GC pause
  - Taxa de erro aumenta junto com a carga → connection pool esgotado, rate limit, memoria
  - Latencia cresce linearmente com carga → gargalo de CPU ou banco
  - Latencia explode em determinada carga → ponto de ruptura identificado

Proximos passos apos identificar gargalo:
  - Latencia alta em queries → verificar EXPLAIN ANALYZE, adicionar index
  - Connection pool esgotado → aumentar pool size ou adicionar cache
  - CPU maxima → escalar horizontalmente, otimizar algoritmo
  - Memory leak → analisar heap dump, revisar closures e event listeners

---

CHECKLIST

- [ ] SLA documentado (p95, p99, throughput minimo, taxa de erro aceitavel) antes de rodar
- [ ] Smoke test passando antes de qualquer outro tipo
- [ ] Dados de teste isolados (usuarios/pedidos de carga nao misturam com dados reais)
- [ ] Monitoring ativo durante os testes
- [ ] Resultados salvos e comparados com baseline anterior
- [ ] Load test no pipeline de CI para releases criticos (opcional — e lento)

