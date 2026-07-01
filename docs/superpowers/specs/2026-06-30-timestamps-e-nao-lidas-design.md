# Design — Timestamp por mensagem + Não lidas persistentes

Data: 2026-06-30
Status: aprovado para planejamento

## Contexto

App de chat (Node/Express 5/Mongoose/Socket.io + React 19/Zustand). Duas
demandas do produto:

1. Cada mensagem deve exibir data e hora de envio de forma amigável.
2. A lista de conversas deve mostrar um badge com a quantidade exata de
   mensagens não lidas por conversa.

Exploração do código revelou que **ambas já existem parcialmente**:

- `Message` usa `timestamps: true` → `createdAt` já é gravado em UTC e enviado
  no payload `newMessage`. O frontend (`MessageBubble.jsx`) já renderiza
  `[HH:MM]` via `toLocaleTimeString`.
- O badge de não lidas já é renderizado em `ChatList.jsx` a partir de
  `useChatStore.unreadCounts`, incrementado pelo listener `newMessage`.

Portanto o trabalho real é focado:

- **Timestamp:** falta a *data* (só hora é exibida) → mensagens de dias
  diferentes ficam ambíguas.
- **Não lidas:** a contagem vive **apenas na memória do navegador**. O
  `GET /conversations` não retorna `unreadCount` e nada é persistido. Ao
  recarregar a página ou logar em outro dispositivo, os badges **zeram**
  incorretamente. O schema `Message` só tem `read: boolean` (não é por-usuário,
  quebra em grupos).

## Decisões

| Tema | Decisão |
|------|---------|
| Exibição de data | Hora na bolha + separadores de dia ("Hoje"/"Ontem"/data) |
| Persistência de não lidas | Servidor é a fonte de verdade |
| Modelo de leitura | `lastReadAt` por participante na `Conversation` |
| Reforço REST | Adicionar `PATCH /conversations/:id/read` além do socket |
| Migração de dados | Backfill no deploy (zera não lidas do histórico) |
| Biblioteca de data | Nenhuma nova — usar `Intl`/`Date` nativos |

---

## Feature 1 — Timestamp com separadores de dia

### Backend
Nenhuma alteração. `createdAt` já é UTC (BSON `Date`), serializado como ISO
8601 com `Z`, e já vai no payload do socket. A conversão para o fuso local
acontece no cliente.

### Frontend
- **Novo util** `src/utils/formatDate.js` (sem dependências externas):
  - `isSameDay(a, b)` — compara ano/mês/dia no fuso local.
  - `formatDayLabel(date)` — retorna `"Hoje"`, `"Ontem"`, `"12 de junho"` ou
    `"12 de junho de 2025"` (inclui o ano quando difere do ano corrente).
    Usar `Intl.DateTimeFormat('pt-BR', ...)`.
- **Novo componente** `src/components/DaySeparator.jsx` — faixa central com o
  rótulo do dia.
- **Render da lista de mensagens** (`Chat.jsx`): ao iterar as mensagens (já
  ordenadas por `createdAt`), inserir um `<DaySeparator>` antes de toda
  mensagem cujo dia difira do da mensagem anterior.
- **Bônus:** `title` na bolha (`MessageBubble.jsx`) com data+hora completas
  para o hover. Mantém `[HH:MM]` visível como hoje.

### Isolamento
Uma função util pura + um componente de apresentação. Sem estado novo, sem
mudança de dados, testável isoladamente.

---

## Feature 2 — Não lidas persistentes (`lastReadAt` por participante)

### Schema — `Conversation` (aditivo)
```js
reads: { type: Map, of: Date, default: {} }  // { "<userId>": <lastReadAt UTC> }
```
Aditivo, sem migration destrutiva. Ausência de entrada = usuário nunca leu.

### Regra de cálculo (fonte de verdade)
```
unreadCount(user, conv) = count(Message onde
  conversationId = conv AND
  sender != user  AND
  deleted = false AND
  createdAt > reads[user]     // se não houver reads[user], conta todas
)
```

### Índice — `Message`
Adicionar índice composto `{ conversationId: 1, createdAt: -1 }`. Serve tanto a
listagem paginada (já ordena por `createdAt`) quanto a contagem de não lidas.
Não indexar `read`/`sender` isolados (baixa cardinalidade).

### Backend — mudanças
1. **`GET /conversations`** passa a devolver `unreadCount` por conversa.
   Evitar N+1 com uma única agregação sobre `Message` usando `$or` das
   condições por conversa da página (paginação ~20 → custo baixo). Conversas
   sem `reads[user]` contam todas as mensagens elegíveis.
2. **`PATCH /conversations/:conversationId/read`** (protegido): seta
   `reads[user] = new Date()` e responde `200 { unreadCount: 0 }`. Garante
   estado correto mesmo se o socket perder o evento. Valida participação do
   usuário na conversa (403 se não for participante, 404 se não existir).
3. **Socket `markConversationRead`**: além do comportamento atual, persistir
   `reads[user] = now`.
4. **`readMessage`** (individual): mantido para os ticks ✓✓.
5. **`sendMessage`**: setar `reads[sender] = now` (quem envia já leu o
   histórico anterior).

### Frontend — mudanças
- **`chat.store.js` / `fetchConversations`**: popular `unreadCounts` a partir
  do `unreadCount` retornado pelo servidor (hoje inicia vazio → some no
  reload). **Este é o conserto do bug real.**
- **Abrir conversa** (`Chat.jsx`): manter `clearUnread` local + emitir
  `markConversationRead` (agora persiste). Opcionalmente disparar o
  `PATCH .../read` como reforço.
- Badge (`ChatList.jsx`): sem mudança visual — já renderiza `unreadCounts`.

### Grupos
O modelo `lastReadAt` por participante já cobre grupos sem lógica extra.

### Deploy — backfill
Ao subir, ninguém tem `reads` → conversas antigas apareceriam com contagem
cheia. Script de backfill (idempotente) setando `reads[participante] = now`
para todos os participantes de todas as conversas. Zera o passado; a contagem
passa a valer a partir do deploy.

---

## Não incluído (YAGNI)
- Ticks de leitura por-membro em grupo (quem-leu-o-quê) — o modelo suporta no
  futuro, mas não faz parte desta entrega.
- Contadores incrementais desnormalizados — o cálculo por `createdAt` é
  suficiente no volume atual; revisar só com evidência de performance.
- Biblioteca de data (date-fns/dayjs) — `Intl` nativo atende.

## Critérios de sucesso
- Mensagens de dias diferentes exibem separador de dia legível.
- Recarregar a página ou logar em outro dispositivo mantém os badges de não
  lidas corretos.
- Abrir uma conversa zera a contagem de forma persistente (sobrevive a reload).
- Grupos contam não lidas corretamente por participante.
