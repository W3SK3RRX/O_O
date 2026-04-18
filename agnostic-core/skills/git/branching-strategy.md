Branching Strategy

Objetivo: Manter historico de git limpo, colaboracao sem conflitos longos e deploys frequentes e seguros.

---

TRUNK-BASED DEVELOPMENT (recomendado)

Principio: todos trabalham em branches curtas (< 2 dias) a partir de `main`. Nenhum branch vive por semanas.

  main
   ├── feat/auth-oauth (1-2 dias → merge → delete)
   ├── fix/token-expiry (horas → merge → delete)
   └── refactor/user-service (1 dia → merge → delete)

Vantagens:
- Integracoes continuas e pequenas → menos conflitos
- Deploy frequente sem acumulo de mudancas
- Feature flags substituem branches longos

Quando usar: equipes com CI/CD maduro, projetos com deploys frequentes.

---

GITFLOW (para releases versionadas)

Para projetos com releases discretas (bibliotecas, apps mobile, APIs com versoes).

  main          → codigo em producao
  develop       → integracao continua
  feat/*        → novas funcionalidades (a partir de develop)
  fix/*         → bug fixes (a partir de develop)
  hotfix/*      → correcoes urgentes em producao (a partir de main)
  release/*     → preparacao de release (a partir de develop)

Quando usar: apps mobile, bibliotecas publicas com semver, projetos com release cycle definido.

---

NOMENCLATURA DE BRANCHES

Formato: `tipo/descricao-curta-em-kebab-case`

  feat/auth-oauth-google
  fix/token-expiry-timezone
  docs/update-readme-instalacao
  refactor/extrair-calculo-pontuacao
  test/adicionar-cenarios-auth
  chore/atualizar-dependencias
  hotfix/sql-injection-login
  release/v1.2.0

Regras:
- [ ] Minusculas com hifens
- [ ] Descricao especifica, nao generica ("feat/melhorias" nao serve)
- [ ] Prefixo alinhado com o tipo de commit convencional
- [ ] Maximo 50 caracteres no nome do branch

---

PROTECAO DO BRANCH MAIN

Configurar no GitHub/GitLab (Settings > Branches):

- [ ] Require pull request before merging
- [ ] Require at least 1 approval
- [ ] Require status checks to pass (CI: lint, tests, build)
- [ ] Require branches to be up to date before merging
- [ ] Restrict direct pushes to main (apenas via PR)
- [ ] Delete head branch automatically after merge

---

MERGE STRATEGY

Squash and merge (recomendado para trunk-based):
  Todos os commits do branch viram um unico commit em main.
  Historico de main: limpo, um commit por feature/fix.
  Quando: branches curtos com varios commits de WIP.

Merge commit (recomendado para gitflow):
  Preserva todos os commits do branch.
  Historico completo e rastreavel.
  Quando: branches de feature ou release com commits bem escritos.

Rebase and merge:
  Commits do branch aplicados linearmente em main.
  Sem merge commit, mas reescreve historia.
  Quando: branches com poucos commits bem estruturados.

Nao misturar strategies no mesmo projeto — definir e documentar no CONTRIBUTING.md.

---

RESOLUCAO DE CONFLITOS

- [ ] Atualizar branch antes de abrir PR: `git merge main` ou `git rebase main`
- [ ] Resolver conflitos no branch, nao no main
- [ ] Comunicar ao time antes de fazer rebase de branch compartilhado
- [ ] Para branches longos: sincronizar com main a cada dia de trabalho

---

BRANCH LIFECYCLE

  Criar → Trabalhar → Abrir PR → Review → Merge → Deletar

- [ ] Branch deletado imediatamente apos merge (GitHub: delete automatico)
- [ ] Branches com mais de 7 dias sem atividade: verificar e fechar ou dar continuidade
- [ ] Nunca recriar um branch deletado com o mesmo nome (use nome novo)

---

CHECKLIST DE BRANCH

- [ ] Nome segue o padrao `tipo/descricao`
- [ ] Criado a partir de main (ou develop no gitflow)
- [ ] Atualizado com main antes de abrir PR
- [ ] Um unico proposito por branch (nao misturar feat + refactor)
- [ ] Branch vive no maximo 2 dias (trunk-based) ou ate o proximo sprint (gitflow)
- [ ] Deletado apos merge
