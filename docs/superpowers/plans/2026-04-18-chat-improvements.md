# Chat Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Exibir nome do participante nos cards de conversa, tornar os cards compactos com badge de não lidas, adicionar toast in-app e Web Push notifications.

**Architecture:** Backend recebe subscriptions Web Push e dispara via `web-push` ao salvar mensagem no socket. Frontend usa Zustand para estado de toasts e unread counts; service worker intercepta push e exibe notificação do sistema.

**Tech Stack:** Node.js/Express/Socket.io · Mongoose · `web-push` · React/Vite · Zustand · Service Worker API · Web Push API

---

## Task 1: Instalar web-push e gerar VAPID keys

**Files:**
- Modify: `mensagens-backend/package.json` (via npm install)
- Modify: `mensagens-backend/.env`

- [ ] **1.1 Instalar web-push**

```bash
cd mensagens-backend && npm install web-push
```

- [ ] **1.2 Gerar VAPID keys**

```bash
cd mensagens-backend && npx web-push generate-vapid-keys
```

Copie o output. Exemplo:
```
Public Key: BNx...abc
Private Key: xyz...123
```

- [ ] **1.3 Adicionar ao .env**

Abra `mensagens-backend/.env` e adicione:
```
VAPID_PUBLIC_KEY=BNx...abc
VAPID_PRIVATE_KEY=xyz...123
VAPID_SUBJECT=mailto:admin@o-o.com.br
```

- [ ] **1.4 Adicionar ao config/env.js**

Edite `mensagens-backend/src/config/env.js` — adicione no schema:
```js
VAPID_PUBLIC_KEY: z.string().min(1),
VAPID_PRIVATE_KEY: z.string().min(1),
VAPID_SUBJECT: z.string().min(1),
```

- [ ] **1.5 Commit**

```bash
cd mensagens-backend && git add package.json package-lock.json src/config/env.js
git commit -m "chore(backend): add web-push dependency and VAPID env schema"
```

---

## Task 2: Model PushSubscription

**Files:**
- Create: `mensagens-backend/src/models/PushSubscription.js`

- [ ] **2.1 Criar o model**

Crie `mensagens-backend/src/models/PushSubscription.js`:
```js
import mongoose from 'mongoose';

const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  subscription: {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth:   { type: String, required: true },
    },
  },
}, { timestamps: true });

// Garante uma subscription por endpoint por usuário
pushSubscriptionSchema.index({ userId: 1, 'subscription.endpoint': 1 }, { unique: true });

export default mongoose.model('PushSubscription', pushSubscriptionSchema);
```

- [ ] **2.2 Commit**

```bash
git add mensagens-backend/src/models/PushSubscription.js
git commit -m "feat(backend): add PushSubscription model"
```

---

## Task 3: Push Service (envio de notificações)

**Files:**
- Create: `mensagens-backend/src/services/pushService.js`

- [ ] **3.1 Criar o service**

Crie `mensagens-backend/src/services/pushService.js`:
```js
import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import log from '../config/logger.js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export const sendPushToUser = async (userId, payload) => {
  const subs = await PushSubscription.find({ userId });
  if (!subs.length) return;

  const payloadStr = JSON.stringify(payload);

  await Promise.allSettled(
    subs.map(async (doc) => {
      try {
        await webpush.sendNotification(doc.subscription, payloadStr);
      } catch (err) {
        // Subscription expirada ou inválida — remover
        if (err.statusCode === 410 || err.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: doc._id });
          log.info({ userId, endpoint: doc.subscription.endpoint }, 'Push subscription removida (expirada)');
        } else {
          log.warn({ err: err.message, userId }, 'Erro ao enviar push');
        }
      }
    })
  );
};
```

- [ ] **3.2 Commit**

```bash
git add mensagens-backend/src/services/pushService.js
git commit -m "feat(backend): add push notification service with VAPID"
```

---

## Task 4: Push Controller e Rotas

**Files:**
- Create: `mensagens-backend/src/controllers/pushController.js`
- Create: `mensagens-backend/src/routes/push.routes.js`

- [ ] **4.1 Criar o controller**

