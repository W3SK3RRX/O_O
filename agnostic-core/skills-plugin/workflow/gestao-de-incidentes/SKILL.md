---
name: gestao-de-incidentes
description: 'Resposta estruturada a incidentes em producao: severidade, resposta, postmortem'
---

RESPOSTA

Papeis durante o incidente:
- [ ] Incident Commander (IC): coordena a resposta, toma decisoes, comunica status
- [ ] Investigador(es): diagnosticam e aplicam fix
- [ ] Comunicador: atualiza stakeholders e status page (pode ser o IC em times pequenos)

Primeiros 15 minutos (SEV1/SEV2):
  1. Confirmar o incidente (nao e falso positivo?)
  2. Abrir canal de comunicacao dedicado (Slack channel, call)
  3. Definir IC
  4. Avaliar: rollback resolve? Se sim, fazer rollback imediato
  5. Comunicar: "Estamos cientes e investigando"

- [ ] IC nao investiga — coordena. Se esta debugando, nao esta coordenando
- [ ] Decisoes documentadas em tempo real no canal do incidente
- [ ] Timeline sendo registrada desde o inicio (quando detectado, quando comunicado, quando resolvido)

---

DIAGNOSTICO

- [ ] Verificar mudancas recentes: deploy, config change, migration, dependencia atualizada
- [ ] Correlacionar com metricas: quando comecou? Coincide com algum evento?
- [ ] Checklist de triage:
  - Health checks dos servicos
  - Logs de erro (filtrar por traceId se disponivel)
  - Metricas de infra (CPU, memoria, disco, conexoes)
  - Dependencias externas (API de terceiros, banco, cache)
- [ ] Investigar com seguranca — nao executar queries pesadas em producao sob pressao
- [ ] Testar hipoteses uma por vez — nao mudar 3 coisas ao mesmo tempo

---

COMUNICACAO

Interna:
- [ ] Atualizacoes a cada 30 minutos durante SEV1/SEV2 (mesmo que nao haja novidade)
- [ ] Formato: "Status: [investigando|mitigando|resolvido]. Impacto: [quem/o que]. Proxima atualizacao: [horario]"
- [ ] Escalar para lideranca se impacto financeiro ou de reputacao

Externa (status page / clientes):
- [ ] Comunicar que ha impacto sem prometer prazo de resolucao
- [ ] Atualizar quando houver progresso ou resolucao
- [ ] Linguagem clara e sem jargao tecnico
- [ ] Nunca culpar terceiros publicamente

  Bom:  "Identificamos intermitencia no processamento de pagamentos. Estamos trabalhando na resolucao."
  Ruim: "O provedor de cloud caiu e nao temos previsao."

---

POST-MORTEM

- [ ] Realizar para todo SEV1 e SEV2 (ate 5 dias uteis apos o incidente)
- [ ] Formato blameless — foco em sistemas e processos, nao em pessoas
- [ ] Estrutura:

  Titulo: [descricao curta do incidente]
  Data: YYYY-MM-DD
  Severidade: SEV1/SEV2/SEV3
  Duracao: [tempo de deteccao ate resolucao]
  Impacto: [quem foi afetado, quantos usuarios, quanto tempo]

  Timeline:
    HH:MM — [evento]
    HH:MM — [acao tomada]
    HH:MM — [resolucao]

  Root Cause:
    [causa raiz tecnica]

  Fatores contribuintes:
    - [fator 1]
    - [fator 2]

  O que funcionou bem:
    - [ponto positivo]

  Action items:
    - [ ] [acao] — responsavel — prazo
    - [ ] [acao] — responsavel — prazo

- [ ] Action items rastreados e cobrados (nao apenas documentados)
- [ ] Post-mortem compartilhado com toda a engenharia (cultura de aprendizado)

---

ON-CALL

- [ ] Rotacao definida (semanal ou bi-semanal) com calendario visivel
- [ ] Runbooks atualizados para cenarios comuns (servico X fora do ar → passos 1, 2, 3)
- [ ] Acesso necessario pre-configurado (VPN, dashboards, permissoes)
- [ ] Compensacao por on-call (folga, pagamento extra, ou equivalente)
- [ ] Maximo de alertas acionaveis por noite — se muitos, resolver a causa
- [ ] Handoff formal: "Nada pendente" ou "Incidente X em andamento, status Y"
- [ ] Retrospectiva mensal de on-call: quantos alertas, quantos falsos, carga justa?

---

ANTI-PATTERNS

  ✗ Culpar individuos ("fulano fez deploy errado")
  ✗ Pular post-mortem ("ja resolveu, bola pra frente")
  ✗ Hero culture (uma pessoa resolve tudo — cria ponto unico de falha)
  ✗ Action items sem dono e sem prazo (nunca sao feitos)
  ✗ Alertas que ninguem olha (desensibiliza o time)
  ✗ On-call sem runbook (pessoa acorda as 3h e nao sabe por onde comecar)
  ✗ Comunicacao tardia ("por que os clientes souberam antes de nos?")

---

CHECKLIST DE GESTAO DE INCIDENTES

- [ ] Severidades definidas com exemplos e tempos de resposta
- [ ] Processo de resposta documentado e conhecido pelo time
- [ ] Canal de incidentes definido (Slack, Teams, call bridge)
- [ ] Runbooks para cenarios mais comuns
- [ ] Rotacao de on-call justa e com compensacao
- [ ] Template de post-mortem disponivel
- [ ] Action items de post-mortems rastreados
- [ ] Metricas: MTTD (tempo de deteccao), MTTR (tempo de resolucao)

---

SKILLS A CONSULTAR

  skills/devops/deploy-procedures.md        Procedimentos de deploy e rollback
  skills/devops/observabilidade.md          Observabilidade (logs, metricas, alertas)
  skills/devops/pre-deploy-checklist.md     Checklist de pre-deploy
  skills/workflow/context-management.md     Gestao de contexto (handover entre pessoas)

