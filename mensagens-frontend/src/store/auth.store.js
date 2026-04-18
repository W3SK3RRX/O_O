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

      login: async (user, token, refreshToken) => {
        set({ user, token, refreshToken })

        try {
          await bootstrapCrypto(user)
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
        const { refreshToken } = get()
        
        if (!refreshToken) {
          get().logout()
          throw new Error('No refresh token')
        }

        try {
          const { data } = await api.post('/auth/refresh', { refreshToken })
          
          set({ 
            token: data.token, 
            refreshToken: data.refreshToken 
          })
          
          return data.token
        } catch (error) {
          get().logout()
          throw error
        }
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
