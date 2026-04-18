---
name: observabilidade
description: 'Observabilidade: logs estruturados, metricas RED/USE, tracing, alertas'
---

LOGGING ESTRUTURADO

- [ ] Logs em JSON — nunca texto livre em producao
- [ ] Campos obrigatorios: timestamp (ISO 8601), level, message, service, traceId
- [ ] Niveis usados corretamente:
  - ERROR: falha que impacta o usuario ou perde dados
  - WARN: situacao inesperada mas recuperavel
  - INFO: eventos de negocio relevantes (usuario criado, pagamento processado)
  - DEBUG: detalhes tecnicos (apenas em dev ou habilitado sob demanda)
- [ ] Nunca logar: senhas, tokens, dados pessoais (PII), numeros de cartao
- [ ] Contexto suficiente para reproduzir o problema sem acessar o codigo
- [ ] Log no ponto da decisao, nao no chamador

  Bom:  {"level":"error","message":"payment_failed","userId":"abc","reason":"insufficient_funds","traceId":"xyz"}
  Ruim: console.log("erro no pagamento")

---

METRICAS

Metodo RED (para servicos — o que os usuarios percebem):
- [ ] Rate: requisicoes por segundo
- [ ] Errors: taxa de erros (% de respostas 5xx ou falhas)
- [ ] Duration: latencia (p50, p95, p99)

Metodo USE (para infraestrutura — o que os recursos suportam):
- [ ] Utilization: % de uso (CPU, memoria, disco, conexoes de pool)
- [ ] Saturation: fila de espera (requests enfileiradas, threads bloqueadas)
- [ ] Errors: erros de recurso (OOM, disco cheio, timeout de conexao)

SLIs e SLOs:
- [ ] SLI (Service Level Indicator): metrica que reflete a experiencia do usuario (ex: latencia p99 < 200ms)
- [ ] SLO (Service Level Objective): alvo para o SLI (ex: 99.9% das requisicoes abaixo de 200ms no mes)
- [ ] Error budget: margem de erro aceitavel antes de pausar deploys (100% - SLO)

---

TRACING DISTRIBUIDO

- [ ] Trace ID propagado em todos os servicos (via header, ex: traceparent)
- [ ] Cada operacao significativa gera um span (chamada HTTP, query ao banco, chamada a servico externo)
- [ ] Spans incluem: nome da operacao, duracao, status (ok/error), atributos relevantes
- [ ] Sampling configurado para volumes altos (nao tracear 100% em producao)
- [ ] Traces conectados aos logs via traceId

Quando tracing vale o overhead:
  - Arquitetura com 3+ servicos se comunicando
  - Debugging de latencia entre servicos
  - Identificar gargalos em pipelines async

Quando nao vale:
  - Monolito simples (logs com correlation ID sao suficientes)
  - Custo de armazenamento maior que o beneficio

---

ALERTAS

- [ ] Alerta sobre sintomas (taxa de erros alta), nao causas (CPU alta pode ser normal)
- [ ] Todo alerta tem acao clara — se ninguem sabe o que fazer, nao e um bom alerta
- [ ] Severidades definidas:
  - P1/CRITICO: impacto no usuario, resposta em minutos
  - P2/ALTO: degradacao significativa, resposta em 1h
  - P3/MEDIO: anomalia sem impacto imediato, resposta no horario comercial
- [ ] Threshold com historico — alertar em desvio do baseline, nao em valor absoluto arbitrario
- [ ] Silenciar durante deploys e manutencoes planejadas

Anti-patterns de alertas:
  ✗ Alertar em cada erro individual (alert fatigue)
  ✗ Threshold sem baseline (gera falso positivo)
  ✗ Alerta sem runbook ou instrucao de acao
  ✗ Notificar todo o time em vez do on-call

---

DASHBOARDS

O que colocar no dashboard principal:
- [ ] Metricas RED do servico (rate, errors, duration)
- [ ] Status dos health checks
- [ ] Metricas de negocio criticas (cadastros, pedidos, pagamentos)
- [ ] Deploys recentes (marcadores temporais)

O que NAO colocar no dashboard principal:
  - Metricas de infra detalhadas (criar dashboard separado)
  - Graficos sem contexto (sem titulo, sem unidade, sem baseline)
  - Metricas que ninguem olha (revisar dashboards trimestralmente)

---

CHECKLIST DE OBSERVABILIDADE

- [ ] Logs estruturados em JSON com campos padronizados
- [ ] Correlation ID propagado entre servicos
- [ ] Metricas RED implementadas para cada servico
- [ ] SLIs e SLOs definidos para fluxos criticos
- [ ] Alertas configurados com severidade e runbook
- [ ] Dashboard principal com visao geral do sistema
- [ ] PII nunca presente em logs ou traces
- [ ] Sampling de traces configurado para producao
- [ ] Rotacao e retencao de logs definida (ex: 30 dias)
- [ ] Equipe sabe onde olhar quando algo quebra

---

SKILLS A CONSULTAR

  skills/devops/deploy-procedures.md        Workflow de deploy e verificacao pos-deploy
  skills/devops/pre-deploy-checklist.md     Checklist de pre-deploy
  skills/performance/performance-audit.md   Auditoria de performance (N+1, indices, caching)
  skills/backend/error-handling.md          Hierarquia de erros e log levels

