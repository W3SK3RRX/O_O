# Dark Mode com CSS Custom Properties

Estrutura para implementar dark mode por padrão usando CSS custom properties.
Evita duplicação de classes Tailwind e mantém o tema centralizado.

Fonte: padrão extraído do pedidomobile (Laboratório Sobral).

---

## Decisão de default

**Dark mode por padrão** é a escolha certa quando:
- O produto é uma ferramenta interna ou dashboard
- O público-alvo usa o produto em ambientes com pouca luz
- A identidade visual do produto é escura (apps esportivos, fintech, etc.)

**Light mode por padrão** quando:
- Landing pages, produtos de consumo amplo
- Conteúdo editorial ou de leitura prolongada

---

## Estrutura de tokens

Defina os tokens no CSS global — não no Tailwind config:

```css
/* globals.css */
:root {
  --bg:        #F5FAF7;
  --surface:   #F0F7F4;
  --surface2:  #E8F3EE;
  --border:    #C8DDD6;
  --accent:    #1A8C5B;
  --highlight: #0B6640;
  --text:      #0D1F17;
  --muted:     #5A7A6E;
}

.dark {
  --bg:        #0A0F0D;
  --surface:   #0F1A14;
  --surface2:  #0F1F17;
  --border:    #1F5C3E;
  --accent:    #2ECC8A;
  --highlight: #7EFFD4;
  --text:      #E8F3EE;
  --muted:     #6B9E85;
}
```

---

## Implementação com next-themes

```tsx
// layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"      // dark por padrão
          enableSystem={false}     // ignora preferência do SO
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## Usando os tokens nos componentes

```tsx
// Correto: via CSS custom property
<div className="bg-[var(--bg)] text-[var(--text)] border-[var(--border)]">

// Ou via Tailwind extend (para tokens usados com frequência)
// tailwind.config.ts
extend: {
  colors: {
    bg: 'var(--bg)',
    surface: 'var(--surface)',
    accent: 'var(--accent)',
    text: 'var(--text)',
    muted: 'var(--muted)',
  }
}

// Componente
<div className="bg-bg text-text border-border">
```

---

## Checklist de dark mode

- [ ] `defaultTheme="dark"` e `enableSystem={false}` configurados
- [ ] Todos os tokens definidos para `:root` (light) e `.dark`
- [ ] Nenhuma cor hardcoded nos componentes — tudo via token
- [ ] Toggle de tema (ThemeToggle) acessível e visível
- [ ] Imagens e ícones SVG testados em ambos os temas
- [ ] Contraste verificado em ambos os temas (WCAG AA mínimo)

---

## Ver também

- `skills/frontend/accessibility.md` — contraste WCAG 2.1 AA
- `skills/design-system/` — tokens e design system
- `skills/frontend/tailwind-patterns.md` — padrões Tailwind
- `skills/ux-ui/principios-de-interface.md` — hierarquia visual
