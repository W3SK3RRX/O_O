# Onboarding — Novo Projeto

Como integrar o `agnostic-core` em qualquer projeto novo.

---

## Passo 1 — Adicionar o submodule

```powershell
cd C:\PROJETOS\meu-projeto
git submodule add https://github.com/paulinett1508-dev/agnostic-core.git .agnostic-core
git add .
git commit -m "chore: add agnostic-core as submodule"
git push
```

---

## Passo 2 — Adicionar ao CLAUDE.md

Crie ou edite o `CLAUDE.md` na raiz do projeto e inclua:

```markdown
## Agnostic Core

Submodule em: `.agnostic-core/`

Antes de qualquer tarefa, leia a skill relevante em `.agnostic-core/skills/`.

| Tarefa | Skill |
|--------|-------|
| Design, UI, layout, visual, cores, componente | `.agnostic-core/skills/design-system/SKILL.md` |
| Code review, refactor | `.agnostic-core/skills/audit/` |
| Deploy | `.agnostic-core/skills/devops/` |
| Testes | `.agnostic-core/skills/testing/` |
| API/Backend | `.agnostic-core/skills/backend/` |
| Segurança | `.agnostic-core/skills/security/` |

**CRÍTICO — Design:** nunca escreva código visual sem executar primeiro
`.agnostic-core/skills/design-system/SKILL.md` (Checklist → design.json → código).
```

---

## Passo 3 — Atualizar o submodule (quando agnostic-core tiver updates)

```powershell
cd C:\PROJETOS\meu-projeto
git submodule update --remote .agnostic-core
git add .agnostic-core
git commit -m "chore: update agnostic-core submodule"
git push
```

---

## Clonar um projeto que já tem o submodule

```powershell
git clone --recurse-submodules https://github.com/paulinett1508-dev/meu-projeto.git
```

Se já clonou sem o flag:

```powershell
git submodule update --init
```
