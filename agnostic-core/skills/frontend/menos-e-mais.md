---
title: Menos é Mais — Auditoria de Interface
description: Protocolo de auditoria para reduzir poluição visual: remover redundâncias, simplificar hierarquia e entregar interfaces limpas
category: frontend
tags: [ux, ui, audit, design, simplicity]
---

# Menos é Mais — Auditoria de Interface

## Quando Aplicar

- Novo componente antes de PR
- PR de frontend em revisão
- Reclamação de "tela poluída" ou "parece confusa"
- Após adicionar nova feature a uma tela existente

## Protocolo (5 perguntas)

Antes de aprovar qualquer interface, responda:

1. **Removi o que não preciso?** — cada elemento justifica sua presença?
2. **A hierarquia é óbvia?** — o usuário sabe onde olhar primeiro?
3. **Há redundância de informação?** — o mesmo dado aparece duas vezes?
4. **Há redundância de ação?** — o mesmo botão/link em dois lugares?
5. **A tela respira?** — existe espaço em branco suficiente?

## Checklist de Auditoria

### Densidade de Informação
- [ ] Cada bloco de texto tem propósito único
- [ ] Rótulos desnecessários removidos (o contexto já explica)
- [ ] Datas/números formatados de forma consistente — um padrão por tela
- [ ] Tooltips apenas onde o conteúdo não cabe inline

### Hierarquia Visual
- [ ] Um único elemento de maior destaque por seção
- [ ] Tamanhos de fonte seguem escala (não misturar 3+ tamanhos em bloco)
- [ ] Cores de ênfase usadas com parcimônia (1-2 por tela)
- [ ] Ícones com propósito semântico, não decorativo

### Redundância de Ações
- [ ] Nenhum botão duplicado na mesma tela (ex: "Salvar" no topo e no rodapé sem necessidade)
- [ ] Navegação não repete items de menu em breadcrumb sem valor
- [ ] Links não apontam para a própria página atual

### Redundância de Navegação
Ver: `skills/ux-ui/navegacao-sem-redundancia.md`

### Componentes e Badges
- [ ] Badge de notificação não exibido quando count = 0
- [ ] Status em texto + cor é aceitável (acessibilidade), mas texto + ícone + cor = excesso
- [ ] Tabelas não exibem coluna "Ações" com 5+ botões — agrupar em menu

### Espaçamento e Respiração
- [ ] Padding interno consistente (seguir escala: 4/8/12/16/24/32px)
- [ ] Elementos não colados às bordas em mobile
- [ ] Cards com hierarquia interna clara (título → dado principal → dado secundário → ação)

## Anti-Padrões Frequentes

| Anti-padrão | Sintoma | Correção |
|---|---|---|
| Badge Inflation | Badges em todo lugar — a urgência perde significado | Reservar badges para notificações reais e não-lidas |
| CTA Overload | 4+ botões primários visíveis | Um CTA primário por seção, resto como links/secundários |
| Icon Soup | Ícone em cada item de lista, botão e rótulo | Ícones apenas onde substituem texto com ganho real |
| Data Vomit | Todos os campos do banco na tela | Mostrar apenas o que o usuário precisa no contexto atual |
| Empty-State Void | Tela vazia sem explicação | Estado vazio com mensagem e ação |
| Loading Clutter | Spinner global que bloqueia tudo | Skeleton inline por seção, não overlay de página |

## Integração com Anti-Frankenstein

A auditoria "Menos é Mais" vem **antes** da implementação — define o que construir.
`skills/frontend/anti-frankenstein.md` vem **durante** — define como construir sem duplicar CSS.

## Referência Cruzada

- `skills/ux-ui/navegacao-sem-redundancia.md` — foco em menus e rotas
- `skills/ux-ui/principios-de-interface.md` — hierarquia visual e tipografia
- `skills/ux-ui/ui-ux-quality-gates.md` — 5 gates de qualidade de interface
- `skills/frontend/anti-frankenstein.md` — governança CSS antes de escrever
