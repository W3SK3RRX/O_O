# Como auditar uma tela

> Guia de entrada para o protocolo "menos é mais".
> Define quando usar cada skill, em que ordem, e como referenciar em qualquer projeto.

---

## As duas dimensões de auditoria

Uma tela pode ter dois tipos de problema independentes:

| Dimensão | Skill | Pergunta central |
|----------|-------|-----------------|
| **UX / Navegação** | `ux-ui/navegacao-sem-redundancia.md` | "Esse acesso já existe em outro lugar?" |
| **Código / Frontend** | `frontend/menos-e-mais.md` | "Esse código agrega algo real?" |

São complementares, mas auditam camadas diferentes. Podem ser usadas juntas ou separadas.

---

## Ordem de aplicação

```
Tela / componente a auditar
         ↓
[1] UX primeiro
    → ux-ui/navegacao-sem-redundancia.md
    → Remove atalhos, botões e menus redundantes
    → Diagnóstico 🔴🟡🟢

[2] Código depois
    → frontend/menos-e-mais.md
    → Remove CSS morto, wrappers, lógica duplicada
    → Diagnóstico 🔴🟡🟢

[3] Refatoração cirúrgica
    → Por seção, com before/after
    → Sem adicionar abstração nova
```

**Por que essa ordem?** Não adianta limpar o CSS de um botão que vai ser removido pela auditoria de UX. UX primeiro evita retrabalho.

---

## Quando usar cada skill isoladamente

### Só `ux-ui/navegacao-sem-redundancia.md`

- Review de wireframe ou protótipo (sem código ainda)
- Feedback de usuário sobre "confusão na navegação"
- Sprint de UX com designer

### Só `frontend/menos-e-mais.md`

- PR de código sem mudança de interface
- Refatoração técnica interna
- Onboarding em codebase legado
- Limpeza de CSS acumulado

### As duas juntas

- Feature nova completa sendo revisada
- Página herdada de sistema legado
- Sprint de qualidade / débito técnico

---

## Como referenciar em qualquer projeto

### Claude Code / Claude.ai (CLAUDE.md)

Crie ou edite `.claude/CLAUDE.md` na raiz do projeto:

```markdown
## Auditoria de Interface

Antes de revisar qualquer frontend, carregar:

### UX / Navegação
@https://raw.githubusercontent.com/paulinett1508-dev/agnostic-core/master/skills/ux-ui/navegacao-sem-redundancia.md

### Código / Frontend
@https://raw.githubusercontent.com/paulinett1508-dev/agnostic-core/master/skills/frontend/menos-e-mais.md

Aplicar sempre que: componente novo, PR de frontend, reclamação de "tela poluída".
```

---

### Cursor / Windsurf / Copilot (AGENTS.md ou .cursorrules)

```markdown
## Auditoria de Interface — Protocolo Menos é Mais

Ao revisar frontend ou UX, seguir obrigatoriamente:

1. UX primeiro:
   https://raw.githubusercontent.com/paulinett1508-dev/agnostic-core/master/skills/ux-ui/navegacao-sem-redundancia.md

2. Código depois:
   https://raw.githubusercontent.com/paulinett1508-dev/agnostic-core/master/skills/frontend/menos-e-mais.md

Entregar diagnóstico 🔴🟡🟢 antes de qualquer modificação.
```

---

### Prompt manual (qualquer LLM)

```
Antes de analisar este componente/tela, carregue e siga:

1. https://github.com/paulinett1508-dev/agnostic-core/blob/master/skills/ux-ui/navegacao-sem-redundancia.md
2. https://github.com/paulinett1508-dev/agnostic-core/blob/master/skills/frontend/menos-e-mais.md

Entregue o diagnóstico 🔴🟡🟢 antes de qualquer modificação.
```

---

## Integração no fluxo de desenvolvimento

### Em code review (PR)

Adicionar checklist no template de PR do projeto:

```markdown
## Checklist de Interface

- [ ] Auditoria de navegação aplicada? (`ux-ui/navegacao-sem-redundancia`)
- [ ] Auditoria de código aplicada? (`frontend/menos-e-mais`)
- [ ] Diagnóstico 🔴🟡🟢 entregue antes das mudanças?
- [ ] Nenhuma abstração nova adicionada durante limpeza?
```

### Em CI (opcional)

Scripts de métricas que podem ser adicionados ao pipeline:

```bash
# Conta linhas de CSS (baseline para comparação)
find . -name "*.css" -not -path "*/node_modules/*" | xargs wc -l | tail -1

# Componentes com menos de 5 linhas (possíveis stubs)
find src -name "*.jsx" -o -name "*.tsx" | xargs wc -l | awk '$1 < 5' | wc -l
```

---

## O que esta auditoria NÃO substitui

- **Linters** (ESLint, Stylelint) — auditam sintaxe. Esta skill audita semântica e design.
- **Testes automatizados** — validam comportamento. Esta skill valida intenção.
- **Acessibilidade (a11y)** — ver `skills/ux-ui/` para skills específicas de acessibilidade.
- **Performance** — ver `skills/performance/` para auditoria de bundle e runtime.

---

## Princípios gerais

> Se eu remover isso, o usuário percebe a diferença?
> — Se não, é candidato à remoção.

> Atalho só existe se o caminho principal for longo.
> — Se está a 1 clique, atalho é ruído.

> Contexto decide, não conveniência.
> — "Pode ser útil" não é justificativa para manter redundância.

> UX primeiro, código depois.
> — Não limpe o que vai ser removido.
