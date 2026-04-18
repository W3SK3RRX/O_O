---
name: dead-code-auditor
description: Audits any project for dead, orphaned, and unused code — functions never called, files never imported, CSS never applied, scripts not referenced, npm dependencies not used, routes without handlers, and env vars declared but absent. Use when the user asks to find dead code, orphan code, unused files, unreferenced scripts, clean up the codebase, or remove what's no longer needed. Triggers on keywords like 'dead code', 'código órfão', 'orphan', 'unused', 'never called', 'vasculhar', 'limpar codebase', 'código morto'.
---
# Dead Code Auditor

Systematically scan any project for code that is defined but never used — functions, files, modules, CSS classes, routes, env vars, npm packages, and scripts.

## Workflow

Run these phases in order. Each phase is independent — skip phases that don't apply to the tech stack.

### Phase 0 — Identify stack

```bash
ls package.json tsconfig.json Gemfile requirements.txt go.mod 2>/dev/null
```

- Node/JS/TS → run all phases
- Python → adapt imports/functions phases
- Other → adapt as needed

### Phase 1 — Unused npm dependencies

See [`references/commands.md`](references/commands.md#phase-1--unused-npm-dependencies)

### Phase 2 — Unreferenced files (never imported)

See [`references/commands.md`](references/commands.md#phase-2--unreferenced-files)

### Phase 3 — Dead functions and variables

See [`references/commands.md`](references/commands.md#phase-3--dead-functions-and-variables)

### Phase 4 — Orphan scripts

See [`references/commands.md`](references/commands.md#phase-4--orphan-scripts)

### Phase 5 — Unused CSS classes

See [`references/commands.md`](references/commands.md#phase-5--unused-css-classes)

### Phase 6 — Dead routes

See [`references/commands.md`](references/commands.md#phase-6--dead-routes)

### Phase 7 — Undeclared or unused env vars

See [`references/commands.md`](references/commands.md#phase-7--env-vars)

## Reporting

After all phases, consolidate findings into a table:

| # | Category | Item | Confidence | Action |
|---|---|---|---|---|
| 1 | npm dep | `lodash` | High | Remove |
| 2 | File | `src/utils/old-helper.js` | Medium | Verify + remove |
| 3 | Function | `formatLegacyDate()` | High | Remove |

**Confidence levels:**
- **High** — zero references found across the entire codebase
- **Medium** — referenced only in comments, tests, or other dead code
- **Low** — dynamic usage possible (eval, require(variable), reflection)

Always flag Low-confidence items for human review before deletion.

## Safety rules

- Never delete automatically — list candidates, let the human decide
- Dynamic `require(variable)` and `import(expr)` can reference any file — mark as Low confidence
- Plugin systems, CLI entry points, and exported libraries may have external consumers — always check before removing
- Check git blame: if something was added in the last 2 weeks, it may be intentionally incomplete

## Reference files

- [`references/commands.md`](references/commands.md) — all bash commands by phase
- [`references/checklist.md`](references/checklist.md) — dead code patterns by language/framework

