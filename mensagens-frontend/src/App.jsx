import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import ToastContainer from './components/ToastContainer';
import InstallPrompt from './components/InstallPrompt';
import { startTokenAutoRefresh } from './utils/tokenAutoRefresh';
import { useAuthStore } from './store/auth.store';

export default function App() {
  useEffect(() => {
    // Restaura a sessão via cookie httpOnly (reload) e liga a renovação proativa.
    useAuthStore.getState().hydrate();
    startTokenAutoRefresh();
  }, []);

  return (
    <>
      <AppRoutes />
      <ToastContainer />
      <InstallPrompt />
    </>
  );
}
