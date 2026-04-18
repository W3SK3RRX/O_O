Workflow: Deploy

Template para processo de deploy seguro e verificavel.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

QUANDO USAR

  - Deploy para staging (validacao pre-producao)
  - Deploy para producao
  - Rollback de emergencia

---

PROCESSO

SUB-WORKFLOW: PRE-FLIGHT CHECK

  Antes de qualquer deploy, verificar:

  Codigo
    - [ ] Todos os testes passando (unit + integration + E2E criticos)
    - [ ] Build de producao sem erros
    - [ ] Lint e tipagem sem erros criticos
    - [ ] Code review aprovado (se aplicavel)

  Seguranca
    - [ ] Sem secrets no codigo
    - [ ] Dependencias auditadas (npm audit / pip audit)
    - [ ] Headers de seguranca configurados

  Banco de dados
    - [ ] Migrations prontas e testadas em staging
    - [ ] Backup recente verificado
    - [ ] Estimativa de lock time para tabelas grandes

  Infra
    - [ ] Variaveis de ambiente configuradas no target
    - [ ] Monitoring e alertas configurados
    - [ ] Procedimento de rollback documentado

SUB-WORKFLOW: DEPLOY PARA STAGING

  1. Executar pre-flight check
  2. Deploy para staging
  3. Smoke test: fluxos criticos funcionam?
  4. QA/validacao manual se necessario
  5. Se OK: prosseguir para producao
  6. Se problemas: corrigir e repetir

SUB-WORKFLOW: DEPLOY PARA PRODUCAO

  1. Executar pre-flight check
  2. Backup do banco de producao
  3. Tag da versao no Git (vX.Y.Z)
  4. Deploy
  5. Verificar:
     - [ ] Health check respondendo 200
     - [ ] Smoke test: login + fluxo critico OK
     - [ ] Taxa de erros nao aumentou
     - [ ] p95 dentro do SLA
  6. Monitorar por 15 minutos
  7. Se OK: notificar equipe ("Deploy vX.Y.Z em producao — OK")
  8. Se problemas: rollback imediato

SUB-WORKFLOW: ROLLBACK

  1. Identificar versao estavel anterior (tag)
  2. Rollback do deploy (reverter para tag anterior)
  3. Se migration foi executada: executar DOWN migration
  4. Verificar health check e smoke test
  5. Notificar equipe com descricao do problema
  6. Investigar root cause em ambiente isolado
  7. Corrigir, testar, fazer novo deploy com checklist completo

---

FORMATO DE SAIDA POS-DEPLOY

  Deploy Report
    Versao: [tag/commit]
    Ambiente: [staging/producao]
    Estrategia: [rolling/blue-green/canary]
    Duracao: [tempo total]
    Health check: [OK/FALHA]
    Smoke test: [OK/FALHA — detalhes]
    Rollback necessario: [sim/nao]
    Observacoes: [notas relevantes]

---

PROMPT DE EXEMPLO

  "Preciso fazer deploy da versao [X] para [ambiente].
  Stack: [detalhes]. Banco: [tipo].
  Me guie pelo checklist e processo de deploy."

---

SKILLS A CONSULTAR

  skills/devops/pre-deploy-checklist.md   Checklist de pre-deploy
  skills/devops/deploy-procedures.md      Procedimentos detalhados
  agents/specialists/devops-engineer.md   Agent de DevOps
