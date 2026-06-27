import { useNotificationStore } from '../store/notification.store';
import ToastNotification from './ToastNotification';

export default function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(var(--safe-top) + 12px)',
        right: 'calc(var(--safe-right) + 12px)',
        left: 'calc(var(--safe-left) + 12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
