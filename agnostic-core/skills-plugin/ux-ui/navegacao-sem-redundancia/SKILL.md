---
name: navegacao-sem-redundancia
description: 'Padroes de navegacao sem redundancia: hierarquia, acesso direto, consistencia'
---

## A pergunta central

> **"Esse ponto de acesso já existe em outro lugar igualmente acessível?"**

Se sim — e o contexto de uso for o mesmo — é redundância. Remove o de menor alcance.

---

## Checklist de Redundância

### Atalhos e Botões Duplicados

- [ ] Botão fixo na tela **+** atalho de teclado **+** item de menu para a mesma ação no mesmo contexto?
- [ ] FAB ou botão sticky que duplica ação já visível no header/nav?
- [ ] "Criar novo" em múltiplos pontos da mesma tela sem diferença contextual real?
- [ ] Links no breadcrumb que duplicam o item de menu lateral já visível e ativo?
- [ ] Botão "Voltar" onde o browser já provê navegação e a URL é acessível diretamente?

### Menus e Estrutura de Navegação

- [ ] Item de menu que leva à mesma rota de outro item com nome diferente?
- [ ] Dropdown com opções que são subpáginas já listadas no conteúdo da tela atual?
- [ ] Tabs que poderiam ser seções com scroll sem perda de contexto para o usuário?
- [ ] Sidebar **e** topbar com os mesmos atalhos de navegação primária?
- [ ] "Acesso rápido" ou "Favoritos" duplicando o menu principal sem personalização real?

### Ações em Tabelas e Listas

- [ ] Ação disponível no hover da linha **+** no menu de contexto **+** no toolbar — mesmo item, mesmo contexto?
- [ ] Botão de edição na linha **+** double-click na linha fazendo exatamente a mesma coisa?
- [ ] "Ver detalhes" em modal **+** link no nome do item que abre a mesma página de detalhe?

### Formulários e Modais

- [ ] Botão "Salvar" no topo **e** no rodapé de formulário curto (< 6 campos)?
- [ ] Modal de confirmação para ação de baixo risco que já tem undo disponível?
- [ ] Campo de busca global no header **+** filtro local fazendo a mesma coisa no mesmo escopo?

### Notificações e Feedback

- [ ] Toast **+** badge **+** item na lista de notificações para o mesmo evento?
- [ ] Tooltip que repete exatamente o label do botão (label já é autoexplicativo)?
- [ ] Mensagem de erro inline **+** alert banner no topo para o mesmo erro de formulário?

---

## Critério de Julgamento

Para cada redundância encontrada, aplique:

```
[AÇÃO] — aparece em [local A] e em [local B]

Contexto diferente?
  Sim → mantém ambos, torna a diferença visualmente clara
  Não → remove o de menor alcance

Regra: o acesso mais próximo do contexto do usuário vence.
```

**Dois pontos de acesso só se justificam se:**
1. O contexto ou público de uso for genuinamente diferente (ex: mobile vs desktop)
2. A frequência de uso for alta o suficiente para justificar atalho extra (ação repetida dezenas de vezes/dia)
3. A ação for crítica e irreversível (ex: exclusão em massa, operação financeira)

**"Pode ser útil para alguns"** não é justificativa — é conveniência disfarçada de contexto.

---

## Diagnóstico e Relatório

Formato de entrega após análise:

```
## Diagnóstico de Navegação — [Nome da tela / fluxo]

### 🔴 Redundância crítica (remove agora)
- [ação] — aparece em [local A] e [local B]
- Contexto igual → mantém [local A], remove [local B]
- Motivo: [por que o local B não agrega]

### 🟡 Redundância aceitável (torna a diferença clara)
- [ação] — aparece em [local A] e [local B]
- Contextos levemente diferentes → mantém, mas diferencia visualmente
- Sugestão: [como tornar a diferença óbvia para o usuário]

### 🟢 Acesso múltiplo justificado
- [ação] — contextos genuinamente diferentes
- Motivo: [por que faz sentido ter os dois]

### Estimativa de impacto
- X pontos de acesso redundantes removidos
- Y ações com acesso único e claro resultante
- Z elementos de UI eliminados (botões, menus, tooltips)
```

