---
name: visual-baseline
description: 'As tres camadas visuais (imagem, tipografia, icones) que separam projetos funcionais de profissionais'
---

## As Três Camadas de Decisão

### 1. Imagem e Conteúdo Visual

**O que resolver:** fotos genéricas, placeholders sem contexto, ausência de assets.

| Abordagem | Quando usar | Trade-off |
|---|---|---|
| Stock photography (Unsplash, Pexels) | Protótipo, MVPs, editorial | Rate limits no free tier; sem vínculo com a marca; verifique licença para uso comercial |
| Geração por IA (Nano Banana, Midjourney) | Quando identidade visual importa | Requer curadoria; integração via MCP no Claude Code (ver `nano-banana-claude-workflow.md`) |
| Assets próprios / iconográficos | Produto em produção com identidade definida | Custo de criação, mas elimina dependência externa |
| Nenhuma imagem intencional | Dashboards, ferramentas internas, apps de dados | Às vezes a ausência de imagem é a decisão certa — hierarquia de dados supera foto |

**Regra:** para produção, prefira assets gerados com contexto do projeto ao invés de stock genérico.

---

### 2. Tipografia

**O que resolver:** system fonts monótonas (Arial, sans-serif) sem hierarquia definida.

| Abordagem | Quando usar | Trade-off |
|---|---|---|
| Google Fonts via CDN | Prototipagem rápida | Afeta LCP (Core Web Vitals); viola GDPR na UE; cria dependência externa |
| Google Fonts self-hosted | Produção com fontes Google | Elimina dependência de CDN; melhor performance; compatível com GDPR |
| System font stack intencional | Apps de dados, ferramentas internas | Zero latência; escolha consciente, não omissão |
| Fontes proprietárias / brand | Produto com identidade visual forte | Máximo controle; requer licença |

**Regra:** nunca use `font-family: sans-serif` por omissão — defina hierarquia tipográfica explícita.
Para produção, prefira self-host a CDN externa.

---

### 3. Iconografia

**O que resolver:** ícones inconsistentes, SVGs soltos sem sistema, bibliotecas misturadas.

| Abordagem | Quando usar | Trade-off |
|---|---|---|
| Lucide Icons | React, tree-shakable, design system moderno | Recomendado para 2025+ |
| Heroicons | Tailwind ecosystem, outline/solid variants | Integração natural com Tailwind |
| Phosphor Icons | Estilos múltiplos (thin, bold, duotone) | Mais expressivo; bundle maior se não tree-shaken |
| Font Awesome (free) | Legado, projetos sem build step | Tier free limitado; bundle pesado via CDN |
| SVGs próprios inline | Design system proprietário, ícones de domínio | Controle total; custo de criação |

**Regra:** escolha uma biblioteca e use consistentemente. Misturar quebra o ritmo visual.
Prefira tree-shakable sobre CDN.

---

## Repertório Técnico (bônus)

Para desenvolvedores solo, exposição a padrões visuais avançados é tão importante
quanto as ferramentas. Abordagens práticas:

- Ler código-fonte de componentes de bibliotecas (Shadcn/ui, Radix, Mantine)
- Consultar `skills/frontend/ux-guidelines.md` (99 guidelines curados por categoria)
- Usar `skills/design/paper-mcp-workflow.md` para engenharia reversa de designs existentes

---

## Decisão por Tipo de Projeto

| Tipo de Projeto | Imagem | Tipografia | Ícones |
|---|---|---|---|
| Micro-SaaS | AI-generated contextual ou assets próprios | Self-hosted (Inter, Plus Jakarta Sans) | Lucide ou Heroicons |
| App esportivo / dashboard | Assets de domínio (logos, telemetria) | Self-hosted com fonte display | Lucide + SVGs de domínio |
| Landing page | Stock fotográfico curado + brand | Google Fonts self-hosted | Heroicons ou Phosphor |
| Ferramenta interna | Nenhuma (foco em dados) | System font stack intencional | Lucide |
| Protótipo / MVP | Unsplash (testar fluxo) | Google Fonts via CDN (aceitar trade-off) | Qualquer, desde que consistente |

---

## Checklist de Baseline Visual

Antes de considerar o visual "pronto para produção":

- [ ] Imagens têm licença verificada para uso comercial
- [ ] Fontes são self-hosted (ou CDN é escolha intencional e documentada)
- [ ] Uma única biblioteca de ícones usada de forma consistente
- [ ] Cores são tokens semânticos — nunca hex hardcoded (ver `skills/design-system/`)
- [ ] Hierarquia tipográfica definida (H1-H6, body, label, caption)
- [ ] Dark mode considera os mesmos assets (fontes e ícones funcionam; imagens têm versão adequada)

---

## Ver também

- `skills/design/nano-banana-claude-workflow.md` — geração de assets por IA via MCP
- `skills/design/paper-mcp-workflow.md` — design de interfaces via Paper MCP
- `skills/frontend/ux-guidelines.md` — 99 guidelines de UX com severidade
- `skills/frontend/accessibility.md` — WCAG 2.1 AA, contraste e leitura
- `skills/ux-ui/principios-de-interface.md` — hierarquia visual e decisão de layout
- `skills/design-system/` — tokens de design e engenharia reversa

