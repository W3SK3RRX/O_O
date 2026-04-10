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
  },
  {
    timestamps: true,
  }
);

/**
 * Garante que uma conversa entre os mesmos usuários
 * não seja duplicada facilmente
 */
ConversationSchema.index({ participants: 1 });

export default mongoose.model("Conversation", ConversationSchema);
