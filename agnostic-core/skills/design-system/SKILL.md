---
name: design-system
description: >
  Planejamento colaborativo de design antes de qualquer execução visual. OBRIGATÓRIO
  usar esta skill sempre que o usuário mencionar: redesign, UI, layout, visual, tema,
  componente, landing page, criar tela, refatorar estilo, melhorar aparência, design
  system, cores, tipografia, criar app, vibe coded, interface, front-end visual.
  Nunca pule o planejamento e o checklist — execute-os ANTES de qualquer código.
  Se o usuário pedir "só muda a cor" ou "só um ajuste", ainda assim execute o
  mini-checklist antes de codar.
---

# Design System Skill

## Propósito

Garantir que toda entrega visual seja **intencional, referenciada e profissional** —
evitando o padrão genérico de apps "vibe coded" (gradiente roxo, fonte Inter, sem imagens).

Baseado na técnica de 3 passos de Deborah Folloni:
> Referência → design.json → Execução

---

## REGRA DE OURO

> **Nenhum código de design é escrito antes do checklist ser concluído.**

Se o usuário pular etapas, lembre gentilmente:
_"Antes de codar, preciso de 2 minutos para garantir que o resultado vai parecer profissional de verdade."_

---

## Gatilhos de Ativação

Palavras que ativam esta skill automaticamente:

| Categoria | Palavras-chave |
|-----------|---------------|
| Ação visual | redesign, criar tela, refatorar UI, melhorar visual, aparência |
| Componentes | landing page, dashboard, componente, card, layout, header, hero |
| Estilo | tema, cores, tipografia, fonte, dark mode, light mode, paleta |
| Qualidade | vibe coded, genérico, feio, amador, parece AI |
| Sistema | design system, tokens, variáveis CSS, tailwind config |

---

## Fluxo de Execução

### FASE 1 — Diagnóstico (sempre primeiro)

Antes de qualquer coisa, entender:

1. **O que existe hoje?** (screenshot, descrição, nada)
2. **Qual é o contexto?** (landing page, app interno, mobile, web)
3. **Qual é o mercado/nicho?** (finanças, saúde, SaaS, e-commerce...)
4. **Existe uma referência?** (URL, imagem, nome de produto que admira)

Se não houver resposta para algum desses pontos → perguntar antes de continuar.

---

### FASE 2 — Checklist Colaborativo

Apresentar o checklist ao usuário e preencher **junto** antes de codar.
Ver template em: `assets/CHECKLIST_TEMPLATE.md`

O checklist cobre 6 dimensões:

```
[ ] REFERÊNCIA     → fonte de inspiração definida
[ ] PALETA         → cores hex definidas (primária, secundária, neutros, semânticas)
[ ] TIPOGRAFIA     → fonte escolhida, escala definida
[ ] ESPACAMENTO    → grid, padding, border-radius padrão
[ ] IMAGENS        → estilo visual (foto, ilustração, ícone, 3D, abstrato)
[ ] COPY           → textos do projeto disponíveis
```

Nenhum ponto pode ficar em aberto. Se o usuário não souber, **sugerir** com base
no contexto (mercado + referência).

---

### FASE 3 — Geração do design.json

Com o checklist completo, gerar o `design.json` centralizado.
Ver template em: `assets/DESIGN_JSON_TEMPLATE.json`

O arquivo inclui obrigatoriamente:
- `colors` — paleta completa com roles semânticos
- `typography` — família, escala, pesos, line-height
- `spacing` — escala de espaçamento (4px base)
- `borders` — radius por componente
- `shadows` — elevações (low/mid/high)
- `animation` — duração, easing padrão
- `imagery` — estilo visual definido
- `antiPatterns` — o que NUNCA usar neste projeto

---

### FASE 4 — Execução

Só então escrever código. Usar o `design.json` como fonte única de verdade.

**Regras de execução:**

- Nunca usar valores hardcoded — referenciar sempre o token do design.json
- Se for Tailwind: gerar `tailwind.config` a partir do design.json
- Se for CSS: gerar variáveis CSS `:root` a partir do design.json
- Se for React/shadcn: gerar tema a partir do design.json

---

## Anti-padrões Proibidos

Estes elementos NUNCA devem aparecer sem justificativa explícita do usuário:

```
✗ Gradiente roxo/roxo-azul genérico
✗ Fonte Inter como única escolha (sem considerar alternativas)
✗ Layout só com ícones — sem imagens ou ilustrações reais
✗ Cards com sombra box-shadow: 0 4px 6px rgba(0,0,0,0.1) genérica
✗ Botões com border-radius: 8px sem considerar o estilo do projeto
✗ Paleta gerada sem referência visual
✗ Fundo branco puro (#FFFFFF) sem nuance
```

---

## Referências para Inspiração

Quando o usuário não tiver referência, sugerir fontes por nicho:

| Nicho | Onde buscar |
|-------|-------------|
| Qualquer | [Dribbble](https://dribbble.com) — buscar "{nicho} landing page" ou "{nicho} design system" |
| SaaS/Tech | [Land-book](https://land-book.com), [Saaspo](https://saaspo.com) |
| Mobile | [Mobbin](https://mobbin.com) |
| Componentes | [UI8](https://ui8.net), [Untitled UI](https://www.untitledui.com) |

---

## Recursos Adicionais

- `assets/CHECKLIST_TEMPLATE.md` — checklist formatado para apresentar ao usuário
- `assets/DESIGN_JSON_TEMPLATE.json` — template do design.json para preencher
- `assets/PROMPT_ENGENHARIA_REVERSA.md` — prompt para extrair design.json de screenshot
