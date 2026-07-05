import { create } from 'zustand';

const genId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `t_${Date.now()}_${Math.floor(Math.random() * 1e6)}`);

export const useNotificationStore = create((set) => ({
  toasts: [],

  addToast: ({ title, body, conversationId, type = 'info', timeout = 5000 }) => {
    const id = genId();
    set((state) => ({
      toasts: [...state.toasts, { id, title, body, conversationId, type }],
    }));
    if (timeout) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
      }, timeout);
    }
    return id;
  },

  // Atalho para feedback de erro ao usuário (substitui alert()).
  addError: (message) => {
    const id = genId();
    set((state) => ({
      toasts: [...state.toasts, { id, title: 'Erro', body: message, type: 'error' }],
    }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 6000);
    return id;
  },

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
