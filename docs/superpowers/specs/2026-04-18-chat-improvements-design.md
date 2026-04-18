# Design: Chat UI Improvements + Notification System
**Data:** 2026-04-18

---

## Escopo

Três melhorias no projeto chat (Node.js + Express + Socket.io / React + Vite + Zustand):

1. **Cards de conversa** — exibir nome do outro participante + layout compacto com badge de não lidas
2. **Toast in-app** — notificação visual quando chega mensagem com app aberto
3. **Web Push** — notificação do sistema operacional quando app está minimizado/outra aba

---

## 1 — Cards de Conversa (ChatList)

### Layout escolhido: Grid Compacto (Opção C)

```
┌─────────────────────────────┬───────┐
│ Nome do Participante        │ 14:32 │
│ > última mensagem truncada  │  [3]  │
└─────────────────────────────┴───────┘
```

- Grid 2×2: `grid-template-columns: 1fr auto; grid-template-rows: auto auto`
- Nome extraído dos `participants` populados (filtrando o próprio usuário)
- Horário da `lastMessage.createdAt`
- Badge `[N]` só aparece quando `unreadCount > 0`
- Conversa com nova mensagem recebe `border-color: var(--accent)`
- `min-height: 52px`

### Contagem de não lidas

- Campo `unreadCount` computado no `chat.store` localmente
- Incrementado ao receber `newMessage` via socket (se não for da conversa ativa)
- Zerado ao entrar na conversa (`markConversationRead`)
- Persistido apenas em memória (sem backend — reseta ao recarregar)

---

## 2 — Toast In-App

### Comportamento

- Aparece no **canto inferior direito** da tela
- Exibe: tag `[NOVA MENSAGEM]`, nome do remetente, preview da mensagem (truncado)
- Auto-dismiss em **5 segundos** com barra de progresso
- Clique navega à conversa correspondente
- Não aparece se o usuário já está na conversa em questão
- Múltiplos toasts empilham (máximo 3 visíveis)

### Componente

- `src/components/ToastNotification.jsx` — componente individual
- `src/components/ToastContainer.jsx` — gerencia lista e posicionamento
- `src/store/notification.store.js` — estado global (Zustand): `{ toasts, addToast, removeToast }`
- Integrado no `App.jsx` (sempre presente)
- Acionado pelo handler `newMessage` no socket store ou em `Chat.jsx`

---

## 3 — Web Push Notifications

### Frontend

- `public/sw.js` — service worker que intercepta eventos `push` e exibe notificação
- `src/utils/pushManager.js` — abstração: `requestPermission()`, `subscribeToPush()`, `unsubscribeFromPush()`
- Permissão solicitada **após login bem-sucedido** (não na abertura do app)
- Subscription enviada para `POST /api/push/subscribe` com token JWT
- Click na notificação abre `/chat/:conversationId`

### Backend

- **VAPID keys** geradas via `web-push` CLI e armazenadas em `.env` (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`)
- `src/models/PushSubscription.js` — campos: `userId`, `subscription` (endpoint + keys), `createdAt`
- `src/routes/push.routes.js` — `POST /api/push/subscribe`, `DELETE /api/push/unsubscribe`
- `src/controllers/pushController.js` — salva/remove subscription
- `src/services/pushService.js` — `sendPushNotification(userId, payload)` usando `web-push`
- Disparo: no handler `sendMessage` do socket (server.js), após salvar a mensagem, notificar cada participante exceto o remetente

### Payload da notificação push

```json
{
  "title": "Nome do remetente",
  "body": "preview da mensagem (50 chars)",
  "data": { "conversationId": "..." }
}
```

### Segurança

- Subscription vinculada ao `userId` via JWT — não aceita subscriptions sem autenticação
- Ao deletar usuário, remover suas subscriptions

---

## Arquivos a criar/modificar

### Backend
| Ação | Arquivo |
|------|---------|
| Criar | `src/models/PushSubscription.js` |
| Criar | `src/routes/push.routes.js` |
| Criar | `src/controllers/pushController.js` |
| Criar | `src/services/pushService.js` |
| Modificar | `src/app.js` — registrar push.routes |
| Modificar | `src/server.js` — chamar pushService após salvar mensagem |
| Modificar | `.env` — adicionar VAPID vars |

### Frontend
| Ação | Arquivo |
|------|---------|
| Criar | `public/sw.js` |
| Criar | `src/utils/pushManager.js` |
| Criar | `src/store/notification.store.js` |
| Criar | `src/components/ToastNotification.jsx` |
| Criar | `src/components/ToastContainer.jsx` |
| Modificar | `src/pages/ChatList.jsx` — novo layout card C + badge |
| Modificar | `src/store/chat.store.js` — unreadCount por conversa |
| Modificar | `src/socket/socket.client.js` ou handler — acionar toast + incrementar unread |
| Modificar | `src/contexts/AuthContext.jsx` ou login flow — solicitar permissão push |
| Modificar | `src/App.jsx` — incluir ToastContainer |

---

## Fora do escopo

- Persistência de não lidas no backend (badge reseta ao recarregar — aceitável)
- Notificação para grupos (apenas DMs — grupos têm múltiplos participantes, lógica diferente)
- Configurações de notificação por usuário (ligar/desligar por conversa)
