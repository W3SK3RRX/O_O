# Princípios de Interface

Ideias de UX/UI que valem consultar ao projetar ou revisar interfaces.
Nenhuma delas é obrigatória — avalie o que faz sentido para o seu contexto.

---

## Hierarquia visual

- O elemento mais importante da tela deve ser visualmente o mais destacado
- Contraste e tamanho guiam o olhar; evite dar o mesmo peso a tudo
- Agrupe elementos relacionados (Gestalt: proximidade e similaridade)
- Espaço em branco não é desperdício — ele organiza e respira

## Tipografia

- Fonte mínima em mobile: 16px (abaixo disso os navegadores mobile fazem zoom automático)
- Limite de ~60-75 caracteres por linha para boa leitura em desktop
- Hierarquia clara: h1 → h2 → body; evite mais de 3 tamanhos de fonte por tela
- Line-height entre 1.4–1.6 para texto corrido

## Cores

- Nunca use cor como único indicador de estado (pense em daltonismo)
- Contraste mínimo WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande (18px+ ou negrito 14px+)
- Defina paleta em variáveis CSS — não hardcode cores inline
- Estados (hover, focus, disabled, error) precisam ser visualmente distintos

## Responsividade

- Mobile-first: projete para tela pequena primeiro, expanda para telas maiores
- Breakpoints comuns como referência: 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
- Toque: área mínima clicável de 44x44px (recomendação Apple/WCAG)
- Evite hover como única forma de revelar conteúdo (não funciona em toque)

## Estados de interface

Toda interface precisa de estados para: carregando, vazio, erro e sucesso.
Sem eles, o usuário não sabe o que está acontecendo.

- **Loading:** skeleton, spinner ou placeholder — nunca tela em branco
- **Vazio:** explique por que está vazio e o que o usuário pode fazer
- **Erro:** mensagem útil (o que aconteceu + o que fazer), nunca só "erro"
- **Sucesso:** confirmação clara de que a ação foi concluída

## Feedback ao usuário

- Ações devem ter resposta imediata (< 100ms para feedback visual)
- Botões de envio devem ser desabilitados durante processamento para evitar duplo clique
- Microinterações (transições suaves, animações de confirmação) reduzem sensação de lentidão
- Toasts/notificações: breves (3–5s), dispensáveis, não bloqueantes

## Formulários

- Mostre erros próximos ao campo com problema, não só no topo da página
- Labels sempre visíveis (placeholder não substitui label — some ao digitar)
- Ordem lógica de campos: do mais fácil ao mais específico
- Autofill, autocomplete e type correto (`type="email"`, `type="tel"`) economizam tempo do usuário

## Navegação

- O usuário deve sempre saber onde está (breadcrumbs, item ativo no menu, título de página)
- Máximo de 7±2 itens num menu principal (limite de memória de trabalho)
- Links e botões devem parecer clicáveis (sublinhado em links, aparência de botão em ações)
- Back button deve funcionar como esperado — evite navegação que quebre o histórico

## Modais e overlays

Modais têm custo de contexto — use com critério:

- Bom uso: confirmações destrutivas, formulários curtos sem saída de contexto
- Evite: fluxos longos, navegação dentro de modal, modais que abrem modais
- Sempre ofereça saída clara (X, ESC, clique fora)
- Bloqueie scroll do fundo quando modal estiver aberto

## Acessibilidade básica

- Foco visível: nunca remova `outline` sem substituir por alternativa visível
- Tab order lógico seguindo o fluxo visual da página
- Imagens decorativas: `alt=""`. Imagens informativas: `alt` descritivo
- Ícones como único conteúdo: adicionar `aria-label` ou texto visualmente oculto

---

Ver também: `skills/frontend/html-css-audit.md`, `skills/frontend/css-governance.md`
