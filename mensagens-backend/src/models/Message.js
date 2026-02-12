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
}, { timestamps: true });

// FIX: Exportação padrão ESM
const Message = mongoose.model('Message', messageSchema);
export default Message;