Accessibility

Objetivo: Garantir conformidade com WCAG 2.1 nivel AA em interfaces web. Use como checklist de entrega e criterio de aceite em code review.

Adaptado do ui-ux-pro-max-skill (MIT). Fonte: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Baseline obrigatorio: WCAG 2.1 AA. Meta aspiracional: WCAG 2.1 AAA.
Severidades: CRITICA (bloqueia entrega) | ALTA (corrigir antes do deploy) | MEDIA (corrigir no proximo sprint)

---

CONTRASTE DE CORES

- [ ] [CRITICA] Texto normal (abaixo de 18pt / 14pt bold): contraste minimo 4.5:1 entre texto e fundo
- [ ] [CRITICA] Texto grande (18pt+ / 14pt+ bold): contraste minimo 3:1
- [ ] [CRITICA] Componentes de UI (bordas de input, icones funcionais, indicadores de estado): contraste minimo 3:1 vs fundo adjacente
- [ ] [ALTA] Texto sobre imagem ou gradiente: verificar contraste em todas as variacoes possiveis
- [ ] [ALTA] Modo dark/light: verificar contraste em ambos
- [ ] [MEDIA] Texto desabilitado: contraste pode ser menor, mas nao abaixo de 3:1 para legibilidade

Ferramentas de verificacao: axe DevTools, Colour Contrast Analyser, Chrome DevTools Accessibility pane.

---

NAVEGACAO POR TECLADO

- [ ] [CRITICA] Todos os elementos interativos (links, botoes, inputs, selects, checkboxes, radios) focaveis por Tab
- [ ] [CRITICA] Foco nao fica preso em nenhum componente (armadilha de foco) — exceto em modais ativos
- [ ] [CRITICA] Modais e dialogs: foco entra ao abrir, fica dentro enquanto aberto, retorna ao elemento de origem ao fechar
- [ ] [CRITICA] Dropdowns e menus: navegaveis com setas; fecham com Esc
- [ ] [ALTA] Indicador de foco visivel em todos os elementos — outline nao removido sem substituto adequado
- [ ] [ALTA] Tab order segue ordem logica de leitura (top-left para bottom-right no layout de 2 colunas)
- [ ] [ALTA] Skip link "Pular para conteudo principal" como primeiro elemento focavel da pagina
- [ ] [ALTA] Carrosseis e sliders operaveis sem mouse (Next/Prev por teclado)
- [ ] [MEDIA] Atalhos de teclado documentados quando implementados

---

ESTRUTURA E SEMANTICA HTML

- [ ] [CRITICA] Um unico <h1> por pagina representando o titulo principal
- [ ] [CRITICA] Hierarquia de cabecalhos sem pular niveis (h1 → h2 → h3, nunca h1 → h3)
- [ ] [CRITICA] Elementos interativos usam tags semanticas (<button> para acoes, <a> para navegacao) — nunca <div> ou <span> clicaveis sem ARIA equivalente
- [ ] [CRITICA] Listas usam <ul>/<ol>/<li> — nao divs com bullet visual
- [ ] [ALTA] Regioes de pagina marcadas: <header>, <main>, <nav>, <footer>, <aside>
- [ ] [ALTA] Formularios com <fieldset> e <legend> para grupos de campos relacionados
- [ ] [ALTA] Tabelas com <caption>, <th scope="col/row"> para cabecalhos
- [ ] [ALTA] Idioma da pagina declarado no atributo lang do <html>
- [ ] [MEDIA] Mudancas de idioma inline marcadas com lang no elemento pai

---

TEXTOS ALTERNATIVOS E DESCRICOES

- [ ] [CRITICA] Imagens informativas: alt descritivo do conteudo/funcao ("Grafico de barras mostrando crescimento de 30% no Q3")
- [ ] [CRITICA] Imagens decorativas: alt="" (vazio, nao ausente) para que screen reader ignore
- [ ] [CRITICA] Icones funcionais sem texto visivel: aria-label descrevendo a acao ("Fechar dialogo")
- [ ] [ALTA] Icones decorativos ao lado de texto: aria-hidden="true"
- [ ] [ALTA] SVGs inline informativos: <title> e role="img"
- [ ] [ALTA] Botoes com icone apenas: aria-label obrigatorio
- [ ] [MEDIA] Imagens complexas (graficos, diagramas): descricao longa via aria-describedby ou texto proximo

---

ARIA E ROLES

