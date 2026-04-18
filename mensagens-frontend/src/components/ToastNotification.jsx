import { useNotificationStore } from '../store/notification.store';
import { useNavigate } from 'react-router-dom';

export default function ToastNotification({ toast }) {
  const removeToast = useNotificationStore((s) => s.removeToast);
  const navigate = useNavigate();

  const handleClick = () => {
    if (toast.conversationId) navigate(`/?conversation=${toast.conversationId}`);
    removeToast(toast.id);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        background: '#1e1e2e',
        border: '1px solid #313244',
        borderRadius: 12,
        padding: '12px 16px',
        minWidth: 260,
        maxWidth: 340,
        cursor: toast.conversationId ? 'pointer' : 'default',
        animation: 'toastIn 0.2s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#cdd6f4' }}>{toast.title}</p>
          {toast.body && (
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#a6adc8' }}>{toast.body}</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c7086', fontSize: 16, lineHeight: 1, padding: 0 }}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );
}