Crie `mensagens-backend/src/controllers/pushController.js`:
```js
import PushSubscription from '../models/PushSubscription.js';
import log from '../config/logger.js';

export const subscribe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { subscription } = req.body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'Subscription inválida' } });
    }

    await PushSubscription.findOneAndUpdate(
      { userId, 'subscription.endpoint': subscription.endpoint },
      { userId, subscription },
      { upsert: true, new: true }
    );

    log.info({ userId }, 'Push subscription salva');
    res.status(201).json({ message: 'Subscription registrada' });
  } catch (err) {
    next(err);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { endpoint } = req.body;

    await PushSubscription.deleteOne({ userId, 'subscription.endpoint': endpoint });

    log.info({ userId }, 'Push subscription removida');
    res.json({ message: 'Subscription removida' });
  } catch (err) {
    next(err);
  }
};
```

- [ ] **4.2 Criar as rotas**

Crie `mensagens-backend/src/routes/push.routes.js`:
```js
import express from 'express';
import { subscribe, unsubscribe } from '../controllers/pushController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', protect, subscribe);
router.delete('/unsubscribe', protect, unsubscribe);

export default router;
```

- [ ] **4.3 Registrar no app.js**

Edite `mensagens-backend/src/app.js` — adicione import e rota:
```js
import pushRoutes from './routes/push.routes.js';
// ... (após as outras rotas)
app.use('/api/push', pushRoutes);
```

- [ ] **4.4 Expor VAPID public key no endpoint de auth**

Edite `mensagens-backend/src/controllers/authController.js` — adicione em `getMe`:
```js
// No objeto retornado:
vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
```

E também no `login` e `register` — no objeto de resposta, adicione:
```js
vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
```

- [ ] **4.5 Commit**

```bash
git add mensagens-backend/src/controllers/pushController.js \
        mensagens-backend/src/routes/push.routes.js \
        mensagens-backend/src/app.js \
        mensagens-backend/src/controllers/authController.js
git commit -m "feat(backend): add push subscribe/unsubscribe endpoints"
```

---

## Task 5: Disparar push ao receber mensagem no socket

**Files:**
- Modify: `mensagens-backend/src/server.js`

- [ ] **5.1 Importar pushService e Conversation no server.js**

Em `mensagens-backend/src/server.js`, o import de `Conversation` já existe. Adicione:
```js
import { sendPushToUser } from './services/pushService.js';
```

- [ ] **5.2 Disparar push no handler sendMessage**

Dentro do `socket.on("sendMessage", ...)`, após `io.to(conversationId).emit("newMessage", {...})`, adicione:

```js
// Notificar participantes offline via Web Push
const fullConversation = await Conversation.findById(conversationId)
  .populate('participants', 'name');

if (fullConversation) {
  const senderIdStr = socket.user._id.toString();
  const senderName = socket.user.name;
  const preview = cipherText.slice(0, 50); // texto criptografado (só para trigger)

  for (const participant of fullConversation.participants) {
    if (participant._id.toString() === senderIdStr) continue;

    sendPushToUser(participant._id, {
      title: senderName,
      body: 'Nova mensagem recebida',
      data: { conversationId },
    }).catch(err => log.warn({ err: err.message }, 'Erro ao disparar push'));
  }
}
```

> **Nota:** O body da push é genérico ("Nova mensagem recebida") porque o conteúdo é criptografado e não pode ser descriptografado no servidor.

- [ ] **5.3 Commit**

```bash
git add mensagens-backend/src/server.js
git commit -m "feat(backend): dispatch web push on new socket message"
```

---

## Task 6: Service Worker (Frontend)

**Files:**
- Create: `mensagens-frontend/public/sw.js`

- [ ] **6.1 Criar o service worker**

Crie `mensagens-frontend/public/sw.js`:
```js
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title ?? 'o_o';
  const options = {
    body: data.body ?? 'Nova mensagem',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: data.data ?? {},
    tag: data.data?.conversationId ?? 'msg',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const conversationId = event.notification.data?.conversationId;
  const url = conversationId ? `/chat/${conversationId}` : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
```

- [ ] **6.2 Commit**

```bash
git add mensagens-frontend/public/sw.js
git commit -m "feat(frontend): add service worker for web push notifications"
```

---

## Task 7: Push Manager (utilitário frontend)

**Files:**
- Create: `mensagens-frontend/src/utils/pushManager.js`

- [ ] **7.1 Criar o utilitário**

Crie `mensagens-frontend/src/utils/pushManager.js`:
```js
import api from '../api/axios.js';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

export const registerPush = async (vapidPublicKey) => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    await sendSubscriptionToServer(existing);
    return;
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  });

  await sendSubscriptionToServer(subscription);
};

const sendSubscriptionToServer = async (subscription) => {
  await api.post('/push/subscribe', { subscription });
};

export const unregisterPush = async () => {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  if (!registration) return;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    await api.delete('/push/unsubscribe', { data: { endpoint: subscription.endpoint } });
  }
};
```

