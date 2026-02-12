import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { bootstrapCrypto } from '../crypto/bootstrap'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      /**
       * Login oficial da aplicação
       * - Persiste user/token
       * - Inicializa identidade criptográfica (E2EE)
       */
      login: async (user, token) => {
        set({ user, token })

        try {
          await bootstrapCrypto(user)
        } catch (err) {
          console.error('Erro ao inicializar criptografia', err)
          // aqui você pode:
          // - forçar logout
          // - mostrar aviso
          // - ou bloquear uso do chat
        }
      },

      /**
       * Logout
       * (na próxima fase vamos limpar chaves de sessão)
       */
      logout: () => {
        set({ user: null, token: null })
      },
    }),
    {
      name: 'auth-storage',

      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)
