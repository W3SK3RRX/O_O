---
title: Auto-Aprendizado — Protocolo LESSONS.md
description: Padrão para documentar correções do usuário e transformar erros recorrentes em regras permanentes do projeto
category: workflow
tags: [learning, quality, documentation, feedback, claude]
---

# Auto-Aprendizado — Protocolo LESSONS.md

## Conceito

Após qualquer correção do usuário, o erro e a regra extraída são documentados em `.claude/LESSONS.md`.
O objetivo é que o mesmo erro não ocorra duas vezes no projeto.

## Estrutura do Arquivo

```markdown
# LESSONS.md — Lições Aprendidas

## DADOS
- [2025-01-15] Query sem filtro de tenant retornou dados de outra conta. REGRA: toda query DEVE incluir filtro de `tenant_id` / `liga_id` / `org_id`

## FRONTEND
- [2025-01-20] CSS hardcoded sobrepôs token. REGRA: nunca usar #hex direto — sempre `var(--color-*)`

## LOGICA
- [2025-02-03] `toFixed(2)` arredondou valor incorretamente. REGRA: truncar valores financeiros com `Math.trunc(n * 100) / 100`

## PROCESSO
- [2025-02-10] Feature implementada sem plano aprovado. REGRA: TaskCreate antes de qualquer implementação não-trivial
```

## Categorias

| Categoria | Quando usar |
|---|---|
| `DADOS` | Bugs de banco de dados, queries incorretas, migrations erradas |
| `FRONTEND` | CSS corrompido, componentes incorretos, acessibilidade ignorada |
| `LOGICA` | Algoritmos errados, cálculos incorretos, edge cases ignorados |
| `PROCESSO` | Fluxo de trabalho violado, passos pulados, aprovações ignoradas |

## Protocolo de Registro

Após qualquer correção do usuário:

1. Identificar a categoria
2. Registrar data (`YYYY-MM-DD`)
3. Descrever o que aconteceu (uma linha, passado)
4. Escrever a regra extraída (imperativo, presente)

```
- [DATA] O que aconteceu. REGRA: regra imperativa extraída.
```

## Promoção de Lições

```
3+ lições da mesma categoria com padrão similar
      ↓
Propor nova regra formal ao usuário
      ↓
Se aprovada → adicionar às Critical Rules do CLAUDE.md
```

**Lição crítica** (falha em produção, perda de dados, bug de segurança) → promover imediatamente às Critical Rules, sem esperar 3 ocorrências.

## Onde Criar o Arquivo

```
projeto/
└── .claude/
    └── LESSONS.md
```

Se `.claude/` não existir, criar junto com o primeiro registro.

## Integração com CLAUDE.md

O CLAUDE.md deve referenciar o arquivo e a instrução:

```markdown
## Auto-Aprendizado
Após correção do usuário: registrar em `.claude/LESSONS.md`
(categorias: DADOS, FRONTEND, LOGICA, PROCESSO).
3+ lições da mesma categoria → propor nova regra.
Lição crítica → adicionar às Critical Rules imediatamente.
```

## Referência Cruzada

- `skills/audit/post-implementation-conformity.md` — auditoria cruzada código vs plano
- `skills/audit/systematic-debugging.md` — investigar antes de corrigir
- `skills/workflow/context-management.md` — handover entre sessões
