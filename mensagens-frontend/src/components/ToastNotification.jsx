import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../store/notification.store';

export default function ToastNotification({ toast }) {
  const navigate = useNavigate();
  const removeToast = useNotificationStore((s) => s.removeToast);

  const handleClick = () => {
    removeToast(toast.id);
    if (toast.conversationId) navigate(`/chat/${toast.conversationId}`);
  };

  return (
    <div style={styles.toast} onClick={handleClick}>
      <div style={styles.tag}>[NOVA MENSAGEM]</div>
      <div style={styles.name}>{toast.title}</div>
      {toast.body && <div style={styles.preview}>{toast.body}</div>}
      <button
        style={styles.close}
        onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
        aria-label="Fechar"
      >
        ×
      </button>
      <div style={styles.progressBar} />
    </div>
  );
}

const styles = {
  toast: {
    position: 'relative',
    width: 'min(320px, calc(100vw - 24px))',
    border: '1px solid var(--accent)',
    background: 'rgba(1,12,8,0.97)',
    boxShadow: '0 0 16px rgba(0,255,90,0.3)',
    padding: '10px 40px 14px 12px',
    cursor: 'pointer',
    overflow: 'hidden',
    pointerEvents: 'auto',
  },
  tag: { fontSize: 'var(--fs-2xs)', color: 'var(--text-muted)', marginBottom: 3 },
  name: { fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--accent)', marginBottom: 3 },
  preview: {
    fontSize: 'var(--fs-xs)',
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  close: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 32,
    height: 32,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 20,
    cursor: 'pointer',
    lineHeight: 1,
    padding: 0,
  },
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    width: '100%',
    background: 'var(--accent)',
    animation: 'toastProgress 5s linear forwards',
  },
};
