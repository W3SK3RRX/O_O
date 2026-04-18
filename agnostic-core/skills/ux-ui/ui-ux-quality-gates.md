# UI/UX Quality Gates

Gates de qualidade obrigatórios para entregas de interface frontend.
Antes de considerar uma interface "pronta", ela deve passar por estes 5 gates.
Aplique em qualquer stack ou framework — o foco é na experiência do usuário, não na tecnologia.

---

## Gate 1 — Visual Hierarchy (Hierarquia Visual)

- [ ] Título principal é o elemento mais proeminente da página
- [ ] Existe sequência clara: título → subtítulo → conteúdo → ações
- [ ] Elementos secundários não competem visualmente com o conteúdo principal
- [ ] Espaçamento entre seções cria agrupamento lógico
- [ ] O olhar do usuário segue um caminho previsível (F-pattern ou Z-pattern)

Exemplo: numa página de listagem, o título da seção deve ter mais peso visual que os filtros,
e os filtros mais peso que os rodapés de paginação.

## Gate 2 — Interaction Feedback (Feedback de Interação)

- [ ] Todo elemento clicável tem hover state visível
- [ ] Botões têm estados: default, hover, active, disabled
- [ ] Ações destrutivas (excluir, cancelar, resetar) pedem confirmação
- [ ] Loading states existem para todas as operações assíncronas
- [ ] Transições são suaves (não instantâneas) — entre 150ms e 300ms
- [ ] Formulários mostram feedback de validação próximo ao campo com erro

Exemplo: ao submeter um formulário de cadastro, o botão entra em estado de loading,
campos inválidos mostram mensagem inline, e o sucesso exibe confirmação clara.

## Gate 3 — Data Presentation (Apresentação de Dados)

- [ ] Números grandes usam formatação legível (separadores de milhar)
- [ ] Tabelas e listas têm ordenação lógica (não aleatória)
- [ ] Estados vazios têm mensagem útil e ação sugerida (não tela em branco)
- [ ] Dados de comparação mostram contexto (vs média, vs período anterior)
- [ ] Valores monetários mostram símbolo da moeda consistentemente
- [ ] Datas e horários seguem o formato do locale do usuário

Exemplo: uma tabela de resultados vazia mostra "Nenhum registro encontrado"
com sugestão de ação ("tente ajustar os filtros"), não apenas uma área em branco.

## Gate 4 — Responsive & Accessible

- [ ] Layout funciona de 320px (mobile) até 1920px (desktop)
- [ ] Touch targets têm mínimo 44x44px em mobile
- [ ] Contraste de texto passa WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)
- [ ] Fontes não ficam menores que 14px em mobile
- [ ] Scroll horizontal não existe em nenhum breakpoint
- [ ] Navegação por teclado funciona em ordem lógica (tab order)
- [ ] Foco visível em todos os elementos interativos

Exemplo: um card de dashboard que funciona bem em desktop deve reorganizar
seus elementos em coluna única no mobile, mantendo legibilidade e toque confortável.

## Gate 5 — Emotional Design (Design Emocional)

- [ ] A página tem pelo menos um elemento que surpreende positivamente
- [ ] Micro-interações existem em ações importantes (salvar, completar, conquistar)
- [ ] A paleta de cores transmite o tom correto para o contexto da aplicação
- [ ] Tipografia cria personalidade (não é genérica/padrão do sistema)
- [ ] O usuário sente que o produto tem "craft" / cuidado

Exemplo: um ícone animado ao completar uma tarefa, uma transição suave ao expandir
um painel, ou um empty state ilustrado que humaniza a interface.

---

## Checklist de Validação

Antes de entregar qualquer interface, rode este checklist:

```
✅/❌ Gate 1 — Visual Hierarchy
✅/❌ Gate 2 — Interaction Feedback
✅/❌ Gate 3 — Data Presentation
✅/❌ Gate 4 — Responsive & Accessible
✅/❌ Gate 5 — Emotional Design
```

**Mínimo para entrega:** Gates 1–4 passando. Gate 5 é o diferencial de qualidade.

Uma interface que passa Gates 1–4 é funcional e profissional.
Uma interface que passa todos os 5 gates cria conexão emocional com o usuário.

---

## Sinais de risco alto

- Interface entregue sem testar em mobile (Gate 4 ignorado)
- Botões sem nenhum estado visual além do default (Gate 2 ignorado)
- Telas de lista sem estado vazio definido (Gate 3 ignorado)
- Todos os textos com mesmo peso visual — sem hierarquia (Gate 1 ignorado)
- Ação destrutiva executada sem confirmação (Gate 2 ignorado)
- Contraste insuficiente em textos sobre imagens ou fundos coloridos (Gate 4 ignorado)

---

Ver também: `skills/ux-ui/principios-de-interface.md`, `skills/frontend/html-css-audit.md`, `skills/frontend/accessibility.md`, `skills/frontend/ux-guidelines.md`
