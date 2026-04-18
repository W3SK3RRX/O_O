---
name: responsive-breakpoint-table
description: 'Tabela de responsividade por componente: regras explicitas mobile vs desktop'
---

## Modelo de tabela

```markdown
| Componente   | Mobile (< md)                    | Desktop (>= md)           |
|--------------|----------------------------------|---------------------------|
| KpiStrip     | grid-cols-2                      | grid-cols-6               |
| Charts       | hidden                           | grid-cols-2               |
| FilterBar    | Botão + bottom drawer            | Inline com selects        |
| DataTable    | Cards empilhados, borda-l accent  | Tabela completa com sort  |
| Navigation   | Bottom navigation                | Sidebar 240px             |
| Header       | Logo + hamburger menu            | Logo + nav links inline   |
| Modal        | Full screen                      | Centered 600px max-width  |
```

---

## Como usar

1. **Defina a tabela antes de implementar** — serve como spec
2. **Adicione ao CLAUDE.md do projeto** — a IA consulta antes de criar componentes
3. **Atualize quando o comportamento mudar** — a tabela é a fonte de verdade

---

## Breakpoints padrão Tailwind

| Prefixo | Largura mínima | Uso típico |
|---------|---------------|------------|
| (sem)   | 0px           | Mobile first |
| `sm`    | 640px         | Dispositivos maiores |
| `md`    | 768px         | Tablet / desktop |
| `lg`    | 1024px        | Desktop |
| `xl`    | 1280px        | Desktop largo |
| `2xl`   | 1536px        | Telas grandes |

Para a maioria dos projetos, `md` é o breakpoint principal de separação mobile/desktop.

---

## Padrões comuns por tipo de componente

### Tabelas de dados
- **Mobile:** cards empilhados com borda lateral colorida (indica status/categoria)
- **Desktop:** tabela completa com colunas sortáveis

### Filtros e busca
- **Mobile:** botão que abre drawer na parte inferior da tela
- **Desktop:** controles inline visíveis

### Navegação
- **Mobile:** bottom navigation (5 itens máximo) ou hamburger
- **Desktop:** sidebar fixa ou nav horizontal

### Grids de métricas (KPIs)
- **Mobile:** 2 colunas
- **Desktop:** 4–6 colunas

---

## Checklist de responsividade

- [ ] Tabela de responsividade definida antes de implementar
- [ ] Todos os componentes principais têm regra para mobile e desktop
- [ ] Testado em viewport 375px (iPhone SE) e 1280px (desktop padrão)
- [ ] Elementos interativos têm área de toque mínima de 44x44px em mobile
- [ ] Textos não truncados inesperadamente em mobile

---

## Ver também

- `skills/frontend/html-css-audit.md` — auditoria de HTML e CSS
- `skills/frontend/accessibility.md` — área de toque e WCAG
- `skills/ux-ui/principios-de-interface.md` — hierarquia e layout
- `skills/frontend/tailwind-patterns.md` — padrões Tailwind

