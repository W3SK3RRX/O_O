---
name: monorepo
description: 'Monorepo: workspaces, dependencias internas, CI seletivo, CODEOWNERS'
---

ESTRUTURA

Layout recomendado:
  monorepo/
    apps/                   ← Aplicacoes deployaveis
      web/
      api/
      admin/
    packages/               ← Bibliotecas internas compartilhadas
      ui/                   ← Componentes de UI
      utils/                ← Funcoes utilitarias
      config/               ← Configs compartilhadas (eslint, tsconfig)
      types/                ← Tipos/interfaces compartilhados
    package.json            ← Root com workspaces
    turbo.json / nx.json    ← Config do build system

- [ ] Cada pacote tem seu proprio package.json com nome, dependencias e scripts
- [ ] Separacao clara entre apps (deployaveis) e packages (bibliotecas)
- [ ] Pacotes de config compartilhada (eslint, prettier, tsconfig) como packages internos
- [ ] README na raiz explicando a estrutura e como comecar

---

DEPENDENCIAS

- [ ] Dependencias internas declaradas explicitamente no package.json de cada pacote
- [ ] Versao interna: workspace protocol ("@org/ui": "workspace:*") — sempre a versao local
- [ ] Dependencias externas hoisted na raiz quando possivel (evita duplicacao)
- [ ] Lock file unico na raiz (pnpm-lock.yaml, yarn.lock, package-lock.json)
- [ ] Dependencias circulares proibidas entre pacotes

Politica de versao:
  Fixed (recomendado para times pequenos): todos os pacotes na mesma versao
  Independent: cada pacote com versao propria (mais complexo, mais flexivel)

---

CI/CD

- [ ] Build apenas do que mudou (affected/changed) — nao rebuildar tudo a cada commit
- [ ] Cache de build entre execucoes (local e remoto)
- [ ] Testes executados apenas para pacotes afetados pela mudanca
- [ ] Deploy seletivo: cada app tem seu proprio pipeline de deploy
- [ ] Paralelismo: tarefas independentes rodam em paralelo

  Exemplo de pipeline:
    1. Detectar pacotes afetados pelo PR
    2. Lint + type check dos afetados (paralelo)
    3. Testes dos afetados (paralelo)
    4. Build dos afetados (respeitando ordem de dependencia)
    5. Deploy apenas das apps que mudaram

- [ ] CI nao deve demorar mais que o dobro de um repo simples

---

CONVENCOES

Commits:
- [ ] Escopo indica o pacote: feat(ui): add Button component, fix(api): handle timeout
- [ ] Commits que afetam a raiz: chore(root): update eslint config

Pull Requests:
- [ ] Labels indicando quais pacotes sao afetados
- [ ] CI mostra quais pacotes foram testados/buildados

Code Ownership:
- [ ] CODEOWNERS definido por pacote/pasta
- [ ] Reviewers automaticos baseados nos arquivos modificados
- [ ] Cada pacote tem um responsavel claro (nao precisa ser exclusivo)

---

TOOLING

| Ferramenta | Foco | Quando usar |
|---|---|---|
| Turborepo | Build system, caching | JS/TS, simplicidade |
| Nx | Build system, analise de dependencias | JS/TS, monorepos grandes |
| pnpm workspaces | Gerenciamento de pacotes | JS/TS, qualquer tamanho |
| Lerna | Publicacao de pacotes | JS/TS, npm packages |
| Bazel | Build system multi-linguagem | Monorepos multi-stack |

- [ ] Escolher ferramenta por tamanho e necessidade — nao over-engineer
- [ ] pnpm workspaces e suficiente para monorepos pequenos sem build system dedicado

---

ANTI-PATTERNS

  ✗ Acoplar tudo: pacotes importando livremente de qualquer outro (definir limites)
  ✗ Sem CODEOWNERS: ninguem sabe quem e responsavel por cada parte
  ✗ Deploy de tudo a cada mudanca (anula a vantagem do monorepo)
  ✗ CI lento sem cache ou deteccao de affected
  ✗ Dependencias circulares entre pacotes
  ✗ Um pacote "utils" gigante com tudo (quebrar por dominio)
  ✗ Monorepo sem convencao de commit (historico ilegivel)
  ✗ Colocar projetos nao-relacionados no mesmo monorepo

---

CHECKLIST DE MONOREPO

- [ ] Estrutura apps/ + packages/ clara
- [ ] Cada pacote com package.json e scripts proprios
- [ ] Workspace protocol para dependencias internas
- [ ] Lock file unico na raiz
- [ ] Build e testes apenas dos pacotes afetados
- [ ] Cache de build configurado (local e CI)
- [ ] CODEOWNERS definido por pacote
- [ ] Convencao de commit com escopo por pacote
- [ ] README na raiz com guia de inicio rapido
- [ ] CI nao significativamente mais lento que repo simples

---

SKILLS A CONSULTAR

  skills/git/commit-conventions.md          Conventional Commits (escopo por pacote)
  skills/git/branching-strategy.md          Estrategia de branches
  skills/devops/deploy-procedures.md        Procedimentos de deploy (seletivo por app)
  skills/devops/containerizacao.md          Containerizacao (imagem por app)

