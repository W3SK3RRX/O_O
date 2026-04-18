---
name: anti-frankenstein
description: 'Checkpoint de governanca CSS: evitar CSS Frankenstein antes de PR'
---

## Sinais de Alerta em Code Review

Se qualquer um dos itens abaixo aparecer no diff, investigar antes de aprovar:

```
style=""               → inline style em HTML
#[0-9a-fA-F]{3,8}     → cor hardcoded sem var()
rgba?\(                → cor hardcoded sem var()
@keyframes             → verificar se já existe globalmente
!important             → problema de especificidade ou override indevido
font-family:           → verificar se usa var(--font-family-*)
```

---

## Ferramentas de Verificação Rápida

```bash
# Buscar seletor existente antes de criar novo
grep -rn "\.nome-da-classe" src/

# Detectar cores hardcoded
grep -rn "#[0-9a-fA-F]\{3,8\}" src/css/
grep -rn "rgba\?\(" src/css/

# Buscar inline styles em HTML/JSX
grep -rn 'style="' src/components/
grep -rn 'style={{' src/components/   # JSX

# Verificar !important
grep -rn "!important" src/css/

# CSS lint
npx stylelint "**/*.css"
```

---

## O que Não é Frankenstein (Exceções Válidas)

- `style=""` em elementos criados 100% via JavaScript com classe descartável
- `!important` documentado para override de biblioteca de terceiro (ex: react-datepicker)
- Arquivo CSS novo com justificativa clara e volume suficiente
- `rgba()` em valor de fallback para browsers antigos (com `var()` principal)

---

## Referências

- Ver skills/frontend/css-governance.md para o guia completo de governança CSS
- BEM methodology: https://getbem.com/
- CSS Custom Properties: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

