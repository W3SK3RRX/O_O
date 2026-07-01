import mongoose from 'mongoose';

// Anexo criptografado ponta-a-ponta. `data` guarda o ciphertext AES-GCM (cifrado
// no cliente com a chave da conversa); o servidor nunca vê o conteúdo em claro.
// O `iv` fica nos metadados do anexo em Message; aqui guardamos só o ciphertext
// e o mínimo para autorizar o download.
const attachmentSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mime: { type: String, default: 'application/octet-stream' },
    name: { type: String, default: '' },
    size: { type: Number, default: 0 }, // tamanho do ciphertext em bytes
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Attachment', attachmentSchema);
