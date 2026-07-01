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
  }
}, { timestamps: true });

// Índice composto: serve a listagem paginada (ordena por createdAt desc) e a
// contagem de não lidas (createdAt > lastReadAt por conversa).
messageSchema.index({ conversationId: 1, createdAt: -1 });

// FIX: Exportação padrão ESM
const Message = mongoose.model('Message', messageSchema);
export default Message;