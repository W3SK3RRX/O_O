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
    width: 280,
    border: '1px solid var(--accent)',
    background: 'rgba(1,12,8,0.97)',
    boxShadow: '0 0 16px rgba(0,255,90,0.3)',
    padding: '10px 32px 14px 12px',
    cursor: 'pointer',
    overflow: 'hidden',
  },
  tag: { fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 },
  name: { fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 3 },
  preview: {
    fontSize: 12,
    color: 'var(--text-main)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  close: {
    position: 'absolute',
    top: 6,
    right: 8,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 18,
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
