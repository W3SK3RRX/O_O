# Anti-Frankenstein — Checkpoint de Governança CSS

Checklist de ponto de controle para evitar CSS Frankenstein antes de abrir um PR
com mudanças de estilo. Use como auto-revisão rápida antes de commitar qualquer
alteração de CSS, ou como critério de aprovação em code review de frontend.

CSS Frankenstein: código que duplica o que já existe, usa valores mágicos em vez
de tokens, viola convenções de escopo e acumula dívida técnica invisível.

---

## Checkpoint — 5 Perguntas Antes de Commitar

**1. Já existe CSS para isso?**
- Busquei no projeto antes de criar qualquer coisa nova
- Não existe duplicata (seletor, animação, variável)

**2. Estou editando o arquivo correto?**
- Global/tokens → arquivo de variáveis globais
- Componente específico → arquivo CSS do componente
- Não criei arquivo novo quando deveria editar um existente

**3. Estou usando tokens de design?**
- Cores: `var(--color-*)` — sem `#hex` ou `rgb()` diretamente
- Espaçamento: `var(--space-*)` — sem `px` mágico
- Fontes: `var(--font-family-*)` — sem `font-family` literal
- Sombras, bordas, transições: via variáveis do projeto

**4. O escopo está correto?**
- CSS de componente/módulo SPA tem prefixo ou escopo adequado
- Seletores genéricos (`h1`, `button`) não vazam para fora do módulo
- Sem `!important` (exceto override documentado de biblioteca terceira)

**5. Tem justificativa para arquivo novo?**
- Arquivo novo só se: novo módulo, nova página independente, ou volume > 50 linhas
- Nome do arquivo em kebab-case
- Comentário no topo do arquivo (propósito, dependências)

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