- [ ] **7.2 Commit**

```bash
git add mensagens-frontend/src/utils/pushManager.js
git commit -m "feat(frontend): add push manager utility"
```

---

## Task 8: Notification Store (Zustand)

**Files:**
- Create: `mensagens-frontend/src/store/notification.store.js`

- [ ] **8.1 Criar o store**

Crie `mensagens-frontend/src/store/notification.store.js`:
```js
import { create } from 'zustand';

let nextId = 0;

export const useNotificationStore = create((set, get) => ({
  toasts: [],

  addToast: ({ senderName, preview, conversationId }) => {
    const id = ++nextId;
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, senderName, preview, conversationId }],
    }));
    setTimeout(() => get().removeToast(id), 5000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
```

> Máximo 3 toasts visíveis (`slice(-2)` mantém os 2 anteriores + 1 novo).

- [ ] **8.2 Commit**

```bash
git add mensagens-frontend/src/store/notification.store.js
git commit -m "feat(frontend): add notification store for toast management"
```

---

## Task 9: Componentes Toast

**Files:**
- Create: `mensagens-frontend/src/components/ToastNotification.jsx`
- Create: `mensagens-frontend/src/components/ToastContainer.jsx`

- [ ] **9.1 Criar ToastNotification.jsx**

Crie `mensagens-frontend/src/components/ToastNotification.jsx`:
```jsx
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notification.store';

export default function ToastNotification({ toast }) {
  const navigate = useNavigate();
  const removeToast = useNotificationStore((s) => s.removeToast);

  const handleClick = () => {
    removeToast(toast.id);
    navigate(`/chat/${toast.conversationId}`);
  };

  return (
    <div style={styles.toast} onClick={handleClick}>
      <div style={styles.tag}>[NOVA MENSAGEM]</div>
      <div style={styles.name}>{toast.senderName}</div>
      <div style={styles.preview}>{toast.preview}</div>
      <button
        style={styles.close}
        onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
        aria-label="Fechar"
      >
        ×
      </button>
      <div style={styles.progressBar} />
    </div>
  );
}

const styles = {
  toast: {
    position: 'relative',
    width: 280,
    border: '1px solid var(--accent)',
    background: 'rgba(1,12,8,0.97)',
    boxShadow: '0 0 16px rgba(0,255,90,0.3)',
    padding: '10px 32px 10px 12px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  tag: { fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 },
  name: { fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 3 },
  preview: {
    fontSize: 12,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  close: {
    position: 'absolute',
    top: 6,
    right: 8,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 18,
    cursor: 'pointer',
    lineHeight: 1,
    padding: 0,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    width: '100%',
    background: 'var(--accent)',
    animation: 'toastProgress 5s linear forwards',
  },
};
```

- [ ] **9.2 Adicionar keyframe de animação no index.css**

Abra `mensagens-frontend/src/index.css` e adicione ao final:
```css
@keyframes toastProgress {
  from { width: 100%; }
  to   { width: 0%; }
}
```

- [ ] **9.3 Criar ToastContainer.jsx**

Crie `mensagens-frontend/src/components/ToastContainer.jsx`:
```jsx
import { useNotificationStore } from '../store/notification.store';
import ToastNotification from './ToastNotification';

export default function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);
  if (!toasts.length) return null;

  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 20,
    right: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    zIndex: 9999,
  },
};
```

- [ ] **9.4 Adicionar ToastContainer no App.jsx**

Edite `mensagens-frontend/src/App.jsx`:
```jsx
import AppRoutes from './routes/AppRoutes'
import ToastContainer from './components/ToastContainer'

export default function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  )
}
```

- [ ] **9.5 Commit**

```bash
git add mensagens-frontend/src/components/ToastNotification.jsx \
        mensagens-frontend/src/components/ToastContainer.jsx \
        mensagens-frontend/src/App.jsx \
        mensagens-frontend/src/index.css
git commit -m "feat(frontend): add toast notification components"
```

---

## Task 10: Atualizar chat.store — unreadCount por conversa

**Files:**
- Modify: `mensagens-frontend/src/store/chat.store.js`

- [ ] **10.1 Adicionar unreadCounts e ações**

Edite `mensagens-frontend/src/store/chat.store.js` — adicione ao estado e ações:

