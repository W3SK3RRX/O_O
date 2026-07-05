import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { bootstrapCrypto } from '../crypto/bootstrap'
import api from '../api/axios'
import { registerPush } from '../utils/pushManager'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      // Promise de refresh em andamento. Não persiste (fora do partialize).
      // Garante single-flight: renovação proativa (timer), reativa (401 no axios)
      // e do socket compartilham a mesma chamada em vez de disputarem o /auth/refresh.
      _refreshPromise: null,

      login: async (user, token, refreshToken, password) => {
        set({ user, token, refreshToken })

        try {
          // A senha é usada para cifrar/recuperar o backup da chave privada (E2E).
          await bootstrapCrypto(user, password)
        } catch (err) {
          console.error('Erro ao inicializar criptografia', err)
        }

        if (user?.vapidPublicKey) {
          registerPush(user.vapidPublicKey).catch((err) =>
            console.warn('Push registration failed', err)
          )
        }
      },

      logout: () => {
        set({ user: null, token: null, refreshToken: null })
      },

      refreshAccessToken: async () => {
        // Se já há um refresh em andamento, reaproveita a mesma promise.
        const inFlight = get()._refreshPromise
        if (inFlight) return inFlight

        const { refreshToken } = get()

        if (!refreshToken) {
          get().logout()
          throw new Error('No refresh token')
        }

        const promise = (async () => {
          try {
            const { data } = await api.post('/auth/refresh', { refreshToken })

            set({
              token: data.token,
              refreshToken: data.refreshToken,
            })

            return data.token
          } catch (error) {
            get().logout()
            throw error
          } finally {
            set({ _refreshPromise: null })
          }
        })()

        set({ _refreshPromise: promise })
        return promise
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