---

## Padrões — Antes/Depois

### FAB + Botão no Header (mesmo destino)

```
❌ Dashboard financeiro:
   Header: [Novo Lançamento]
   Canto inferior: FAB ➕ (também cria novo lançamento)

✅ Remove o FAB.
   Botão no header está sempre visível. FAB é para mobile/scroll longo.
   Se o botão principal sempre aparece, o FAB é duplicata.
```

---

### Sidebar + Topbar iguais

```
❌ Sidebar:  Dashboard | Relatórios | Configurações | Usuários
   Topbar:   Dashboard | Relatórios | Configurações | Usuários

✅ Sidebar:  navegação de destino (Dashboard, Relatórios, Usuários)
   Topbar:   ações de sessão (perfil, notificações, logout)

Regra: sidebar = onde vou. Topbar = quem sou e o que faço globalmente.
```

---

### "Ver detalhes" em 3 lugares da linha

```
❌ Tabela — linha do Pedido #1042:
   Nome do pedido (clicável → abre detalhe)
   Ícone 👁 "Ver detalhes" (também abre detalhe)
   Menu ⋮ → "Abrir" (também abre detalhe)

✅ Nome do pedido (clicável → abre detalhe)   ← padrão universal
   Menu ⋮ → "Editar" | "Excluir"             ← ações distintas, não duplicatas
```

---

### Modal de confirmação + Undo

```
❌ Usuário clica "Arquivar"
   → Modal: "Tem certeza? [Cancelar] [Confirmar]"
   → Após confirmar: Toast "Arquivado [Desfazer]"

   Confirmação + undo = redundância. Os dois existem para o mesmo medo.

✅ Usuário clica "Arquivar"
   → Ação executada imediatamente
   → Toast "Arquivado [Desfazer]" (5–8 segundos)

Regra: se tem undo, não precisa de confirmação.
       Se tem confirmação, o undo é secondary.
       Nunca os dois com igual destaque para a mesma ação.
```

---

### Notificação em três canais

```
❌ Pedido aprovado:
   Badge no ícone (+1)
   Toast: "Pedido #1042 aprovado"
   Item na lista de notificações
   E-mail de confirmação
   → Tudo para o mesmo evento, ao mesmo tempo

✅ Badge: indicador passivo de não-lidos
   Lista de notificações: detalhe sob demanda
   Toast: apenas para ações que O PRÓPRIO USUÁRIO acabou de fazer
   E-mail: apenas para eventos críticos ou usuário offline

Regra: toast ≠ notificação. Toast é feedback de ação própria.
       Notificação é evento externo. Nunca os dois para o mesmo gatilho.
```

---

### Tabs vs Scroll

```
❌ Configurações com tabs:
   [Geral] [Notificações] [Privacidade] [Aparência]
   Cada tab tem 3–5 campos. Total: ~20 campos na página inteira.

✅ Página única com seções e scroll:
   ## Geral
   ## Notificações
   ## Privacidade
   ## Aparência

Regra: tabs existem para conteúdo que não faz sentido ver junto.
       Se o usuário normalmente quer revisar múltiplas seções, scroll é melhor.
```

---

## Perguntas de auditoria rápida

Para cada elemento interativo na tela:

**1. "Se eu remover isso, onde o usuário faz essa ação?"**
- Resposta "no mesmo lugar, de outra forma" → é redundante
- Resposta "precisaria navegar para outro lugar" → pode justificar

**2. "Quem usa isso e com qual frequência?"**
- Ação frequente + caminho longo = atalho justificado
- Ação rara + caminho curto = atalho é ruído

**3. "O contexto é realmente diferente?"**
- Mobile vs desktop = diferente ✓
- Logado vs visitante = diferente ✓
- "Pode ser útil para alguns" = igual, remove

