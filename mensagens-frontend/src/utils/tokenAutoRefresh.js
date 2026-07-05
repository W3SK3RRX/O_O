import { useAuthStore } from '../store/auth.store'

// Renova o access token 90s ANTES de expirar. Assim socket e requisições
// nunca pegam um token já vencido — num app de mensagens, token expirado
// significa reconexão falhando e mensagens não chegando.
const REFRESH_MARGIN_MS = 90_000
// Ao voltar o foco pro app: se faltar menos que isso para expirar (ou já
// tiver expirado), renova na hora antes que o socket tente reconectar.
const NEAR_EXPIRY_MS = 2 * 60_000

let timer = null
let started = false

// Lê o `exp` (em ms) de um JWT sem validar assinatura — só para agendar.
// Retorna null se o token for malformado ou não tiver `exp`.
function getTokenExpMs(token) {
  try {
    const [, payload] = token.split('.')
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return typeof json.exp === 'number' ? json.exp * 1000 : null
  } catch {
    return null
  }
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function refreshNow() {
  // O single-flight vive no store; se falhar, o próprio refreshAccessToken
  // faz logout. Aqui só engolimos o erro para não gerar unhandled rejection.
  useAuthStore.getState().refreshAccessToken().catch(() => {})
}

// (Re)agenda a renovação com base no exp do token atual.
function schedule() {
  clearTimer()
  const { token } = useAuthStore.getState()
  if (!token) return

  const exp = getTokenExpMs(token)
  if (!exp) return // sem exp legível: deixa o fluxo reativo (401) cuidar

  const delay = exp - Date.now() - REFRESH_MARGIN_MS
  if (delay <= 0) {
    refreshNow()
    return
  }
  timer = setTimeout(refreshNow, delay)
}

function handleVisibility() {
  if (document.visibilityState !== 'visible') return

  const { token } = useAuthStore.getState()
  if (!token) return

  // Timers de setTimeout são suspensos quando a aba/celular vai a background,
  // então ao voltar o token pode já estar perto de expirar. Renova preventivamente.
  const exp = getTokenExpMs(token)
  if (!exp || exp - Date.now() <= NEAR_EXPIRY_MS) {
    refreshNow()
  } else {
    schedule() // reagenda com o tempo restante correto
  }
}

// Inicia a renovação proativa. Idempotente — chamado uma vez no boot do app.
export function startTokenAutoRefresh() {
  if (started) return
  started = true

  // Reagenda sempre que o token mudar (login, refresh proativo ou reativo).
  // Em logout (token vira null) o schedule apenas limpa o timer.
  useAuthStore.subscribe((state, prev) => {
    if (state.token !== prev.token) schedule()
  })

  document.addEventListener('visibilitychange', handleVisibility)
  window.addEventListener('focus', handleVisibility)

  schedule()
}
