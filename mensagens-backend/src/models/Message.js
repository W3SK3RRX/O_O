import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cipherText: {
    type: String, 
    required: true,
  },
  iv: {
    type: String, 
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  // Reações emoji por usuário. Um usuário pode ter no máximo uma reação por
  // emoji (toggle); vários usuários podem reagir com o mesmo emoji.
  reactions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      emoji: { type: String, required: true },
      _id: false,
    },
  ],
  // Anexos criptografados. O ciphertext fica na coleção Attachment; aqui só os
  // metadados necessários para exibir e decifrar (iv por anexo).
  attachments: [
    {
      attachmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment', required: true },
      name: { type: String, default: '' },
      mime: { type: String, default: 'application/octet-stream' },
      size: { type: Number, default: 0 },
      iv: { type: String, required: true },
      _id: false,
    },
  ],
}, { timestamps: true });

// Índice composto: serve a listagem paginada (ordena por createdAt desc) e a
// contagem de não lidas (createdAt > lastReadAt por conversa).
messageSchema.index({ conversationId: 1, createdAt: -1 });

// FIX: Exportação padrão ESM
const Message = mongoose.model('Message', messageSchema);
export default Message;