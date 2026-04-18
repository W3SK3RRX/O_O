Tailwind CSS Patterns

Padroes e boas praticas para Tailwind CSS v4 com configuracao CSS-first.

Adaptado do antigravity-kit (MIT). Fonte: https://github.com/vudovn/antigravity-kit

---

ARQUITETURA TAILWIND V4

Tailwind v4 adota configuracao via CSS (sem tailwind.config.js):

  @import "tailwindcss";

  @theme {
    --color-primary: oklch(0.6 0.2 260);
    --color-secondary: oklch(0.7 0.15 180);
    --font-sans: "Inter", sans-serif;
    --spacing-18: 4.5rem;
  }

Mudancas chave do v4:
  - Configuracao via @theme no CSS (em vez de JS)
  - Oxide engine (mais rapido)
  - Nesting CSS nativo (sem plugin)
  - Container queries nativas
  - Automatic content detection (sem configurar content paths)

---

DESIGN RESPONSIVO

Abordagem: mobile-first (estilos base = mobile, breakpoints adicionam).

  Breakpoints padrao:
    sm   → 640px   (telefone landscape)
    md   → 768px   (tablet)
    lg   → 1024px  (desktop)
    xl   → 1280px  (desktop grande)
    2xl  → 1536px  (monitor wide)

  Exemplo:
    class="text-sm md:text-base lg:text-lg"
    (pequeno em mobile, base em tablet, grande em desktop)

Container queries (v4 nativo):
  Usar quando o componente deve responder ao tamanho do seu container,
  nao da viewport. Util para componentes reutilizaveis em layouts diferentes.

    class="@container"           (no container pai)
    class="@sm:flex-row"         (no filho — responde ao container)

---

DARK MODE

Estrategias:

  class-based (recomendado para apps):
    class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    Controle: toggle manual pelo usuario, persiste em localStorage

  media-based (segue preferencia do OS):
    Automatico via prefers-color-scheme
    Sem controle do usuario

Dica: definir cores semanticas no @theme facilita dark mode:

  @theme {
    --color-bg: white;
    --color-text: oklch(0.2 0 0);
  }
  .dark {
    --color-bg: oklch(0.15 0 0);
    --color-text: oklch(0.9 0 0);
  }

---

SISTEMA DE CORES

OKLCH (recomendado no v4):
  Perceptualmente uniforme — cores com mesma lightness parecem igualmente claras.

  Niveis de tokens:
    Primitivos   → cores brutas: --color-blue-500
    Semanticos   → intencao: --color-primary, --color-danger
    Componente   → especificos: --color-btn-bg, --color-card-border

  Paleta minima:
    primary    → acao principal, CTA
    secondary  → complementar
    accent     → destaque pontual
    neutral    → textos, bordas, backgrounds
    success    → confirmacao
    warning    → atencao
    danger     → erro, destrutivo

---

PADROES DE LAYOUT

Flexbox:
  class="flex items-center justify-between gap-4"

Grid:
  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

Grid auto-fit responsivo (sem breakpoints):
  class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6"

Stack vertical com espacamento:
  class="flex flex-col gap-4"

Centro absoluto:
  class="grid place-items-center"

---

TIPOGRAFIA

  Font stack:
    class="font-sans"   → Inter, system-ui, sans-serif
    class="font-mono"   → JetBrains Mono, monospace

  Escala de tipos (consistente):
    text-xs   → 12px
    text-sm   → 14px
    text-base → 16px (corpo)
    text-lg   → 18px
    text-xl   → 20px
    text-2xl  → 24px (subtitulos)
    text-3xl  → 30px (titulos)

  Dica: nao usar mais de 3-4 tamanhos por pagina.

---

ANIMACOES

  Transicoes suaves:
    class="transition-colors duration-200 ease-in-out"
    class="transition-transform duration-300 hover:scale-105"

  Animacoes de entrada:
    class="animate-fade-in"  (definir no @theme ou CSS)
    class="animate-slide-up"

  Reducao de movimento (acessibilidade):
    class="motion-safe:animate-fade-in motion-reduce:animate-none"

---

QUANDO EXTRAIR COMPONENTE

Regra dos 3 usos:
  1 uso  → inline classes, nao abstraia
  2 usos → considere, mas provavelmente nao
  3 usos → extraia um componente (React/Vue/Svelte component, nao @apply)

Preferir componente de framework a @apply:
  ✓ <Button variant="primary"> com classes dentro do componente
  ✗ @apply btn-primary (perde a composabilidade do Tailwind)

---

ANTI-PATTERNS

  ✗ Valores arbitrarios excessivos: class="mt-[13px] text-[#3b82f6]"
    → Defina no @theme se usar mais de uma vez

  ✗ !important (via !) em muitos lugares
    → Indica problema de especificidade; revise a estrutura

  ✗ @apply para tudo
    → Perde o beneficio de utility-first; use componentes do framework

  ✗ Classes dinamicas construidas com template strings
    → Tailwind nao detecta: `text-${color}-500` nao funciona
    → Use mapa explicito: const colors = { primary: 'text-blue-500' }

  ✗ Duplicar variantes em muitos elementos
    → Se 5 elementos tem as mesmas 10 classes, extraia componente

  ✗ Misturar Tailwind com CSS custom sem necessidade
    → Tailwind para layout e utilidades; CSS custom para animacoes complexas

---

PERFORMANCE

  Purge automatico → Tailwind v4 detecta automaticamente; nao precisa configurar
  Evitar classes dinamicas → usar safelist se necessario
  CSS minificado → built-in no build process
  Evitar @layer excessivo → pode causar conflitos de especificidade

---

SKILLS A CONSULTAR

  skills/frontend/css-governance.md   Governanca CSS (complementar)
  skills/frontend/accessibility.md    Acessibilidade
  skills/frontend/html-css-audit.md   Auditoria HTML/CSS
