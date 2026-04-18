Checklist de Validacao

Checklist consolidado para validacao de projeto antes de deploy ou entrega.
Adaptavel por stack — remova itens que nao se aplicam ao seu contexto.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

QUICK CHECK (durante desenvolvimento)

Use durante o desenvolvimento para manter qualidade continua.

  Seguranca
    - [ ] Sem secrets no codigo (API keys, senhas, tokens)
    - [ ] Dependencias auditadas (npm audit / pip audit / sem CVEs criticos)
    - [ ] Input validation em todos os endpoints publicos
    - [ ] Headers de seguranca configurados (CSP, HSTS, X-Content-Type)

  Qualidade de codigo
    - [ ] Lint passando sem erros
    - [ ] Tipagem sem erros (TypeScript strict, mypy, etc.)
    - [ ] Sem warnings criticos do compilador/bundler
    - [ ] Sem console.log / print de debug em codigo commitado

  Schema / Banco de dados
    - [ ] Migrations validas e reversiveis (UP + DOWN)
    - [ ] Constraints definidos (NOT NULL, FK, CHECK, UNIQUE)
    - [ ] Indices nas colunas usadas em WHERE/JOIN frequentes

  Testes
    - [ ] Suite de testes passando (unit + integration)
    - [ ] Coverage acima do threshold do projeto (minimo 80% business logic)
    - [ ] Nenhum teste ignorado sem justificativa (@skip com motivo)

  UX / Acessibilidade
    - [ ] WCAG 2.1 AA: contraste, teclado, ARIA labels
    - [ ] Alvos de toque >= 44px (mobile)
    - [ ] Feedback visual para acoes do usuario (loading, sucesso, erro)

---

FULL CHECK (antes de deploy)

Use antes de deploy para staging ou producao. Inclui todos os itens do Quick Check.

  Performance
    - [ ] Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
    - [ ] Bundle size dentro do budget (verificar com bundleanalyzer)
    - [ ] Lazy loading para rotas/componentes pesados
    - [ ] Imagens otimizadas (WebP/AVIF, srcset, lazy loading)
    - [ ] Sem N+1 queries (verificar com logging)

  Testes avancados
    - [ ] Testes E2E dos fluxos criticos passando (login, checkout, etc.)
    - [ ] Teste de carga se aplicavel (endpoints criticos suportam trafego esperado)

  Mobile / Responsividade
    - [ ] Layout OK em mobile (320px), tablet (768px), desktop (1280px)
    - [ ] Alvos de toque com espacamento adequado
    - [ ] Formularios com keyboard-aware scroll
    - [ ] Safe areas respeitadas (notch, home indicator)

  SEO (se aplicavel)
    - [ ] Meta tags (title, description) em todas as paginas
    - [ ] sitemap.xml e robots.txt configurados
    - [ ] Schema markup (JSON-LD) nas paginas principais
    - [ ] URLs canonicas definidas

  Infraestrutura
    - [ ] Variaveis de ambiente configuradas no ambiente alvo
    - [ ] Monitoring e alertas configurados
    - [ ] Backup do banco de dados recente e verificado
    - [ ] Procedimento de rollback documentado e testado
    - [ ] SSL/TLS configurado e valido

  Documentacao
    - [ ] README atualizado com instrucoes de setup
    - [ ] CHANGELOG atualizado com mudancas desta release
    - [ ] API documentada (OpenAPI/Swagger se aplicavel)

  i18n (se aplicavel)
    - [ ] Traducoes completas para todos os idiomas suportados
    - [ ] Formatacao de datas, numeros e moedas por locale
    - [ ] Conteudo RTL testado (se suportado)

---

COMO USAR

1. Copie os itens relevantes para o seu projeto
2. Remova o que nao se aplica (nem todo projeto tem mobile, SEO, i18n)
3. Adicione itens especificos do seu contexto
4. Use como checklist recorrente antes de cada deploy

Este checklist e um ponto de partida — adapte ao seu projeto.

---

SKILLS A CONSULTAR

  skills/devops/pre-deploy-checklist.md    Checklist de pre-deploy
  skills/security/owasp-checklist.md       OWASP Top 10
  skills/frontend/accessibility.md         Acessibilidade WCAG
  skills/frontend/seo-checklist.md         SEO checklist
  skills/testing/e2e-testing.md            Testes E2E
  skills/performance/performance-audit.md  Auditoria de performance
