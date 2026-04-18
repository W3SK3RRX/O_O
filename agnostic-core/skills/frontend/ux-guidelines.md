UX Guidelines

Objetivo: Checklist de qualidade de experiencia do usuario cobrindo 17 categorias. Use para auditar interfaces antes de entregar ou como criterio de aceite durante desenvolvimento.

Adaptado do ui-ux-pro-max-skill (MIT). Fonte: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

Severidades: CRITICA (bloqueia entrega) | ALTA (corrigir antes do deploy) | MEDIA (corrigir no proximo sprint) | BAIXA (melhoria desejavel)

---

NAVEGACAO

- [ ] [CRITICA] Links e botoes descrevem o destino/acao, nao apenas "clique aqui" ou "saiba mais"
- [ ] [CRITICA] Usuario consegue identificar onde esta no sistema (breadcrumb, titulo de pagina, item ativo no menu)
- [ ] [ALTA] Navegacao primaria visivel sem scroll
- [ ] [ALTA] Botao Voltar do browser funciona como esperado em todos os fluxos
- [ ] [ALTA] Links visitados tem estado visual distinto (quando relevante para o contexto)
- [ ] [MEDIA] Menu mobile acessivel com toque unico
- [ ] [MEDIA] Profundidade de navegacao maxima 3 niveis para conteudo principal

---

LAYOUT E ESPACAMENTO

- [ ] [CRITICA] Conteudo principal nao sobrepoem elementos fixos (header, footer, banners de cookie)
- [ ] [ALTA] Hierarquia visual clara: o mais importante tem maior peso visual
- [ ] [ALTA] Espacamento consistente — uso de escala de espacamento (ex: 4px, 8px, 16px, 24px, 32px)
- [ ] [ALTA] Largura maxima de leitura respeitada: 60-75 caracteres por linha em texto corrido
- [ ] [MEDIA] Grid de colunas consistente em toda a interface
- [ ] [MEDIA] Conteudo critico visivel above-the-fold em mobile (375px)

---

RESPONSIVE E BREAKPOINTS

- [ ] [CRITICA] Interface funcional e usavel em 375px (mobile pequeno)
- [ ] [CRITICA] Nenhum elemento com largura fixa que cause scroll horizontal em mobile
- [ ] [ALTA] Tabelas com muitas colunas tem alternativa em mobile (scroll horizontal com indicador, card view, ou colapso de colunas)
- [ ] [ALTA] Imagens nao estouram o container em nenhum breakpoint
- [ ] [ALTA] Formularios usaveis sem pinch-zoom em 375px
- [ ] [MEDIA] Breakpoints testados: 375px / 768px / 1024px / 1440px
- [ ] [MEDIA] Transicao entre breakpoints sem conteudo quebrado em valores intermediarios

---

TOUCH E INTERACAO MOBILE

- [ ] [CRITICA] Alvos tocaveis com minimo de 44x44px (botoes, links, checkboxes, radio buttons)
- [ ] [CRITICA] Elementos tocaveis com espaco de pelo menos 8px entre si
- [ ] [ALTA] Sem hover como unico indicador de acao disponivel (hover nao existe em touch)
- [ ] [ALTA] Gestos customizados tem alternativa de toque simples
- [ ] [MEDIA] Campos de formulario ativam teclado correto (email, tel, number, url)
- [ ] [MEDIA] Formularios sem zoom automatico em iOS (font-size minimo 16px nos inputs)

---

FORMULARIOS

- [ ] [CRITICA] Labels visiveis e associadas ao campo (nao usar apenas placeholder como label)
- [ ] [CRITICA] Mensagens de erro indicam qual campo esta errado e como corrigir
- [ ] [CRITICA] Erros de validacao aparecem inline, proximo ao campo, nao apenas no topo da pagina
- [ ] [ALTA] Campo com erro tem estado visual claro (borda vermelha nao e suficiente sem icone/texto)
- [ ] [ALTA] Campos obrigatorios marcados de forma consistente
- [ ] [ALTA] Submit desativado durante processamento para evitar duplo envio
- [ ] [ALTA] Dados preenchidos preservados apos erro de validacao
- [ ] [MEDIA] Ordem de tab logica no formulario (top-left para bottom-right)
- [ ] [MEDIA] Autocomplete habilitado para campos de dados pessoais (name, email, address)
- [ ] [BAIXA] Progresso indicado em formularios multi-step

---

FEEDBACK E ESTADOS

- [ ] [CRITICA] Toda acao async tem feedback visual de carregamento (spinner, skeleton, progress)
- [ ] [CRITICA] Sucesso e erro de operacoes criticas tem confirmacao explicita ao usuario
- [ ] [ALTA] Estados de loading, empty, error e success implementados para cada lista/tabela
- [ ] [ALTA] Estado empty nao e uma pagina em branco — explica o que fazer
- [ ] [ALTA] Erros de API tem mensagem amigavel, nao stack trace ou codigo HTTP bruto
- [ ] [MEDIA] Feedback de sucesso desaparece automaticamente (max 5s para toasts)
- [ ] [MEDIA] Acoes destrutivas tem confirmacao (modal ou undo, nao apenas "tem certeza?")
- [ ] [BAIXA] Progresso de upload com percentual quando relevante

