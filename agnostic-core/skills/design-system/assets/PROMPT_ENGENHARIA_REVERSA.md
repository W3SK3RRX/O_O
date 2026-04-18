# Prompt — Engenharia Reversa Visual para design.json

> Use este prompt no Claude (ou qualquer AI com visão) junto com o **screenshot da referência**.
> Output: um `design.json` completo pronto para usar no seu projeto.

---

## PROMPT COMPLETO

```
Você é um designer de sistemas experiente. Analise a imagem de referência fornecida e faça 
uma engenharia reversa completa do design, extraindo todas as variáveis de estilo visual.

Retorne APENAS um JSON válido (sem markdown, sem explicação), seguindo exatamente esta estrutura:

{
  "$reference": "descrição do que você vê na imagem",
  
  "colors": {
    "primary": { "default": "#hex", "dark": "#hex", "light": "#hex", "foreground": "#hex" },
    "secondary": { "default": "#hex", "dark": "#hex", "light": "#hex", "foreground": "#hex" },
    "background": { "default": "#hex", "subtle": "#hex", "muted": "#hex" },
    "surface": { "default": "#hex", "raised": "#hex", "overlay": "#hex" },
    "text": { "primary": "#hex", "secondary": "#hex", "tertiary": "#hex", "disabled": "#hex", "inverse": "#hex" },
    "border": { "default": "#hex", "subtle": "#hex", "strong": "#hex" },
    "semantic": {
      "success": "#hex", "successLight": "#hex",
      "warning": "#hex", "warningLight": "#hex", 
      "error": "#hex", "errorLight": "#hex"
    }
  },

  "typography": {
    "fontFamily": {
      "primary": "nome da fonte que mais se assemelha, sans-serif",
      "secondary": null,
      "mono": null
    },
    "scale": {
      "display": { "size": "Xpx", "weight": 700, "lineHeight": "1.0", "letterSpacing": "-0.02em" },
      "h1": { "size": "Xpx", "weight": 700, "lineHeight": "1.1", "letterSpacing": "-0.01em" },
      "h2": { "size": "Xpx", "weight": 600, "lineHeight": "1.2", "letterSpacing": "-0.01em" },
      "h3": { "size": "Xpx", "weight": 600, "lineHeight": "1.3", "letterSpacing": "0" },
      "body": { "size": "Xpx", "weight": 400, "lineHeight": "1.6", "letterSpacing": "0" },
      "bodySm": { "size": "Xpx", "weight": 400, "lineHeight": "1.5", "letterSpacing": "0" },
      "caption": { "size": "Xpx", "weight": 400, "lineHeight": "1.4", "letterSpacing": "0.01em" }
    }
  },

  "spacing": {
    "base": 4,
    "layout": {
      "containerMaxWidth": "Xpx",
      "containerPadding": "Xpx",
      "sectionPadding": "Xpx"
    }
  },

  "borders": {
    "radius": { "sm": "Xpx", "md": "Xpx", "lg": "Xpx", "xl": "Xpx", "full": "9999px" },
    "style": "SHARP ou ROUNDED ou PILL"
  },

  "shadows": {
    "none": "none",
    "low": "0 Xpx Xpx rgba(0,0,0,0.XX)",
    "mid": "0 Xpx Xpx rgba(0,0,0,0.XX)",
    "high": "0 Xpx Xpx rgba(0,0,0,0.XX)"
  },

  "animation": {
    "duration": { "fast": "150ms", "normal": "250ms", "slow": "400ms" },
    "easing": { "default": "cubic-bezier(0.4, 0, 0.2, 1)" },
    "style": "SUBTLE ou EXPRESSIVE ou NONE"
  },

  "imagery": {
    "style": "FOTO_REAL ou ILUSTRACAO_FLAT ou ILUSTRACAO_3D ou ABSTRATO ou MISTO",
    "tone": "CLARO ou ESCURO ou COLORIDO ou MONOCROMATICO",
    "notes": "descrever o estilo visual das imagens presentes"
  },

  "antiPatterns": [
    "liste elementos que claramente NÃO existem neste design e devem ser evitados"
  ],

  "notes": "observações gerais sobre o estilo, personalidade e intenção do design"
}

Seja preciso com os valores hex. Se não conseguir determinar exatamente, use o valor mais próximo 
possível. Para tamanhos de fonte, estime com base nas proporções visuais.
```

---

## Como usar

1. Copie o prompt acima
2. Abra o Claude (ou GPT-4o, Gemini)
3. Anexe o **screenshot da referência** (Dribbble, site que você gosta, etc.)
4. Cole o prompt e envie
5. Salve o JSON retornado como `design.json` na raiz do projeto
6. Use como input para o coding assistant (Claude Code, Cursor, Replit Design Mode, etc.)

---

## Dicas para melhores resultados

- Use screenshots de **alta resolução**
- Prefira imagens que mostrem **múltiplos componentes** (não só o hero)
- Se possível, inclua **versões light e dark** na mesma imagem
- Para Dribbble: use o botão "Download" → "Full Preview" para melhor qualidade

---

## Prompt adicional — Aplicar design.json no projeto

Após gerar o design.json, use este segundo prompt para aplicar no coding assistant:

```
Tenho um projeto de {TIPO} para o mercado de {NICHO}.

Aqui está o design.json que define todo o sistema visual do projeto:

[COLE O DESIGN.JSON AQUI]

Aqui está a copy/conteúdo do projeto:

[COLE O CONTEÚDO AQUI]

Crie {LANDING PAGE / COMPONENTE / TELA} seguindo RIGOROSAMENTE o design.json acima.
Não use valores hardcoded — use variáveis CSS ou tokens do design system.
Não use padrões genéricos — cada decisão visual deve vir do design.json.
O resultado deve parecer feito por um designer profissional, não gerado por AI.
```

---

*Parte da skill `design-system` do agnostic-core*
*Técnica original: Deborah Folloni — DebGPT Newsletter*
