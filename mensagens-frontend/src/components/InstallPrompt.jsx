import { useState } from 'react'

const DISMISS_KEY = 'ios-install-dismissed'

function isIOS() {
  const ua = navigator.userAgent || ''
  const iOSDevice = /iphone|ipad|ipod/i.test(ua)
  // iPadOS recente se identifica como Mac com toque
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOSDevice || iPadOS
}

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

/**
 * No iOS, o Web Push só funciona quando o site é instalado na Tela de Início
 * (PWA) — não em uma aba normal do Safari. Este banner orienta o usuário a
 * instalar. Em Android/desktop não aparece (lá o push funciona direto).
 */
export default function InstallPrompt() {
  const [show, setShow] = useState(
    () => isIOS() && !isStandalone() && localStorage.getItem(DISMISS_KEY) !== '1'
  )

  if (!show) return null

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setShow(false)
  }

  return (
    <div style={styles.bar} role="status">
      <div style={styles.text}>
        📲 Para receber <strong>notificações</strong> no iPhone: toque em{' '}
        <strong>Compartilhar</strong> e em <strong>"Adicionar à Tela de Início"</strong>.
      </div>
      <button style={styles.close} onClick={dismiss} aria-label="Fechar">
        ×
      </button>
    </div>
  )
}

const styles = {
  bar: {
    position: 'fixed',
    left: 'calc(var(--safe-left) + 8px)',
    right: 'calc(var(--safe-right) + 8px)',
    bottom: 'calc(var(--safe-bottom) + 8px)',
    zIndex: 9998,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 12px',
    border: '1px solid var(--accent)',
    background: 'rgba(1, 12, 8, 0.97)',
    boxShadow: '0 0 16px rgba(0, 255, 90, 0.25)',
  },
  text: {
    flex: 1,
    fontSize: 'var(--fs-xs)',
    color: 'var(--text-main)',
    lineHeight: 1.4,
  },
  close: {
    width: 32,
    height: 32,
    flexShrink: 0,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 20,
    cursor: 'pointer',
    lineHeight: 1,
    padding: 0,
  },
}
