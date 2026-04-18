Testes End-to-End (E2E)

Testes que simulam o comportamento real do usuario, do inicio ao fim de um fluxo.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

PIRAMIDE DE TESTES

  Muitos   → Testes unitarios (rapidos, isolados, baratos)
  Alguns   → Testes de integracao (API, banco, contratos)
  Poucos   → Testes E2E (lentos, frageis, caros — mas indispensaveis)

E2E testa o que os outros nao testam: o fluxo completo como o usuario experimenta,
incluindo navegacao, formularios, redirecionamentos e interacoes entre sistemas.

---

QUANDO USAR E2E

Usar:
  - Caminhos criticos do usuario (login, cadastro, checkout, pagamento)
  - Fluxos de autenticacao e autorizacao
  - Operacoes de negocio que nao podem falhar silenciosamente
  - Integracoes com servicos externos (gateway de pagamento, email)
  - Smoke tests pos-deploy (o app abre e funciona?)

Nao usar E2E para:
  - Logica de negocio pura (teste unitario)
  - Validacao de campos individuais (teste unitario)
  - Contratos de API (teste de integracao)
  - Permutacoes de dados (muito lento, use unitarios)

---

PRINCIPIOS

1. Teste comportamento, nao implementacao
   Bom:  "usuario clica em Comprar e ve confirmacao de pedido"
   Ruim: "botao com classe .btn-primary dispara funcao handleSubmit"

2. Independencia entre testes
   Cada teste cria seus proprios dados e limpa apos execucao.
   Nenhum teste depende do resultado de outro.

3. Seletores resilientes
   Preferencia: data-testid > role/label > CSS selector > XPath
   Evitar: seletores por classe CSS ou estrutura DOM (frageis)

4. Esperas explicitas
   Nunca: sleep(2000)
   Sempre: waitForSelector, waitForResponse, waitForURL

5. Poucos testes, bem escolhidos
   Cada teste E2E custa tempo de execucao e manutencao.
   Cubra caminhos criticos, nao todos os caminhos.

---

PAGE OBJECT MODEL

Padrao para organizar E2E: cada pagina/componente tem um objeto que encapsula
seus seletores e acoes. O teste usa o Page Object, nunca seletores diretamente.

Estrutura:
  tests/
    e2e/
      pages/
        login-page.ts      → seletores e acoes da pagina de login
        dashboard-page.ts  → seletores e acoes do dashboard
      flows/
        auth.spec.ts       → testes do fluxo de autenticacao
        checkout.spec.ts   → testes do fluxo de checkout

Beneficios:
  - Mudanca de UI atualiza o Page Object, nao todos os testes
  - Testes ficam legiveis (loginPage.fillEmail, loginPage.submit)
  - Reuso entre testes do mesmo fluxo

---

ORGANIZACAO POR FEATURE

  tests/
    e2e/
      auth/
        login.spec.ts
        register.spec.ts
        forgot-password.spec.ts
      checkout/
        add-to-cart.spec.ts
        payment.spec.ts
        confirmation.spec.ts
      pages/
        login-page.ts
        cart-page.ts
        checkout-page.ts
      fixtures/
        test-user.ts
        test-products.ts

---

FERRAMENTAS

Web:
  Playwright  → multi-browser, auto-wait, trace viewer, recomendado para novos projetos
  Cypress     → DX excelente, time-travel debug, single-browser per run

Mobile:
  Detox       → React Native, roda no device/emulador, rapido
  Appium      → multi-plataforma, mais lento, mais flexivel
  Maestro     → YAML-based, simples, bom para smoke tests

API (complemento a E2E):
  Playwright API testing → requests diretos para setup/teardown de dados
  Supertest → Node.js, bom para testes de API isolados

---

INTEGRACAO COM CI

  - [ ] E2E roda em CI a cada PR (ou ao menos no merge para main)
  - [ ] Paralelizacao: dividir testes entre workers (Playwright: --workers)
  - [ ] Retries: permitir 1-2 retries para testes flakey (mas investigar a causa)
  - [ ] Artifacts: salvar screenshots e traces de testes que falharam
  - [ ] Timeout: definir timeout por teste (30-60s) e global (10-15min)
  - [ ] Dados de teste: usar banco isolado ou API para criar/limpar dados

---

ANTI-PATTERNS

  ✗ Testar implementacao (classes CSS, nomes de funcao) em vez de comportamento
  ✗ Testes interdependentes (teste B depende do resultado de teste A)
  ✗ Sleep fixo em vez de esperas explicitas
  ✗ Seletores por classe CSS ou posicao no DOM
  ✗ Testar tudo com E2E (use unitarios para logica, integracao para API)
  ✗ Ignorar testes flakey ("as vezes falha, ignora")
  ✗ Sem cleanup: dados de teste poluindo o banco
  ✗ Rodar E2E apenas localmente (integrar no CI)

---

SKILLS A CONSULTAR

  skills/testing/unit-testing.md         Testes unitarios (base da piramide)
  skills/testing/integration-testing.md  Testes de integracao (camada do meio)
  skills/testing/tdd-workflow.md         Ciclo Red-Green-Refactor
