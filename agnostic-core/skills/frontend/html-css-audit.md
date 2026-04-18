# HTML/CSS Audit

Pontos de qualidade, acessibilidade e performance para revisar em projetos frontend.
Útil em code review ou ao auditar um projeto existente.

HTML Checklist

Semantica
- Uso correto de tags semanticas (header, main, nav, section, article, footer)
- Hierarquia de headings correta (h1 unico por pagina, sequencial)
- Formularios com labels associados corretamente
- Botoes com type explicito (button, submit, reset)

Acessibilidade
- Imagens com alt descritivo (decorativas com alt vazio)
- Contraste minimo 4.5:1 (texto normal) e 3:1 (texto grande)
- Navegacao por teclado funcional (tabindex, focus visivel)
- aria-label em elementos interativos sem texto visivel
- Landmarks ARIA onde necessario

Performance
- Imagens com width e height definidos (evita layout shift)
- Lazy loading em imagens abaixo do fold
- Scripts com defer ou async quando possivel

CSS Checklist
- Nenhum !important desnecessario
- Variaveis CSS para cores e espacamentos (design tokens)
- Media queries mobile-first
- Sem valores magicos sem comentario
- Prefixos vendor apenas onde necessario

Ferramentas
- Lighthouse: npx lighthouse https://url --output html
- axe-core: npx axe https://url
- stylelint: npx stylelint "**/*.css"
- WAVE: https://wave.webaim.org/
