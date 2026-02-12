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

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
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