```js
// Adicionar ao estado inicial:
unreadCounts: {}, // { [conversationId]: number }

// Adicionar estas ações:
incrementUnread: (conversationId) =>
  set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
    },
  })),

clearUnread: (conversationId) =>
  set((state) => ({
    unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
  })),
```

- [ ] **10.2 Commit**

```bash
git add mensagens-frontend/src/store/chat.store.js
git commit -m "feat(frontend): add unread count tracking per conversation"
```

---

## Task 11: Conectar socket → toast + unread

**Files:**
- Modify: `mensagens-frontend/src/store/socket.store.js`

- [ ] **11.1 Adicionar handler de newMessage no socket store**

Edite `mensagens-frontend/src/store/socket.store.js` — adicione imports:
```js
import { useChatStore } from './chat.store';
import { useNotificationStore } from './notification.store';
```

Dentro de `connect()`, após `socket.on('connect', ...)`, adicione:
```js
socket.on('newMessage', (payload) => {
  const { activeConversation, incrementUnread } = useChatStore.getState();
  const { addToast } = useNotificationStore.getState();

  const isActiveConv = activeConversation?._id === payload.conversationId;

  if (!isActiveConv) {
    incrementUnread(payload.conversationId);

    addToast({
      senderName: payload.senderName ?? 'Alguém',
      preview: 'Nova mensagem recebida',
      conversationId: payload.conversationId,
    });
  }
});
```

> **Nota:** O preview é genérico pois a mensagem é criptografada. O `senderName` precisa vir no payload do socket — ver Task 12.

- [ ] **11.2 Commit**

```bash
git add mensagens-frontend/src/store/socket.store.js
git commit -m "feat(frontend): wire newMessage socket event to toast and unread count"
```

---

## Task 12: Adicionar senderName no payload do socket (Backend)

**Files:**
- Modify: `mensagens-backend/src/server.js`

- [ ] **12.1 Incluir senderName no emit newMessage**

Em `mensagens-backend/src/server.js`, no `io.to(conversationId).emit("newMessage", {...})`, adicione `senderName`:

```js
io.to(conversationId).emit("newMessage", {
  _id: message._id,
  conversationId,
  senderId: socket.user._id,
  senderName: socket.user.name,   // ← adicionar esta linha
  cipherText,
  iv,
  createdAt: message.createdAt,
});
```

- [ ] **12.2 Commit**

```bash
git add mensagens-backend/src/server.js
git commit -m "feat(backend): include senderName in newMessage socket payload"
```

---

## Task 13: Atualizar ChatList — layout Card C com badge

**Files:**
- Modify: `mensagens-frontend/src/pages/ChatList.jsx`

- [ ] **13.1 Adicionar helper getConversationName**

No topo de `mensagens-frontend/src/pages/ChatList.jsx`, antes do componente, adicione:
```js
import { useChatStore } from '../store/chat.store'

const getConversationName = (conv, currentUserId) => {
  if (!conv?.participants?.length) return `#${conv._id?.slice(-4)}`;
  const others = conv.participants.filter(
    (p) => (p?._id ?? p) !== currentUserId && (p?._id ?? p)?.toString() !== currentUserId?.toString()
  );
  if (!others.length) return 'Você mesmo';
  return others.map((p) => p?.name ?? '?').join(' • ');
};

