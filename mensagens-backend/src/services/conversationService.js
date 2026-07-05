import Message from '../models/Message.js';

// Conta não lidas de várias conversas em uma única agregação (sem N+1).
// Retorna Map<conversationId(string), count>. `conversations` deve ser lean.
export async function buildUnreadCounts(conversations, userId, userIdStr) {
  const counts = new Map();
  if (!conversations.length) return counts;

  const orConditions = conversations.map((conv) => {
    const cond = { conversationId: conv._id, sender: { $ne: userId } };
    const since = conv.reads?.[userIdStr];
    if (since) cond.createdAt = { $gt: since };
    return cond;
  });

  const grouped = await Message.aggregate([
    { $match: { deleted: { $ne: true }, $or: orConditions } },
    { $group: { _id: '$conversationId', count: { $sum: 1 } } },
  ]);

  for (const row of grouped) {
    counts.set(row._id.toString(), row.count);
  }

  return counts;
}

// Anexa unreadCount e myLastReadAt a uma lista de conversas lean (mutação in-place).
export async function attachUnreadCounts(conversations, userId) {
  const userIdStr = userId.toString();
  const unread = await buildUnreadCounts(conversations, userId, userIdStr);
  for (const conv of conversations) {
    conv.unreadCount = unread.get(conv._id.toString()) ?? 0;
    conv.myLastReadAt = conv.reads?.[userIdStr] ?? null;
  }
  return conversations;
}
