import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    isGroup: {
      type: Boolean,
      default: false
    },
    name: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    encryptedKeys: {
      type: Map,
      of: String,
      default: {},
    },
    keyVersion: {
      type: Number,
      default: null,
    },
    // Chave derivada (IDs ordenados) usada para impor unicidade em conversas 1-a-1.
    // Só é preenchida para conversas privadas com exatamente 2 participantes.
    participantsKey: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Índice de performance para buscar conversas de um usuário
ConversationSchema.index({ participants: 1 });

// Impede conversas 1-a-1 duplicadas entre os mesmos dois usuários (defesa contra race).
// Parcial: só aplica a documentos que possuem participantsKey (conversas privadas).
ConversationSchema.index(
  { participantsKey: 1 },
  { unique: true, partialFilterExpression: { participantsKey: { $exists: true } } }
);

// Deriva participantsKey apenas na CRIAÇÃO de conversas privadas de 2 membros.
// Restrito a documentos novos para não impor a chave retroativamente em conversas
// já existentes (evita conflitos de índice em saves de lastMessage de dados legados).
ConversationSchema.pre('validate', function () {
  if (!this.isNew) return;

  if (!this.isGroup && Array.isArray(this.participants) && this.participants.length === 2) {
    this.participantsKey = this.participants
      .map((p) => p.toString())
      .sort()
      .join('_');
  }
});

export default mongoose.model("Conversation", ConversationSchema);
