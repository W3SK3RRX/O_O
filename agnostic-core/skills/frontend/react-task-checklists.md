# Checklists React por Tipo de Tarefa

Verificações mínimas obrigatórias antes de declarar qualquer tarefa concluída.
Consulte o checklist correspondente ao tipo de mudança que você está fazendo.

Fonte: padrão extraído do f1-pulse.

---

## CSS / Tailwind / Visual

- [ ] Tokens semânticos do design system verificados — nunca hex hardcoded
- [ ] `tailwind.config.js` consultado antes de qualquer cor, shadow ou fonte
- [ ] Componentes existentes em `src/components/ui/` verificados antes de criar novos
- [ ] Animações já definidas verificadas antes de criar novas
- [ ] Responsivo testado (mobile-first, breakpoints Tailwind)

## Componente React

- [ ] Componente similar já existente verificado antes de criar novo
- [ ] Props com TypeScript types explícitos
- [ ] Tokens semânticos usados (nunca hex hardcoded no JSX)
- [ ] Teste correspondente adicionado

## Data Fetching

- [ ] Hooks existentes verificados antes de criar novo
- [ ] Loading, error e empty states implementados
- [ ] `staleTime` e `refetchInterval` definidos adequadamente
- [ ] Fonte dos dados documentada (qual API, qual endpoint)

## Estado (Zustand / Context)

- [ ] Store existente verificado antes de criar novo
- [ ] Ações nomeadas claramente
- [ ] Tipos atualizados se necessário

## TypeScript

- [ ] Tipos de domínio declarados no arquivo centralizado do projeto
- [ ] Zero `any` — usar `unknown` + type guard se necessário
- [ ] Validação de resposta de API externa via Zod

## Rotas

- [ ] Lazy loading em páginas não-críticas
- [ ] Fallback 404 implementado
- [ ] Parâmetros dinâmicos testados

## Testes

- [ ] `npm test` passa antes de commitar
- [ ] Fixtures compartilhadas reutilizadas (não duplicadas)
- [ ] Teste ao lado do arquivo testado (convenção do projeto)

---

## Pipeline de Qualidade Frontend

Para qualquer mudança visual, esta sequência é obrigatória:

```
1. DESIGN       → definir direção estética (cores, layout, motion)
2. GOVERNANÇA   → checar design system, reutilizar tokens, prevenir duplicação
3. IMPLEMENTAÇÃO → código final seguindo decisões anteriores
```

Checklist não consultado no planejamento = checklist esquecido na execução.

---

## Ver também

- `skills/frontend/tailwind-patterns.md` — padrões Tailwind v4 CSS-first
- `skills/frontend/css-governance.md` — governança de CSS
- `skills/frontend/accessibility.md` — WCAG 2.1 AA
- `skills/audit/senior-verification-protocol.md` — verificação final antes de concluir
