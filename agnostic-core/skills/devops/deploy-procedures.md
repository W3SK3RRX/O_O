Procedimentos de Deploy

Workflow completo de deploy: selecao de plataforma, estrategias, rollback e emergencia.
Complementa o pre-deploy-checklist.md com a metodologia completa.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

SELECAO DE PLATAFORMA

Tipo de projeto → Plataformas recomendadas

  Site estatico / SPA
    → Vercel, Netlify, Cloudflare Pages
    Vantagem: deploy automatico via Git, CDN global, zero config
    Quando: sites sem backend, SPAs, blogs estaticos

  App web simples (API + DB)
    → Railway, Render, Fly.io
    Vantagem: deploy simples, banco incluso, preco previsivel
    Quando: MVPs, side projects, apps com 1-2 servicos

  App com requisitos especificos
    → VPS (DigitalOcean, Hetzner) + PM2 / Docker
    Vantagem: controle total, custo previsivel, customizacao
    Quando: compliance, regiao especifica, runtime custom

  Microservicos / escala
    → Docker + orquestrador (K8s, ECS, Nomad)
    Vantagem: escala horizontal, isolamento, deploy independente
    Quando: equipe DevOps dedicada, multiplos servicos, auto-scaling

  Event-driven / funcoes isoladas
    → Serverless (AWS Lambda, Cloud Functions, Vercel Functions)
    Vantagem: paga por uso, escala automatica, zero infra
    Quando: webhooks, processamento assincrono, APIs com trafego variavel

---

WORKFLOW DE DEPLOY EM 5 FASES

FASE 1 — PREPARAR

  - [ ] Todos os testes passando (unit + integration)
  - [ ] Build de producao sem erros e sem warnings criticos
  - [ ] Variaveis de ambiente configuradas no ambiente alvo
  - [ ] Migrations prontas e testadas em staging
  - [ ] CHANGELOG atualizado com o que muda
  - [ ] Versao tagueada no Git (semver)

FASE 2 — BACKUP

  - [ ] Snapshot/dump do banco de dados de producao
  - [ ] Tag da versao atualmente em producao (para rollback)
  - [ ] Verificar que o backup e restauravel (testar periodicamente)

FASE 3 — DEPLOY

  - [ ] Executar deploy para o ambiente alvo
  - [ ] Aguardar confirmacao de build success na plataforma
  - [ ] Verificar logs de startup (sem erros, conexoes OK)
  - [ ] Migrations executadas com sucesso

FASE 4 — VERIFICAR

  Imediato (0-5 min):
    - [ ] Health check endpoint respondendo 200
    - [ ] Smoke test: login + fluxo critico do usuario
    - [ ] Taxa de erros nao aumentou vs baseline
    - [ ] Tempo de resposta p95 dentro do SLA

  Curto prazo (5-60 min):
    - [ ] Metricas de negocio (conversoes, cadastros) estaveis
    - [ ] Logs sem erros novos
    - [ ] Alertas de monitoring nao dispararam

  Dia seguinte:
    - [ ] Trends de performance estaveis
    - [ ] Feedback de usuarios (se aplicavel)

FASE 5 — CONFIRMAR OU ROLLBACK

  Se tudo OK:
    - Confirmar deploy (remover tag de canary se aplicavel)
    - Notificar equipe ("Deploy v1.2.3 em producao — OK")
    - Atualizar status page se houver

  Se problemas:
    - Rollback imediato para versao anterior (tag)
    - Notificar equipe com descricao do problema
    - Investigar em ambiente isolado (nao em producao)
    - Corrigir, testar, fazer novo deploy com checklist completo

---

ESTRATEGIAS DE DEPLOY

Rolling Deploy
  Substitui instancias gradualmente, uma por uma.
  Pro: simples, suportado por maioria das plataformas
  Contra: durante a transicao, versoes coexistem
  Quando: apps stateless, mudancas backwards-compatible

Blue-Green Deploy
  Mantem dois ambientes identicos; troca trafego instantaneamente.
  Pro: rollback instantaneo (volta para o ambiente anterior)
  Contra: custo dobrado de infraestrutura durante deploy
  Quando: zero-downtime critico, mudancas grandes

Canary Deploy
  Envia % pequeno de trafego para a nova versao; monitora; expande gradualmente.
  Pro: risco minimizado, validacao em trafego real
  Contra: complexidade de roteamento, precisa de monitoring robusto
  Quando: mudancas de alto risco, muitos usuarios

---

QUANDO FAZER ROLLBACK

Rollback imediato (nao espere):
  - Health check falhando (servico fora do ar)
  - Erros em fluxo de pagamento ou autenticacao
  - Degradacao de performance > 50% do baseline
  - Dados sendo corrompidos

Investigar antes de rollback:
  - Erros em fluxos secundarios (nao-criticos)
  - Degradacao de performance < 50%
  - Warnings novos sem impacto visivel ao usuario

---

PROCEDIMENTOS DE EMERGENCIA

Producao fora do ar:
  1. Comunicar equipe no canal de incidentes
  2. Rollback para ultima versao estavel
  3. Verificar que o rollback restaurou o servico
  4. Investigar root cause em staging/local
  5. Corrigir, testar, deploy novamente com checklist
  6. Post-mortem: o que aconteceu, como prevenir

---

ANTI-PATTERNS DE DEPLOY

  ✗ Deploy na sexta a noite (sem equipe para acompanhar)
  ✗ Deploy direto em producao sem staging
  ✗ Deploy sem backup recente do banco
  ✗ Deploy sem monitoring/alertas configurados
  ✗ "Correcao rapida" sem passar pelo checklist
  ✗ Rollback manual improvisado (ter procedimento documentado)
  ✗ Ignorar janela de verificacao pos-deploy
  ✗ Fazer deploy e sair (acompanhar por pelo menos 15min)

---

SKILLS A CONSULTAR

  skills/devops/pre-deploy-checklist.md    Checklist complementar
  skills/performance/load-testing.md       Testes de carga antes de deploy
  skills/testing/integration-testing.md    Testes de integracao