---

TIPOGRAFIA

- [ ] [CRITICA] Fonte base minima 16px em mobile
- [ ] [CRITICA] Contraste de texto vs fundo: minimo 4.5:1 para texto normal (ver accessibility.md)
- [ ] [ALTA] No maximo 2-3 familias tipograficas na mesma interface
- [ ] [ALTA] Line-height minimo 1.5 para texto corrido
- [ ] [ALTA] Hierarquia de cabecalhos respeitada (h1 → h2 → h3, sem pular niveis)
- [ ] [MEDIA] Fontes carregadas de forma nao-bloqueante (font-display: swap ou optional)
- [ ] [MEDIA] Texto nao em CAPS LOCK para paragrafos (prejudica leitura)

---

ANIMACAO E MOVIMENTO

- [ ] [CRITICA] prefers-reduced-motion respeitado — animacoes essenciais sobrevivem, decorativas param
- [ ] [ALTA] Animacoes de UI abaixo de 300ms para feedback imediato (hover, clique)
- [ ] [ALTA] Transicoes de pagina/rota abaixo de 400ms
- [ ] [ALTA] Nenhum elemento piscando mais de 3 vezes por segundo (risco de convulsao)
- [ ] [MEDIA] Animacoes tem proposito: guiam atencao ou comunicam estado
- [ ] [MEDIA] Loading skeletons mimetizam o layout do conteudo (nao apenas barras genéricas)
- [ ] [BAIXA] Parallax e animacoes de scroll opcionais ou desativadas em mobile

---

PERFORMANCE PERCEBIDA

- [ ] [CRITICA] First Contentful Paint abaixo de 2s em conexao 4G simulada
- [ ] [ALTA] Imagens com width/height definidos para evitar layout shift (CLS)
- [ ] [ALTA] Imagens above-the-fold sem lazy loading
- [ ] [ALTA] Imagens below-the-fold com loading="lazy"
- [ ] [ALTA] Fontes criticas precarregadas (<link rel="preload">)
- [ ] [MEDIA] Indicador de progresso para carregamentos acima de 1s
- [ ] [MEDIA] Conteudo estatico com cache-control adequado

---

CONTEUDO E MICROCOPY

- [ ] [ALTA] CTAs descrevem o resultado da acao ("Salvar alteracoes", nao "OK")
- [ ] [ALTA] Mensagens de erro escritas em primeira pessoa do sistema ("Nao conseguimos...", nao "Erro 500")
- [ ] [ALTA] Textos de placeholder sao exemplos, nao instrucoes (instrucoes vao na label)
- [ ] [MEDIA] Confirmacoes de acao destrutiva nomeiam o objeto afetado ("Excluir usuario Joao?" e melhor que "Confirmar exclusao?")
- [ ] [MEDIA] Terminologia consistente em toda a interface (nao use "salvar" e "gravar" para a mesma acao)
- [ ] [BAIXA] Datas e numeros formatados conforme locale do usuario

---

ONBOARDING E PRIMEIRO USO

- [ ] [ALTA] Estado inicial vazio explica o que fazer (sem "No data found")
- [ ] [ALTA] Primeira acao critica tem caminho claro sem necessidade de documentacao externa
- [ ] [MEDIA] Funcionalidades nao-obvias tem tooltip ou dica contextual
- [ ] [MEDIA] Progresso de configuracao inicial indicado quando ha multiplas etapas
- [ ] [BAIXA] Tutorial ou walkthrough skipavel (nao forcado)

---

BUSCA E FILTROS

- [ ] [ALTA] Campo de busca visivel sem precisar procurar por ele
- [ ] [ALTA] Resultado de busca vazia explica o motivo e sugere alternativas
- [ ] [ALTA] Filtros aplicados ficam visiveis e removiveis individualmente
- [ ] [MEDIA] Busca com debounce (300-500ms) para nao disparar a cada tecla
- [ ] [MEDIA] Estado de busca preservado no URL (permite compartilhar/favoritar resultados)
- [ ] [BAIXA] Sugestoes de busca quando relevante

---

INTERACOES COM AI / CHAT

- [ ] [CRITICA] Respostas de AI marcadas como tal — usuario sabe que nao e humano
- [ ] [ALTA] Indicador de carregamento durante geracao de resposta
- [ ] [ALTA] Usuario pode cancelar geracao em andamento
- [ ] [ALTA] Fallback claro quando AI nao consegue responder (sem "An error occurred")
- [ ] [MEDIA] Limite de caracteres da entrada visivel antes de atingi-lo
- [ ] [MEDIA] Historico de conversa paginado ou com scroll virtualizado para sessoes longas
- [ ] [BAIXA] Opcao de regenerar/tentar novamente a ultima resposta

---

ACESSIBILIDADE (resumo — ver skills/frontend/accessibility.md para checklist completo)

- [ ] [CRITICA] Todos os elementos interativos acessiveis por teclado
- [ ] [CRITICA] Imagens informativas com alt text descritivo
- [ ] [CRITICA] Campos de formulario com labels associadas via for/id ou aria-label
- [ ] [ALTA] Foco visivel em todos os elementos interativos
- [ ] [ALTA] Cor nao e o unico indicador de estado
