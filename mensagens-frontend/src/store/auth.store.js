import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { bootstrapCrypto } from '../crypto/bootstrap'
import api from '../api/axios'
import { registerPush } from '../utils/pushManager'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      // Access token vive só em memória (não persiste) — reduz superfície a XSS.
      // O refresh token fica num cookie httpOnly gerenciado pelo backend.
      token: null,
      // Enquanto true, o app tenta restaurar a sessão via cookie no boot.
      hydrating: true,
      // Promise de refresh em andamento (single-flight, fora do partialize).
      _refreshPromise: null,

      login: async (user, token, password) => {
        set({ user, token, hydrating: false })

        try {
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

      setToken: (token) => set({ token }),

      logout: () => {
        // Limpa o cookie httpOnly no servidor (best-effort) e o estado local.
        api.post('/auth/logout').catch(() => {})
        set({ user: null, token: null, hydrating: false })
      },

      // Restaura a sessão no boot: se há usuário persistido mas o access token
      // (em memória) se perdeu no reload, tenta renovar via cookie httpOnly.
      hydrate: async () => {
        if (get().token) {
          set({ hydrating: false })
          return
        }
        if (!get().user) {
          set({ hydrating: false })
          return
        }
        try {
          await get().refreshAccessToken()
        } catch {
          set({ user: null, token: null })
        } finally {
          set({ hydrating: false })
        }
      },

      refreshAccessToken: async () => {
        const inFlight = get()._refreshPromise
        if (inFlight) return inFlight

        const promise = (async () => {
          try {
            // Sem body: o refresh token vai no cookie httpOnly (withCredentials).
            const { data } = await api.post('/auth/refresh')
            set((state) => ({
              token: data.token,
              // Atualiza dados do usuário se vierem (role/avatar etc.).
              user: state.user ? { ...state.user, ...pickUser(data) } : state.user,
            }))
            return data.token
          } catch (error) {
            // Refresh falhou de verdade: encerra a sessão local.
            set({ user: null, token: null })
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
      // Persiste apenas dados não sensíveis; tokens ficam em memória/cookie.
      partialize: (state) => ({ user: state.user }),
    }
  )
)

// Extrai só os campos de usuário de uma resposta de auth (ignora token).
function pickUser(data) {
  const { token: _token, ...rest } = data
  return rest
}