const formatTime = (dateStr) => {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};
```

- [ ] **13.2 Consumir unreadCounts no componente**

Dentro do componente `ChatList`, adicione:
```js
const unreadCounts = useChatStore((s) => s.unreadCounts);
const clearUnread = useChatStore((s) => s.clearUnread);
```

- [ ] **13.3 Substituir o bloco de renderização dos cards**

Substitua o mapa de conversas:
```jsx
{conversations.map(conv => {
  const name = getConversationName(conv, user?._id)
  const unread = unreadCounts[conv._id] ?? 0
  const time = formatTime(conv.lastMessage?.createdAt)
  const lastMsg = conv.lastMessage?.text || '[sem mensagens]'

  return (
    <div
      key={conv._id}
      style={{ ...styles.chatItem, ...(unread > 0 ? styles.chatItemUnread : {}) }}
      onClick={() => {
        clearUnread(conv._id)
        navigate(`/chat/${conv._id}`)
      }}
    >
      <div style={styles.chatName}>{name}</div>
      <div style={styles.chatTime}>{time}</div>
      <div style={styles.chatMsg}>{'> '}{lastMsg}</div>
      {unread > 0 && <div style={styles.badge}>{unread}</div>}
    </div>
  )
})}
```

- [ ] **13.4 Atualizar styles**

Substitua o objeto `styles` inteiro (mantendo os estilos existentes e atualizando `chatItem`):
```js
const styles = {
  // ... manter container, shell, header, identity, prompt, title,
  //     headerActions, iconButton, newChatButton, subheader, list, empty, loading
  // Atualizar:
  chatItem: {
    padding: '9px 12px',
    border: '1px solid rgba(14, 143, 61, 0.5)',
    background: 'rgba(3, 16, 11, 0.8)',
    cursor: 'pointer',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gridTemplateRows: 'auto auto',
    gap: '3px 8px',
    alignItems: 'center',
    minHeight: 52,
  },
  chatItemUnread: {
    borderColor: 'var(--accent-strong)',
  },
  chatName: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--accent)',
    gridColumn: 1,
    gridRow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chatTime: {
    fontSize: 10,
    color: 'var(--text-muted)',
    gridColumn: 2,
    gridRow: 1,
    textAlign: 'right',
    flexShrink: 0,
  },
  chatMsg: {
    fontSize: 12,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    gridColumn: 1,
    gridRow: 2,
  },
  badge: {
    gridColumn: 2,
    gridRow: 2,
    background: 'var(--accent)',
    color: '#010805',
    fontSize: 10,
    fontWeight: 700,
    borderRadius: 2,
    padding: '1px 5px',
    textAlign: 'center',
    width: 'fit-content',
    marginLeft: 'auto',
  },
}
```

- [ ] **13.5 Commit**

```bash
git add mensagens-frontend/src/pages/ChatList.jsx
git commit -m "feat(frontend): update conversation cards to compact grid layout with name and unread badge"
```

---

## Task 14: Registrar push após login

**Files:**
- Modify: `mensagens-frontend/src/store/auth.store.js`

- [ ] **14.1 Chamar registerPush após login**

Edite `mensagens-frontend/src/store/auth.store.js` — adicione import:
```js
import { registerPush } from '../utils/pushManager.js';
```

Na action `login`, após `await bootstrapCrypto(user)`, adicione:
```js
// Registrar push notifications (não bloqueia se falhar)
if (user.vapidPublicKey) {
  registerPush(user.vapidPublicKey).catch((err) =>
    console.warn('Push registration failed:', err)
  );
}
```

- [ ] **14.2 Commit**

```bash
git add mensagens-frontend/src/store/auth.store.js
git commit -m "feat(frontend): register web push subscription after login"
```

---

## Task 15: Marcar conversa ativa no Chat.jsx

**Files:**
- Modify: `mensagens-frontend/src/pages/Chat.jsx`

- [ ] **15.1 Setar activeConversation ao entrar e limpar ao sair**

Edite `mensagens-frontend/src/pages/Chat.jsx` — adicione ao destructuring do useChatStore:
```js
const { messages, fetchMessages, addMessage, updateLastMessage, markAsRead, setActiveConversation, clearUnread } = useChatStore()
```

Adicione um useEffect para setar/limpar a conversa ativa:
```js
useEffect(() => {
  setActiveConversation({ _id: conversationId })
  clearUnread(conversationId)
  return () => setActiveConversation(null)
}, [conversationId, setActiveConversation, clearUnread])
```

- [ ] **15.2 Commit**

```bash
git add mensagens-frontend/src/pages/Chat.jsx
git commit -m "feat(frontend): track active conversation to suppress toasts and clear unread"
```

---

## Task 16: Adicionar .gitignore para .superpowers e commit final

**Files:**
- Modify: `.gitignore`

- [ ] **16.1 Ignorar .superpowers**

Adicione ao `.gitignore` na raiz:
```
.superpowers/
```

- [ ] **16.2 Push**

```bash
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm dir"
git push origin main
```

---

## Self-Review

- **Spec coverage:** Cards ✓ | Toast ✓ | Web Push ✓ | VAPID ✓ | SW ✓ | Segurança ✓ | unread badge ✓
- **senderName:** adicionado no backend (Task 12) e consumido no frontend (Task 11) ✓
- **activeConversation:** setado no Chat.jsx (Task 15) e verificado no socket handler (Task 11) ✓
- **Limpeza unread:** ao clicar no card (Task 13) e ao entrar na conversa (Task 15) ✓
- **Grupos fora do escopo** — push só para participantes do DM, sem diferenciação extra ✓
