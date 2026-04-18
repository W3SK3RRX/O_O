Load Testing

Objetivo: Validar que a API suporta a carga esperada com latencia aceitavel antes de ir a producao ou escalar.

---

TIPOS DE TESTE

  Smoke Test (baseline):
  Carga minima (1-5 usuarios). Verifica que a aplicacao funciona sob carga zero.
  Quando: sempre, antes de qualquer outro tipo de teste.
  Duracao: 1-2 minutos.

  Load Test (carga normal):
  Simula o uso esperado em producao (usuarios simultaneos medios).
  Quando: antes de cada release importante, apos mudancas de performance.
  Duracao: 10-30 minutos.

  Stress Test (carga maxima):
  Aumenta carga progressivamente ate o sistema falhar ou degradar.
  Objetivo: descobrir o ponto de ruptura e como o sistema falha (graceful vs crash).
  Duracao: 20-60 minutos.

  Spike Test (pico repentino):
  Aumento brusco de carga em segundos, depois queda. Simula campanhas, eventos virais.
  Quando: antes de lancamentos com marketing ou eventos previstos.

  Soak Test (duracao longa):
  Carga normal por horas ou dias. Detecta memory leaks, degradacao progressiva, connection pool exhaustion.
  Quando: antes de releases maiores, trimestral em producao.
  Duracao: 4-24 horas.

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
