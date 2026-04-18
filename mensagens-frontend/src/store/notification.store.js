import { create } from 'zustand';

let nextId = 0;

export const useNotificationStore = create((set) => ({
  toasts: [],

  addToast: ({ title, body, conversationId }) => {
    const id = ++nextId;
    set((state) => ({
      toasts: [...state.toasts, { id, title, body, conversationId }],
    }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 5000);
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