- [ ] [CRITICA] Nao usar role="presentation" ou aria-hidden="true" em elementos focaveis
- [ ] [CRITICA] aria-label, aria-labelledby ou aria-describedby em todos os controles sem label visivel
- [ ] [ALTA] Estados dinamicos comunicados: aria-expanded, aria-selected, aria-checked, aria-disabled
- [ ] [ALTA] Regioes com atualizacao dinamica: aria-live="polite" para notificacoes nao urgentes, aria-live="assertive" apenas para erros criticos
- [ ] [ALTA] Progresso e loading: role="status" ou aria-busy="true" no container em atualizacao
- [ ] [ALTA] Tooltips: role="tooltip" + aria-describedby no elemento que os aciona
- [ ] [MEDIA] Nao sobrescrever semantica nativa com ARIA desnecessario (button ja tem role="button")

---

FORMULARIOS E VALIDACAO

- [ ] [CRITICA] Todo campo com label associada via for/id ou aria-labelledby — placeholder nao substitui label
- [ ] [CRITICA] Mensagens de erro associadas ao campo via aria-describedby
- [ ] [CRITICA] Campos invalidos marcados com aria-invalid="true"
- [ ] [ALTA] Erros anunciados ao screen reader apos submit (via aria-live ou foco no primeiro erro)
- [ ] [ALTA] Campos obrigatorios com aria-required="true" alem do indicador visual
- [ ] [ALTA] Autocomplete com valores padrao WHATWG onde aplicavel (name, email, tel, street-address, etc.)
- [ ] [MEDIA] Instrucoes de formato antes do campo, nao apenas como erro apos falha

---

IMAGENS E MIDIA

- [ ] [CRITICA] Videos com audio: legendas sincronizadas (CC) disponiveis
- [ ] [ALTA] Videos com informacao visual essencial: audiodescricao ou transcricao equivalente
- [ ] [ALTA] Audio autoplay desabilitado — ou com controle de pausar no primeiro elemento focavel
- [ ] [ALTA] Nenhum conteudo com flash/blink acima de 3Hz (risco de convulsao)
- [ ] [MEDIA] Controles de midia acessiveis por teclado (play, pause, volume, legenda)

---

MOVIMENTO E ANIMACAO

- [ ] [CRITICA] @media (prefers-reduced-motion: reduce) implementado — animacoes de entrada/saida, parallax, e scroll effects desativados
- [ ] [ALTA] Animacoes essenciais (ex: indicador de loading) sobrevivem ao reduced-motion; decorativas nao
- [ ] [ALTA] Carrosseis com autoplay: pausar no foco ou hover, e ao ativar prefers-reduced-motion
- [ ] [MEDIA] Duracao de animacoes configuravel por preferencia do sistema (sem hardcode de 2s em animacoes longas)

---

COR COMO UNICO INDICADOR

- [ ] [CRITICA] Status de formulario nao depende apenas de cor (vermelho/verde) — usar icone ou texto adicional
- [ ] [CRITICA] Links no corpo do texto diferenciados do texto comum por mais que cor (sublinhado, bold, ou outro indicador)
- [ ] [ALTA] Graficos com cores: usar padroes, formas ou labels diretas como indicadores adicionais
- [ ] [ALTA] Indicadores de obrigatoriedade de campo: asterisco + legenda "* campo obrigatorio", nao apenas cor

---

ZOOM E TEXTO FLEXIVEL

- [ ] [CRITICA] Interface funcional com zoom de 200% no browser (sem scroll horizontal, sem sobreposicao de texto)
- [ ] [ALTA] Fontes em rem/em, nao px fixo — respeita configuracao de tamanho de fonte do SO
- [ ] [ALTA] Componentes nao quebram com font-size aumentado pelo usuario
- [ ] [MEDIA] Espacamento de texto ajustavel: line-height 1.5x, letter-spacing 0.12em, word-spacing 0.16em sem perda de conteudo

---

CHECKLIST RAPIDO PRE-ENTREGA

- [ ] Rodar axe DevTools na pagina — zero issues criticos
- [ ] Navegar toda a interface apenas com Tab, Shift+Tab, Enter, Esc e setas
- [ ] Desativar CSS e verificar se a ordem de conteudo ainda faz sentido
- [ ] Testar com leitor de tela: NVDA+Firefox (Windows), VoiceOver+Safari (macOS/iOS)
- [ ] Simular daltonismo (Chrome DevTools > Rendering > Emulate vision deficiency)
- [ ] Verificar contraste com Colour Contrast Analyser em elementos criticos
- [ ] Verificar prefers-reduced-motion no browser (Chrome: DevTools > Rendering)
