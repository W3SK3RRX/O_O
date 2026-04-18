import { useNotificationStore } from '../store/notification.store';
import ToastNotification from './ToastNotification';

export default function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
